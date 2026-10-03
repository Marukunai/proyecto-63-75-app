import { SupabaseClient } from '@supabase/supabase-js';
import { db } from '../db';
import { SyncMetadata } from '../types';

const SYNCED_TABLES = [
  'profile', 'habits', 'dailyLogs', 'weightLogs', 'exercises', 'workoutLogs',
  'personalRecords', 'nutritionLogs', 'sleepLogs', 'bodyMeasurements',
  'projectTasks', 'journalEntries', 'weeklyReviews', 'japanLogs', 'appSettings',
] as const;

type SyncTableName = typeof SYNCED_TABLES[number];

interface CloudRecord {
  user_id: string;
  table_name: SyncTableName;
  record_id: string;
  data: Record<string, unknown> | null;
  updated_at: number;
  is_deleted: boolean;
}

const metadataKey = (tableName: string, localKey: string | number) => `${tableName}:${String(localKey)}`;
const makeRecordId = () => crypto.randomUUID();

function getRecordTime(record: Record<string, unknown>, fallback = Date.now()) {
  const time = Number(record._updatedAt);
  return Number.isFinite(time) && time >= 0 ? time : fallback;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

async function getAllCloudRecords(client: SupabaseClient, userId: string) {
  const records: CloudRecord[] = [];
  const pageSize = 1000;

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client
      .from('user_sync_records')
      .select('user_id, table_name, record_id, data, updated_at, is_deleted')
      .eq('user_id', userId)
      .range(offset, offset + pageSize - 1);
    if (error) throw error;
    records.push(...((data ?? []) as CloudRecord[]));
    if (!data || data.length < pageSize) break;
  }

  return records;
}

const activeSyncs = new Map<string, Promise<{ downloaded: number; uploaded: number }>>();

export function syncLocalData(client: SupabaseClient, userId: string) {
  const activeSync = activeSyncs.get(userId);
  if (activeSync) return activeSync;

  const sync = performSync(client, userId).finally(() => {
    if (activeSyncs.get(userId) === sync) activeSyncs.delete(userId);
  });
  activeSyncs.set(userId, sync);
  return sync;
}

