import { db } from '../db';
import { getLocalDateString } from '../utils/dates';

const backupTables = [
  'profile',
  'habits',
  'dailyLogs',
  'weightLogs',
  'exercises',
  'workoutLogs',
  'personalRecords',
  'nutritionLogs',
  'sleepLogs',
  'bodyMeasurements',
  'projectTasks',
  'journalEntries',
  'weeklyReviews',
  'japanLogs',
  'appSettings',
] as const;

export async function exportDataToJSON() {
  const [profile, habits, dailyLogs, weightLogs, exercises, workoutLogs, personalRecords,
    nutritionLogs, sleepLogs, bodyMeasurements, projectTasks, journalEntries, weeklyReviews, japanLogs, appSettings] = await Promise.all([
    db.profile.toArray(),
    db.habits.toArray(),
    db.dailyLogs.toArray(),
    db.weightLogs.toArray(),
    db.exercises.toArray(),
    db.workoutLogs.toArray(),
    db.personalRecords.toArray(),
    db.nutritionLogs.toArray(),
    db.sleepLogs.toArray(),
    db.bodyMeasurements.toArray(),
    db.projectTasks.toArray(),
    db.journalEntries.toArray(),
    db.weeklyReviews.toArray(),
    db.japanLogs.toArray(),
    db.appSettings.toArray(),
  ]);

  const fullData = {
    formatVersion: 2,
    exportDate: new Date().toISOString(),
    profile,
    habits,
    dailyLogs,
    weightLogs,
    exercises,
    workoutLogs,
    personalRecords,
    nutritionLogs,
    sleepLogs,
    bodyMeasurements,
    projectTasks,
    journalEntries,
    weeklyReviews,
    japanLogs,
    appSettings,
  };

  const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `proyecto-63-75-backup-${getLocalDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importDataFromJSON(file: File): Promise<boolean> {
  try {
    const text = await file.text();
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;

    const data = parsed as Record<string, unknown>;
    if (backupTables.some((table) => data[table] !== undefined && !Array.isArray(data[table]))) {
      return false;
    }
    if (!backupTables.some((table) => Array.isArray(data[table]))) return false;

    // Import all provided tables together so an invalid record cannot leave a partial restore.
    await db.transaction(
      'rw',
      db.tables,
      async () => {
        if (data.profile) await db.profile.bulkPut(data.profile as any[]);
        if (data.habits) await db.habits.bulkPut(data.habits as any[]);
        if (data.dailyLogs) await db.dailyLogs.bulkPut(data.dailyLogs as any[]);
        if (data.weightLogs) await db.weightLogs.bulkPut(data.weightLogs as any[]);
        if (data.exercises) await db.exercises.bulkPut(data.exercises as any[]);
        if (data.workoutLogs) await db.workoutLogs.bulkPut(data.workoutLogs as any[]);
        if (data.personalRecords) await db.personalRecords.bulkPut(data.personalRecords as any[]);
        if (data.nutritionLogs) await db.nutritionLogs.bulkPut(data.nutritionLogs as any[]);
        if (data.sleepLogs) await db.sleepLogs.bulkPut(data.sleepLogs as any[]);
        if (data.bodyMeasurements) await db.bodyMeasurements.bulkPut(data.bodyMeasurements as any[]);
        if (data.projectTasks) await db.projectTasks.bulkPut(data.projectTasks as any[]);
        if (data.journalEntries) await db.journalEntries.bulkPut(data.journalEntries as any[]);
        if (data.weeklyReviews) await db.weeklyReviews.bulkPut(data.weeklyReviews as any[]);
        if (data.japanLogs) await db.japanLogs.bulkPut(data.japanLogs as any[]);
        if (data.appSettings) await db.appSettings.bulkPut(data.appSettings as any[]);
      }
    );

    return true;
  } catch (err) {
    console.error('Error al importar copia de seguridad:', err);
    return false;
  }
}
