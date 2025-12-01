/**
 * Storage API Contracts
 *
 * CRUD interfaces for Capacitor Preferences API wrapper.
 * All methods are async and return Promises.
 */

import type { WorkoutSession, Exercise, Set, WorkoutExercise } from '../types/models';

/**
 * Storage interface for workout sessions
 */
export interface IWorkoutSessionStorage {
  /**
   * Get all workout sessions, sorted by date descending
   * @returns Promise<WorkoutSession[]> - Array of all sessions
   */
  getAllSessions(): Promise<WorkoutSession[]>;

  /**
   * Get a single workout session by ID
   * @param id - Session UUID
   * @returns Promise<WorkoutSession | null> - Session or null if not found
   */
  getSessionById(id: string): Promise<WorkoutSession | null>;

  /**
   * Get sessions within a date range
   * @param startDate - ISO timestamp string
   * @param endDate - ISO timestamp string
   * @returns Promise<WorkoutSession[]> - Filtered sessions
   */
  getSessionsByDateRange(startDate: string, endDate: string): Promise<WorkoutSession[]>;

  /**
   * Create a new workout session
   * @param session - Session data (id will be generated if not provided)
   * @returns Promise<WorkoutSession> - Created session with generated id
   */
  createSession(session: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutSession>;

  /**
   * Update an existing workout session
   * @param id - Session UUID
   * @param updates - Partial session data to update
   * @returns Promise<WorkoutSession> - Updated session
   * @throws Error if session not found
   */
  updateSession(id: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession>;

  /**
   * Delete a workout session
   * @param id - Session UUID
   * @returns Promise<void>
   * @throws Error if session not found
   */
  deleteSession(id: string): Promise<void>;

  /**
   * Get the previous max weight for a specific exercise
   * Used to display "前回の最大: XXkg" in workout recording
   * @param exerciseName - Exercise name to search for
   * @returns Promise<number | null> - Max weight or null if no history
   */
  getPreviousMaxWeight(exerciseName: string): Promise<number | null>;
}

/**
 * Storage interface for exercise library
 */
export interface IExerciseLibraryStorage {
  /**
   * Get all exercises from library
   * @returns Promise<Exercise[]> - Array of all library exercises
   */
  getAllExercises(): Promise<Exercise[]>;

  /**
   * Get exercises filtered by body part
   * @param bodyPart - Body part name (e.g., "胸", "背中")
   * @returns Promise<Exercise[]> - Filtered exercises
   */
  getExercisesByBodyPart(bodyPart: string): Promise<Exercise[]>;

  /**
   * Get a single exercise by ID
   * @param id - Exercise UUID
   * @returns Promise<Exercise | null> - Exercise or null if not found
   */
  getExerciseById(id: string): Promise<Exercise | null>;

  /**
   * Search exercises by name (partial match)
   * @param query - Search query
   * @returns Promise<Exercise[]> - Matching exercises
   */
  searchExercises(query: string): Promise<Exercise[]>;

  /**
   * Create a new exercise in library
   * @param exercise - Exercise data (id will be generated if not provided)
   * @returns Promise<Exercise> - Created exercise with generated id
   * @note Duplicates (same name+bodyPart) are allowed; UI should warn user before calling this
   */
  createExercise(exercise: Omit<Exercise, 'id' | 'createdAt'>): Promise<Exercise>;

  /**
   * Update an existing exercise
   * @param id - Exercise UUID
   * @param updates - Partial exercise data to update
   * @returns Promise<Exercise> - Updated exercise
   * @throws Error if exercise not found
   */
  updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise>;

  /**
   * Delete an exercise from library
   * @param id - Exercise UUID
   * @returns Promise<void>
   * @throws Error if exercise not found
   */
  deleteExercise(id: string): Promise<void>;

  /**
   * Update lastUsed timestamp for an exercise
   * Called when exercise is used in a workout
   * @param exerciseName - Exercise name
   * @returns Promise<void>
   */
  markExerciseAsUsed(exerciseName: string): Promise<void>;
}

/**
 * Low-level storage interface wrapping Capacitor Preferences API
 */
export interface IPreferencesStorage {
  /**
   * Get a value from storage
   * @param key - Storage key
   * @returns Promise<T | null> - Parsed value or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set a value in storage
   * @param key - Storage key
   * @param value - Value to store (will be JSON stringified)
   * @returns Promise<void>
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Remove a value from storage
   * @param key - Storage key
   * @returns Promise<void>
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all storage (use with caution)
   * @returns Promise<void>
   */
  clear(): Promise<void>;

  /**
   * Get all storage keys
   * @returns Promise<string[]> - Array of all keys
   */
  keys(): Promise<string[]>;
}

/**
 * Storage keys (constants)
 */
export const STORAGE_KEYS = {
  WORKOUT_SESSIONS: 'workoutSessions',
  EXERCISE_LIBRARY: 'exerciseLibrary',
  APP_SETTINGS: 'appSettings',
} as const;

/**
 * Storage error types
 */
export class StorageError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export const STORAGE_ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION',
  UNKNOWN: 'UNKNOWN',
} as const;
