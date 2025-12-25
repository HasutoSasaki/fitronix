/**
 * Custom Hook Contracts
 *
 * TypeScript interfaces for all custom React hooks.
 * Defines return types and parameters for data access hooks.
 */

import type {
  WorkoutSession,
  Exercise,
  Set,
  WorkoutExercise,
  BodyPart,
} from '../types/models';

/**
 * Workout Session Hooks
 */

export interface UseWorkoutStorageReturn {
  sessions: WorkoutSession[];
  isLoading: boolean;
  error: Error | null;
  getAllSessions: () => Promise<void>;
  getSessionById: (id: string) => Promise<WorkoutSession | null>;
  createSession: (
    session: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<WorkoutSession>;
  updateSession: (
    id: string,
    updates: Partial<WorkoutSession>
  ) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  getPreviousMaxWeight: (exerciseName: string) => Promise<number | null>;
}

export interface UseActiveWorkoutReturn {
  activeSession: WorkoutSession | null;
  isRecording: boolean;
  startSession: () => void;
  endSession: () => Promise<void>;
  addExercise: (
    exercise: Omit<WorkoutExercise, 'id' | 'sessionId' | 'sets' | 'maxWeight'>
  ) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string, set: Omit<Set, 'id' | 'completedAt'>) => void;
  removeSet: (setId: string) => void;
  updateSet: (setId: string, updates: Partial<Set>) => void;
  saveSession: () => Promise<void>;
  cancelSession: () => void;
}

/**
 * Exercise Library Hooks
 */

export interface UseExerciseLibraryReturn {
  exercises: Exercise[];
  isLoading: boolean;
  error: Error | null;
  getAllExercises: () => Promise<void>;
  getExercisesByBodyPart: (bodyPart: BodyPart) => Promise<Exercise[]>;
  searchExercises: (query: string) => Promise<Exercise[]>;
  createExercise: (
    exercise: Omit<Exercise, 'id' | 'createdAt'>
  ) => Promise<Exercise>;
  updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
}

/**
 * Timer Hooks
 */

export interface UseTimerReturn {
  isActive: boolean;
  isPaused: boolean;
  remainingTime: number;
  totalDuration: number;
  startTimer: (duration: number) => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
  skipTimer: () => Promise<void>;
}

export interface UseNotificationsReturn {
  isPermissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  scheduleNotification: (config: NotificationConfig) => Promise<number>;
  cancelNotification: (id: number) => Promise<void>;
  updateNotification: (
    id: number,
    updates: Partial<NotificationConfig>
  ) => Promise<void>;
}

export interface NotificationConfig {
  title: string;
  body: string;
  schedule?: {
    at: Date;
  };
  ongoing?: boolean;
  actions?: Array<{
    id: string;
    title: string;
  }>;
}

/**
 * UI State Hooks
 */

export interface UseKeypadReturn {
  isOpen: boolean;
  mode: 'weight' | 'reps' | null;
  currentValue: number;
  openKeypad: (mode: 'weight' | 'reps', initialValue?: number) => void;
  closeKeypad: () => void;
  setValue: (value: number) => void;
  confirmValue: (callback: (value: number) => void) => void;
}

export interface UseModalReturn {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

/**
 * Utility Hooks
 */

export interface UseDebounceReturn<T> {
  debouncedValue: T;
  isDebouncing: boolean;
}

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

export interface UsePreviousReturn<T> {
  previous: T | undefined;
}

/**
 * Form Hooks
 */

export interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: <K extends keyof T>(key: K, error: string) => void;
  clearErrors: () => void;
  touchField: <K extends keyof T>(key: K) => void;
  handleSubmit: (onValid: (values: T) => void) => void;
  reset: () => void;
}

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}
