import { db } from '../db';

export async function exportDataToJSON() {
  const profile = await db.profile.toArray();
  const habits = await db.habits.toArray();
  const dailyLogs = await db.dailyLogs.toArray();
  const weightLogs = await db.weightLogs.toArray();
  const workoutLogs = await db.workoutLogs.toArray();
  const nutritionLogs = await db.nutritionLogs.toArray();
  const sleepLogs = await db.sleepLogs.toArray();
  const bodyMeasurements = await db.bodyMeasurements.toArray();
  const projectTasks = await db.projectTasks.toArray();
  const journalEntries = await db.journalEntries.toArray();

  const fullData = {
    exportDate: new Date().toISOString(),
    profile,
    habits,
    dailyLogs,
    weightLogs,
    workoutLogs,
    nutritionLogs,
    sleepLogs,
    bodyMeasurements,
    projectTasks,
    journalEntries,
  };

  const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `proyecto-63-75-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importDataFromJSON(file: File): Promise<boolean> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (data.habits) await db.habits.bulkPut(data.habits);
    if (data.dailyLogs) await db.dailyLogs.bulkPut(data.dailyLogs);
    if (data.weightLogs) await db.weightLogs.bulkPut(data.weightLogs);
    if (data.workoutLogs) await db.workoutLogs.bulkPut(data.workoutLogs);
    if (data.nutritionLogs) await db.nutritionLogs.bulkPut(data.nutritionLogs);
    if (data.sleepLogs) await db.sleepLogs.bulkPut(data.sleepLogs);
    if (data.bodyMeasurements) await db.bodyMeasurements.bulkPut(data.bodyMeasurements);
    if (data.projectTasks) await db.projectTasks.bulkPut(data.projectTasks);
    if (data.journalEntries) await db.journalEntries.bulkPut(data.journalEntries);

    return true;
  } catch (err) {
    console.error('Error al importar copia de seguridad:', err);
    return false;
  }
}