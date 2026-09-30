import Dexie, { Table } from 'dexie';
import { UserProfile, Habit, DailyLog, WeightLog, Exercise, WorkoutLog } from '../types';

export class AppDatabase extends Dexie {
  profile!: Table<UserProfile>;
  habits!: Table<Habit>;
  dailyLogs!: Table<DailyLog>;
  weightLogs!: Table<WeightLog>;
  exercises!: Table<Exercise>;
  workoutLogs!: Table<WorkoutLog>;

  constructor() {
    super('Proyecto6375DB');
    this.version(1).stores({
      profile: '++id',
      habits: 'id, category',
      dailyLogs: 'date',
      weightLogs: '++id, date',
      exercises: 'id, category',
      workoutLogs: '++id, date, exerciseId'
    });
  }
}

export const db = new AppDatabase();

// Inicializar datos por defecto en primera ejecución
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

  const exerciseCount = await db.exercises.count();
  if (exerciseCount === 0) {
    await db.exercises.bulkAdd([
      { id: 'ex_flexiones', name: 'Flexiones clásicas', category: 'Pecho', equipmentRequired: 'Ninguno' },
      { id: 'ex_flex_inclinadas', name: 'Flexiones inclinadas en silla', category: 'Pecho', equipmentRequired: 'Silla resistente' },
      { id: 'ex_sentadillas', name: 'Sentadillas corporales / mochila', category: 'Piernas', equipmentRequired: 'Mochila (opcional)' },
      { id: 'ex_split_squat', name: 'Bulgarian Split Squat', category: 'Piernas', equipmentRequired: 'Silla resistente' },
      { id: 'ex_remo_mochila', name: 'Remo con mochila', category: 'Espalda', equipmentRequired: 'Mochila con peso' },
      { id: 'ex_curl_mochila', name: 'Curl de bíceps con mochila', category: 'Bíceps', equipmentRequired: 'Mochila con peso' },
      { id: 'ex_plancha', name: 'Plancha abdominal', category: 'Core', equipmentRequired: 'Esterilla' }
    ]);
  }

  const weightCount = await db.weightLogs.count();
  if (weightCount === 0) {
    await db.weightLogs.add({
      date: new Date().toISOString().split('T')[0],
      weightKg: 63.2,
      notes: 'Pesaje inicial de inicio de transformación.'
    });
  }
}