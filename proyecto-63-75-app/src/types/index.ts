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
  isMinimumModeAllowed: boolean; // Si este hábito aplica en Modo Mínimo
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
  equipmentRequired: string; // "Ninguno", "Mochila", "Silla"
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