async function performSync(client: SupabaseClient, userId: string) {
  const cloudRecords = await getAllCloudRecords(client, userId);
  const cloudById = new Map(cloudRecords.map((record) => [`${record.table_name}:${record.record_id}`, record]));
  const queued = new Map<string, CloudRecord>();
  let downloaded = 0;
  let uploaded = 0;

  await db.transaction('rw', db.tables, async () => {
    db.isApplyingRemoteSync = true;
    try {
      const metadata = await db.syncMetadata.toArray();
      const metadataByKey = new Map(metadata.map((item) => [item.key, item]));
      const knownCloudIds = new Set(metadata.map((item) => `${item.tableName}:${item.recordId}`));

      // Bring down records first. Natural-key tables (habits, exercises, and daily logs)
      // merge into their existing local rows; auto-increment tables get a local key.
      for (const cloud of cloudRecords) {
        const cloudId = `${cloud.table_name}:${cloud.record_id}`;
        if (knownCloudIds.has(cloudId)) continue;

        const table = db.table(cloud.table_name);
        const primaryKey = table.schema.primKey.keyPath;
        let localRecord: any;
        let localKey: string | number | undefined;

        if (cloud.table_name === 'profile') {
          localRecord = await table.toCollection().first();
          localKey = localRecord?.[primaryKey as string];
        } else if (cloud.table_name === 'projectTasks' && cloud.data) {
          const projectTasks = await table.where('projectId').equals(cloud.data.projectId as string).toArray();
          localRecord = projectTasks.find((task: any) => task.title === cloud.data?.title);
          localKey = localRecord?.[primaryKey as string];
        } else if (cloud.data && !table.schema.primKey.auto && typeof primaryKey === 'string') {
          localKey = cloud.data[primaryKey] as string | number;
          localRecord = await table.get(localKey);
        }

        if (cloud.is_deleted || !cloud.data) {
          if (localRecord && localKey !== undefined) {
            const localTime = getRecordTime(localRecord, 0);
            const key = metadataKey(cloud.table_name, localKey);
            const item: SyncMetadata = {
              key,
              tableName: cloud.table_name,
              localKey,
              recordId: cloud.record_id,
              updatedAt: cloud.updated_at,
              data: cloud.data ?? undefined,
              deleted: cloud.updated_at > localTime,
            };
            if (item.deleted) {
              await table.delete(localKey);
              downloaded++;
            }
            await db.syncMetadata.put(item);
            metadataByKey.set(key, item);
            knownCloudIds.add(cloudId);
          }
          continue;
        }

        if (localRecord) {
          const naturalKey = metadataKey(cloud.table_name, localKey as string | number);
          const existingMetadata = metadataByKey.get(naturalKey);
          if (existingMetadata && existingMetadata.recordId !== cloud.record_id) {
            const localTime = getRecordTime(localRecord, 0);
            if (cloud.updated_at > localTime) {
              const incoming: Record<string, unknown> = { ...cloud.data, _updatedAt: cloud.updated_at };
              if (table.schema.primKey.auto && typeof primaryKey === 'string') incoming[primaryKey] = localKey;
              await table.put(incoming);
              downloaded++;
            }
            const tombstoneTime = Date.now();
            queued.set(cloudId, {
              user_id: userId,
              table_name: cloud.table_name,
              record_id: cloud.record_id,
              data: cloud.data,
              updated_at: tombstoneTime,
              is_deleted: true,
            });
            continue;
          }

          const localTime = getRecordTime(localRecord, 0);
          if (cloud.updated_at > localTime) {
            const incoming: Record<string, unknown> = { ...cloud.data, _updatedAt: cloud.updated_at };
            if (table.schema.primKey.auto && typeof primaryKey === 'string') incoming[primaryKey] = localKey;
            await table.put(incoming);
            downloaded++;
          }
        } else {
          const incoming = { ...cloud.data, _updatedAt: cloud.updated_at } as Record<string, unknown>;
          if (table.schema.primKey.auto && typeof primaryKey === 'string') delete incoming[primaryKey];
          localKey = await table.add(incoming) as string | number;
          downloaded++;
        }

        if (localKey !== undefined) {
          const item: SyncMetadata = {
            key: metadataKey(cloud.table_name, localKey),
            tableName: cloud.table_name,
            localKey,
            recordId: cloud.record_id,
            updatedAt: cloud.updated_at,
            data: cloud.data,
            deleted: false,
          };
          await db.syncMetadata.put(item);
          metadataByKey.set(item.key, item);
          knownCloudIds.add(cloudId);
        }
      }

      for (const tableName of SYNCED_TABLES) {
        const table = db.table(tableName);
        const primaryKey = table.schema.primKey.keyPath;
        if (typeof primaryKey !== 'string') throw new Error(`Clave primaria no compatible en ${tableName}.`);

        const rows = await table.toArray() as Array<Record<string, unknown>>;
        const localKeys = new Set<string>();

        for (const row of rows) {
          const localKey = row[primaryKey] as string | number;
          const key = metadataKey(tableName, localKey);
          localKeys.add(key);
          let item = metadataByKey.get(key);

          if (!item) {
            item = {
              key,
              tableName,
              localKey,
              recordId: makeRecordId(),
              updatedAt: getRecordTime(row),
              data: row,
              deleted: false,
            };
            await db.syncMetadata.put(item);
            metadataByKey.set(key, item);
          }

          const cloudId = `${tableName}:${item.recordId}`;
          const cloud = cloudById.get(cloudId);
          const localTime = getRecordTime(row, item.updatedAt);

          if (cloud && !cloud.is_deleted && cloud.data && stableJson(cloud.data) === stableJson(row)) {
            item.updatedAt = Math.max(item.updatedAt, cloud.updated_at, localTime);
            item.data = row;
            item.deleted = false;
            await db.syncMetadata.put(item);
            continue;
          }

          if (cloud?.is_deleted && cloud.updated_at > localTime) {
            await table.delete(localKey);
            item.deleted = true;
            item.updatedAt = cloud.updated_at;
            item.data = cloud.data ?? undefined;
            await db.syncMetadata.put(item);
            downloaded++;
            continue;
          }

          if (cloud && !cloud.is_deleted && cloud.data && cloud.updated_at > localTime) {
            const incoming: Record<string, unknown> = { ...cloud.data, _updatedAt: cloud.updated_at };
            if (table.schema.primKey.auto) incoming[primaryKey] = localKey;
            await table.put(incoming);
            item.updatedAt = cloud.updated_at;
            item.data = cloud.data;
            item.deleted = false;
            await db.syncMetadata.put(item);
            downloaded++;
            continue;
          }

          const record: CloudRecord = {
            user_id: userId,
            table_name: tableName,
            record_id: item.recordId,
            data: row,
            updated_at: localTime,
            is_deleted: false,
          };
          queued.set(cloudId, record);
          item.updatedAt = localTime;
          item.data = row;
          item.deleted = false;
          await db.syncMetadata.put(item);
        }

        // A missing local row with sync metadata represents a local deletion.
        for (const item of metadataByKey.values()) {
          if (item.tableName !== tableName || localKeys.has(item.key)) continue;
          const cloudId = `${tableName}:${item.recordId}`;
          if (item.deleted) {
            const existingCloudRecord = cloudById.get(cloudId);
            if (!existingCloudRecord?.is_deleted || existingCloudRecord.updated_at < item.updatedAt) {
              queued.set(cloudId, {
                user_id: userId,
                table_name: tableName,
                record_id: item.recordId,
                data: item.data ?? null,
                updated_at: item.updatedAt,
                is_deleted: true,
              });
            }
            continue;
          }
          const deletedAt = Date.now();
          queued.set(cloudId, {
            user_id: userId,
            table_name: tableName,
            record_id: item.recordId,
            data: item.data ?? null,
            updated_at: deletedAt,
            is_deleted: true,
          });
          item.updatedAt = deletedAt;
          item.deleted = true;
          await db.syncMetadata.put(item);
        }
      }
    } finally {
      db.isApplyingRemoteSync = false;
    }
  });

  const changes = [...queued.values()];
  const batchSize = 300;
  for (let offset = 0; offset < changes.length; offset += batchSize) {
    const { error } = await client
      .from('user_sync_records')
      .upsert(changes.slice(offset, offset + batchSize), {
        onConflict: 'user_id,table_name,record_id',
      });
    if (error) throw error;
    uploaded += Math.min(batchSize, changes.length - offset);
  }

  return { downloaded, uploaded };
}
