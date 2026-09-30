import Dexie, { Table } from 'dexie';
import { 
  UserProfile, Habit, DailyLog, WeightLog, Exercise, WorkoutLog,
  PersonalRecord, NutritionLog, SleepLog, BodyMeasurements,
  ProjectTask, JournalEntry, WeeklyReview, JapanDayLog
} from '../types';

export class AppDatabase extends Dexie {
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

  constructor() {
    super('Proyecto6375DB');
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
  }
}

export const db = new AppDatabase();

export async function seedInitialData() {
  const profileCount = await db.profile.count();
  if (profileCount === 0) {
    await db.profile.add({
      name: 'Usuario',
      initialWeight: 63.2,
      targetWeight: 75.0,
      height: 187,
      currentPhase: 'Bloque 1 - Recuperación (Oct-Dic 2026)'
    });
  }

  const habitsCount = await db.habits.count();
  if (habitsCount === 0) {
    await db.habits.bulkAdd([
      { id: '1', title: 'Beber agua al despertar', category: 'Cuerpo', icon: '💧', frequency: 'daily', isMinimumModeAllowed: true },
      { id: '2', title: 'Desayuno completo', category: 'Cuerpo', icon: '🍳', frequency: 'daily', isMinimumModeAllowed: true },
      { id: '3', title: 'Sesión de entrenamiento corporal / mochila', category: 'Cuerpo', icon: '🏋️', frequency: 'daily', isMinimumModeAllowed: false },
      { id: '4', title: 'Pausa de postura / movilidad frente al PC', category: 'Cuerpo', icon: '🧍', frequency: 'daily', isMinimumModeAllowed: true },
      { id: '5', title: 'Avanzar en proyecto (Poker / Kaizo)', category: 'Trabajo', icon: '💻', frequency: 'daily', isMinimumModeAllowed: false },
      { id: '6', title: 'Lectura antes de dormir', category: 'Mente', icon: '📖', frequency: 'daily', isMinimumModeAllowed: true },
      { id: '7', title: 'Rutina de sueño y desconectar pantallas', category: 'Mente', icon: '🌙', frequency: 'daily', isMinimumModeAllowed: true },
    ]);
  }

  const taskCount = await db.projectTasks.count();
  if (taskCount === 0) {
    await db.projectTasks.bulkAdd([
      { projectId: 'poker', title: 'Estructurar modelos de datos iniciales', status: 'in_progress', usedFirstAttemptWithoutAI: true },
      { projectId: 'kaizo', title: 'Reunión de alineación de módulos con Aymane', status: 'backlog', usedFirstAttemptWithoutAI: false }
    ]);
  }
}