/**
 * Core data models for Workout Tracker
 * Based on specs/001-workout-tracker/data-model.md
 */

/**
 * Predefined body parts for exercise categorization
 */
export const BodyPart = {
  CHEST: '胸',
  BACK: '背中',
  LEGS: '脚',
  SHOULDERS: '肩',
  ARMS: '腕',
  ABS: '腹筋',
  OTHER: 'その他',
} as const;

export type BodyPart = (typeof BodyPart)[keyof typeof BodyPart];

/**
 * One set of an exercise (weight × reps)
 */
export interface Set {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Parent exercise ID */
  exerciseId: string;
  /** Weight in kg (>= 0, allows decimals for 2.5kg increments) */
  weight: number;
  /** Repetitions (>= 1, integer only) */
  reps: number;
  /** Completion timestamp (ISO 8601) */
  completedAt: string;
  /** Order within exercise (>= 0) */
  order: number;
}

/**
 * Instance of an exercise within a specific workout session
 */
export interface WorkoutExercise {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Parent session ID */
  sessionId: string;
  /** Reference to Exercise library (optional) */
  exerciseId?: string;
  /** Exercise name (denormalized, 1-100 chars) */
  exerciseName: string;
  /** Body part (denormalized) */
  bodyPart: BodyPart;
  /** Sets performed (min 1 set) */
  sets: Set[];
  /** Calculated max weight from sets (derived field) */
  maxWeight?: number;
  /** Order in session (>= 0) */
  order: number;
}

/**
 * Single training session (one day's workout)
 */
export interface WorkoutSession {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Session date (ISO 8601 timestamp) */
  date: string;
  /** Exercises in this session (min 1 exercise) */
  exercises: WorkoutExercise[];
  /** Duration in seconds (>= 0) */
  totalTime?: number;
  /** Creation timestamp (ISO 8601) */
  createdAt: string;
  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
}

/**
 * Reusable exercise definition in user's library
 */
export interface Exercise {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Exercise name (1-100 chars) */
  name: string;
  /** Body part */
  bodyPart: BodyPart;
  /** Reference video URL (valid URL or empty) */
  videoUrl?: string;
  /** Creation timestamp (ISO 8601) */
  createdAt: string;
  /** Last time used in workout (ISO 8601) */
  lastUsed?: string;
}

/**
 * Predefined timer durations for rest between sets
 */
export interface TimerPreset {
  /** Unique identifier (e.g., "short", "medium", "long", "custom") */
  id: string;
  /** Duration in seconds (>= 30, <= 600) */
  duration: number;
  /** Display name (Japanese label) */
  name: string;
}

/**
 * Timer state (not persisted to storage, only in Zustand)
 */
export interface TimerState {
  /** Timer is running */
  isActive: boolean;
  /** Timer is paused */
  isPaused: boolean;
  /** Seconds remaining */
  remainingTime: number;
  /** Active notification ID */
  notificationId?: number;
  /** Selected preset ID */
  presetId?: string;
}

/**
 * Predefined timer presets (hardcoded in MVP)
 */
export const TIMER_PRESETS: TimerPreset[] = [
  { id: 'short', duration: 60, name: '短い休憩 (60秒)' },
  { id: 'medium', duration: 90, name: '普通の休憩 (90秒)' },
  { id: 'long', duration: 120, name: '長い休憩 (120秒)' },
  { id: 'custom', duration: 30, name: 'カスタム' },
];
