export interface UserProfile {
  id?: number;
  name: string;
  initialWeight: number; // 63.2
  targetWeight: number;  // 75.0
  height: number;        // 187 cm
  currentPhase: string;  // "Bloque 1 - Recuperación"
}

export interface Habit {
  id: string;
  title: string;
  category: 'Cuerpo' | 'Mente' | 'Trabajo' | 'Vida' | 'Personal';
  icon: string;
  frequency: 'daily' | 'weekly';
  isMinimumModeAllowed: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  isMinimumMode: boolean;
  completedHabits: string[]; // Habit IDs
  notes?: string;
}

export interface WeightLog {
  id?: number;
  date: string; // YYYY-MM-DD
  weightKg: number;
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'Pecho' | 'Espalda' | 'Hombros' | 'Bíceps' | 'Tríceps' | 'Piernas' | 'Core' | 'Movilidad';
  equipmentRequired: string;
}

export interface WorkoutSet {
  reps: number;
  weightKg?: number;
}

export interface WorkoutLog {
  id?: number;
  date: string;
  exerciseId: string;
  sets: WorkoutSet[];
}

// --- FASE 2 EXTENSIONES ---

export interface PersonalRecord {
  id?: number;
  exerciseId: string;
  recordValue: string; // Ej: "25 reps", "22 kg mochila"
  date: string;
  notes?: string;
}

export interface NutritionLog {
  id?: number;
  date: string; // YYYY-MM-DD
  mealName: string; // Ej: "Desayuno", "Comida", "Merienda"
  description: string;
  approxProteinGrams?: number;
  approxCalories?: number;
}

export interface SleepLog {
  id?: number;
  date: string; // YYYY-MM-DD
  bedTime?: string; // "01:30"
  wakeTime?: string; // "09:30"
  hoursSlept: number;
  quality: 1 | 2 | 3 | 4 | 5; // 1 (malo) a 5 (excelente)
  hadMelatonin?: boolean;
  hadCaffeineLate?: boolean;
  notes?: string;
}

export interface BodyMeasurements {
  id?: number;
  date: string; // YYYY-MM-DD
  bicepsCm?: number;
  chestCm?: number;
  shouldersCm?: number;
  waistCm?: number;
  thighCm?: number;
  calvesCm?: number;
}