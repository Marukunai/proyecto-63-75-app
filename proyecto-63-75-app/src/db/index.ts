import Dexie, { Table } from 'dexie';
import { 
  UserProfile, Habit, DailyLog, WeightLog, Exercise, WorkoutLog,
  PersonalRecord, NutritionLog, SleepLog, BodyMeasurements,
  ProjectTask, JournalEntry, WeeklyReview, JapanDayLog, SyncMetadata, AppSettings
} from '../types';

const LEGACY_DATABASE_NAME = 'Proyecto6375DB';
const ACCOUNT_DATABASE_PREFIX = `${LEGACY_DATABASE_NAME}_user_`;

export class AppDatabase extends Dexie {
  appSettings!: Table<AppSettings>;
  profile!: Table<UserProfile>;
  habits!: Table<Habit>;
  dailyLogs!: Table<DailyLog>;
  weightLogs!: Table<WeightLog>;
  exercises!: Table<Exercise>;
  workoutLogs!: Table<WorkoutLog>;
  personalRecords!: Table<PersonalRecord>;
  nutritionLogs!: Table<NutritionLog>;
  sleepLogs!: Table<SleepLog>;
  bodyMeasurements!: Table<BodyMeasurements>;
  projectTasks!: Table<ProjectTask>;
  journalEntries!: Table<JournalEntry>;
  weeklyReviews!: Table<WeeklyReview>;
  japanLogs!: Table<JapanDayLog>;
  syncMetadata!: Table<SyncMetadata>;
  isApplyingRemoteSync = false;

  constructor(name = `${LEGACY_DATABASE_NAME}_guest`) {
    super(name);
    this.version(3).stores({
      profile: '++id',
      habits: 'id, category',
      dailyLogs: 'date',
      weightLogs: '++id, date',
      exercises: 'id, category',
      workoutLogs: '++id, date, exerciseId',
      personalRecords: '++id, exerciseId, date',
      nutritionLogs: '++id, date',
      sleepLogs: '++id, date',
      bodyMeasurements: '++id, date',
      projectTasks: '++id, projectId, status',
      journalEntries: '++id, date',
      weeklyReviews: '++id, weekStartDate',
      japanLogs: '++id, date'
    });

    this.version(4).stores({
      profile: '++id',
      habits: 'id, category',
      dailyLogs: 'date',
      weightLogs: '++id, date',
      exercises: 'id, category',
      workoutLogs: '++id, date, exerciseId',
      personalRecords: '++id, exerciseId, date',
      nutritionLogs: '++id, date',
      sleepLogs: '++id, date',
      bodyMeasurements: '++id, date',
      projectTasks: '++id, projectId, status',
      journalEntries: '++id, date',
      weeklyReviews: '++id, weekStartDate',
      japanLogs: '++id, date',
      syncMetadata: 'key, recordId, tableName',
    });

    this.version(5).stores({
      profile: '++id',
      habits: 'id, category',
      dailyLogs: 'date',
      weightLogs: '++id, date',
      exercises: 'id, category',
      workoutLogs: '++id, date, exerciseId',
      personalRecords: '++id, exerciseId, date',
      nutritionLogs: '++id, date',
      sleepLogs: '++id, date',
      bodyMeasurements: '++id, date',
      projectTasks: '++id, projectId, status',
      journalEntries: '++id, date',
      weeklyReviews: '++id, weekStartDate',
      japanLogs: '++id, date',
      syncMetadata: 'key, recordId, tableName',
      appSettings: 'id',
    });

    this.tables.forEach((table) => {
      if (table.name === 'syncMetadata') return;
      table.hook('creating', (_key, value) => {
        if (!this.isApplyingRemoteSync) (value as any)._updatedAt = Date.now();
      });
      table.hook('updating', (changes) => {
        if (!this.isApplyingRemoteSync) return { ...changes, _updatedAt: Date.now() };
        return changes;
      });
    });
  }
}

let activeDatabase = new AppDatabase();
let activeDatabaseName = activeDatabase.name;

export const db = new Proxy(activeDatabase, {
  get: (_target, property) => {
    const value = Reflect.get(activeDatabase, property, activeDatabase);
    return typeof value === 'function' ? value.bind(activeDatabase) : value;
  },
  set: (_target, property, value) => Reflect.set(activeDatabase, property, value, activeDatabase),
}) as AppDatabase;

export async function switchAccountDatabase(userId: string | null) {
  const nextName = userId ? `${ACCOUNT_DATABASE_PREFIX}${userId}` : `${LEGACY_DATABASE_NAME}_guest`;
  if (nextName === activeDatabaseName) return;
  activeDatabase.close();
  activeDatabase = new AppDatabase(nextName);
  activeDatabaseName = nextName;
  await activeDatabase.open();
}

