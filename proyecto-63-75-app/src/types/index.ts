export interface UserProfile {
  id?: number;
  name: string;
  initialWeight?: number;
  targetWeight?: number;
  height?: number;
  currentPhase?: string;
}

export interface AppSettings {
  id: 'app';
  theme: 'dark' | 'warm' | 'light';
  enabledModules: string[];
  showWeightWidget: boolean;
  travelName: string;
  projects: string[];
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
  completedHabits: string[];
  notes?: string;
}

export interface WeightLog {
  id?: number;
  date: string;
  weightKg: number;
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'Pecho' | 'Espalda' | 'Hombros' | 'Bíceps' | 'Tríceps' | 'Piernas' | 'Glúteos' | 'Core' | 'Movilidad' | 'Postura';
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

export interface PersonalRecord {
  id?: number;
  exerciseId: string;
  recordValue: string;
  date: string;
  notes?: string;
}

export interface NutritionLog {
  id?: number;
  date: string;
  mealName: string;
  description: string;
  approxProteinGrams?: number;
  approxCalories?: number;
}

export interface SleepLog {
  id?: number;
  date: string;
  bedTime?: string;
  wakeTime?: string;
  hoursSlept: number;
  quality: 1 | 2 | 3 | 4 | 5;
  hadMelatonin?: boolean;
  hadCaffeineLate?: boolean;
  notes?: string;
}

export interface BodyMeasurements {
  id?: number;
  date: string;
  bicepsCm?: number;
  chestCm?: number;
  waistCm?: number;
}

// --- FASE 3 EXTENSIONES ---

export interface ProjectTask {
  id?: number;
  projectId: 'poker' | 'kaizo' | string;
  title: string;
  status: 'backlog' | 'in_progress' | 'blocked' | 'completed';
  timeSpentMinutes?: number;
  usedFirstAttemptWithoutAI?: boolean; // Hábito "Intento primero"
  notes?: string;
}

export interface JournalEntry {
  id?: number;
  date: string; // YYYY-MM-DD
  content: string;
  moodTags: string[]; // Ej: "Trabajo", "Familia", "Salud", "Ánimo Alto"
}

export interface WeeklyReview {
  id?: number;
  weekStartDate: string; // YYYY-MM-DD
  whatWentWell: string;
  whatWentWrong: string;
  whatILearned: string;
  nextWeekPriority: string;
}

export interface JapanDayLog {
  id?: number;
  date: string;
  tripName?: string;
  location: string; // Ej: "Hong Kong", "Tokio", "Kioto", "Fuji"
  stepsCount?: number;
  isTourismDay: boolean;
  isRestDay: boolean;
  notes?: string;
}

export interface SyncMetadata {
  key: string;
  tableName: string;
  localKey: string | number;
  recordId: string;
  updatedAt: number;
  data?: Record<string, unknown>;
  deleted?: boolean;
}