export async function importLegacyDataIntoCurrentAccount() {
  const legacyDatabase = new AppDatabase(LEGACY_DATABASE_NAME);
  await legacyDatabase.open();
  const tableNames = [
    'profile', 'habits', 'dailyLogs', 'weightLogs', 'exercises', 'workoutLogs',
    'personalRecords', 'nutritionLogs', 'sleepLogs', 'bodyMeasurements',
    'projectTasks', 'journalEntries', 'weeklyReviews', 'japanLogs', 'appSettings',
  ] as const;
  const snapshots = new Map<string, unknown[]>();
  let totalRecords = 0;

  try {
    for (const name of tableNames) {
      const rows = await legacyDatabase.table(name).toArray();
      snapshots.set(name, rows);
      totalRecords += rows.length;
    }

    if (totalRecords === 0) return 0;

    await activeDatabase.transaction('rw', activeDatabase.tables, async () => {
      for (const name of tableNames) {
        const rows = snapshots.get(name) ?? [];
        if (rows.length) await activeDatabase.table(name).bulkPut(rows);
      }
    });

    await legacyDatabase.transaction('rw', legacyDatabase.tables, async () => {
      for (const name of tableNames) await legacyDatabase.table(name).clear();
    });
    return totalRecords;
  } finally {
    legacyDatabase.close();
  }
}

async function addSeedRows(table: Table<any>, rows: any[]) {
  db.isApplyingRemoteSync = true;
  try {
    await table.bulkAdd(rows.map((row) => ({ ...row, _updatedAt: 0 })));
  } finally {
    db.isApplyingRemoteSync = false;
  }
}

export async function seedInitialData() {
  const habitsCount = await db.habits.count();
  if (habitsCount === 0) {
    await addSeedRows(db.habits, [
      { id: '1', title: 'Beber agua al despertar', category: 'Cuerpo', icon: '💧', frequency: 'daily', isMinimumModeAllowed: true },
      { id: '2', title: 'Desayuno completo', category: 'Cuerpo', icon: '🍳', frequency: 'daily', isMinimumModeAllowed: true },
      { id: '3', title: 'Sesión de entrenamiento corporal / mochila', category: 'Cuerpo', icon: '🏋️', frequency: 'daily', isMinimumModeAllowed: false },
      { id: '4', title: 'Pausa de postura / movilidad frente al PC', category: 'Cuerpo', icon: '🧍', frequency: 'daily', isMinimumModeAllowed: true },
      { id: '5', title: 'Avanzar en un proyecto personal', category: 'Trabajo', icon: '🧩', frequency: 'daily', isMinimumModeAllowed: false },
      { id: '6', title: 'Lectura antes de dormir', category: 'Mente', icon: '📖', frequency: 'daily', isMinimumModeAllowed: true },
      { id: '7', title: 'Rutina de sueño y desconectar pantallas', category: 'Mente', icon: '🌙', frequency: 'daily', isMinimumModeAllowed: true },
      { id: '8', title: 'Salir a caminar o correr', category: 'Vida', icon: '🚶', frequency: 'daily', isMinimumModeAllowed: true },
      { id: '9', title: 'Dedicar tiempo a algo que disfruto', category: 'Personal', icon: '✨', frequency: 'daily', isMinimumModeAllowed: true },
    ]);
  }

  const exerciseCount = await db.exercises.count();
  if (exerciseCount === 0) {
    await addSeedRows(db.exercises, [
      { id: 'push-ups', name: 'Flexiones', category: 'Pecho', equipmentRequired: 'Ninguno' },
      { id: 'incline-push-ups', name: 'Flexiones inclinadas', category: 'Pecho', equipmentRequired: 'Superficie estable y resistente' },
      { id: 'backpack-press', name: 'Press con mochila ligera', category: 'Pecho', equipmentRequired: 'Mochila con carga ligera' },
      { id: 'backpack-row', name: 'Remo con mochila', category: 'Espalda', equipmentRequired: 'Mochila con carga' },
      { id: 'backpack-curl', name: 'Curl con mochila', category: 'Bíceps', equipmentRequired: 'Mochila con carga' },
      { id: 'triceps-extension', name: 'Extensión de tríceps con mochila ligera', category: 'Tríceps', equipmentRequired: 'Mochila con carga ligera' },
      { id: 'squats', name: 'Sentadillas', category: 'Piernas', equipmentRequired: 'Ninguno' },
      { id: 'backpack-squats', name: 'Sentadillas con mochila', category: 'Piernas', equipmentRequired: 'Mochila con carga' },
      { id: 'lunges', name: 'Zancadas', category: 'Piernas', equipmentRequired: 'Ninguno' },
      { id: 'glute-bridge', name: 'Puente de glúteo', category: 'Glúteos', equipmentRequired: 'Esterilla o superficie cómoda' },
      { id: 'plank', name: 'Plancha', category: 'Core', equipmentRequired: 'Esterilla o superficie cómoda' },
      { id: 'dead-bug', name: 'Dead bug', category: 'Core', equipmentRequired: 'Esterilla o superficie cómoda' },
      { id: 'bird-dog', name: 'Bird dog', category: 'Core', equipmentRequired: 'Esterilla o superficie cómoda' },
      { id: 'thoracic-mobility', name: 'Movilidad torácica', category: 'Movilidad', equipmentRequired: 'Esterilla o superficie cómoda' },
      { id: 'posture-break', name: 'Pausa postural y movilidad', category: 'Postura', equipmentRequired: 'Ninguno' },
    ]);
  }

  const settingsCount = await db.appSettings.count();
  if (settingsCount === 0) {
    await addSeedRows(db.appSettings, [{
      id: 'app',
      theme: 'dark',
      enabledModules: ['habits', 'workout', 'nutrition', 'sleep', 'journal', 'calendar'],
      showWeightWidget: false,
      travelName: 'Viaje',
      projects: [],
    }]);
  }
}
