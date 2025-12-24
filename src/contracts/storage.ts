/**
 * Storage Layer Contracts
 *
 * These interfaces define the contract that storage implementations MUST satisfy.
 * All implementations are tested via contract tests in tests/contract/storage/*.test.ts
 *
 * Design Principles:
 * - Technology-agnostic: Interfaces don't expose SQLite details
 * - Async-first: All methods return Promises for flexibility
 * - Immutable: Methods return new objects, never mutate inputs
 * - Type-safe: Leverage TypeScript for compile-time safety
 */

import type {
  WorkoutSession,
  Exercise,
  BodyPart,
} from '../types/models';

/**
 * Workout Session Storage Contract
 *
 * Responsible for CRUD operations on workout sessions and related entities
 * (exercises and sets). Ensures referential integrity via cascade operations.
 */
export interface IWorkoutSessionStorage {
  /**
   * Get all workout sessions, sorted by date descending (most recent first)
   *
   * @returns All sessions with nested exercises and sets
   *
   * @example
   * const sessions = await storage.getAllSessions();
   * // Returns: [{ id: 'session1', date: '2025-11-29', exercises: [...] }, ...]
   */
  getAllSessions(): Promise<WorkoutSession[]>;

  /**
   * Get a single workout session by ID
   *
   * @param id - Session UUID
   * @returns Session with nested exercises and sets, or null if not found
   *
   * @example
   * const session = await storage.getSessionById('session-uuid');
   * // Returns: { id: 'session-uuid', date: '2025-11-29', exercises: [...] }
   */
  getSessionById(id: string): Promise<WorkoutSession | null>;

  /**
   * Get workout sessions within a date range
   *
   * @param startDate - Start of range (ISO 8601)
   * @param endDate - End of range (ISO 8601)
   * @returns Sessions within range, sorted by date descending
   *
   * @example
   * const sessions = await storage.getSessionsByDateRange(
   *   '2025-11-26T00:00:00.000Z',
   *   '2025-11-28T23:59:59.999Z'
   * );
   * // Returns sessions from Nov 26-28
   */
  getSessionsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<WorkoutSession[]>;

  /**
   * Create a new workout session
   *
   * Auto-generates UUIDs for session, exercises, and sets.
   * Sets createdAt and updatedAt timestamps.
   *
   * @param data - Session data (without id, createdAt, updatedAt)
   * @returns Created session with generated fields
   *
   * @example
   * const session = await storage.createSession({
   *   date: '2025-11-29T10:00:00.000Z',
   *   exercises: [
   *     {
   *       id: 'ex1',
   *       sessionId: '',  // Will be auto-filled
   *       exerciseName: 'ベンチプレス',
   *       bodyPart: '胸',
   *       sets: [{ id: 'set1', exerciseId: 'ex1', weight: 80, reps: 10, ... }],
   *       order: 0
   *     }
   *   ]
   * });
   * // Returns: { id: 'generated-uuid', date: '...', exercises: [...], createdAt: '...', updatedAt: '...' }
   */
  createSession(
    data: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkoutSession>;

  /**
   * Update an existing workout session
   *
   * Only updates provided fields. Auto-updates `updatedAt` timestamp.
   *
   * @param id - Session UUID
   * @param data - Partial session data to update
   * @returns Updated session
   * @throws Error if session not found
   *
   * @example
   * const updated = await storage.updateSession('session-uuid', {
   *   totalTime: 3600  // Update only totalTime
   * });
   * // Returns: { id: 'session-uuid', totalTime: 3600, updatedAt: 'new-timestamp', ... }
   */
  updateSession(
    id: string,
    data: Partial<Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<WorkoutSession>;

  /**
   * Delete a workout session
   *
   * Cascades to delete all related exercises and sets.
   *
   * @param id - Session UUID
   * @throws Error if session not found
   *
   * @example
   * await storage.deleteSession('session-uuid');
   * // Deletes session + all exercises + all sets
   */
  deleteSession(id: string): Promise<void>;

  /**
   * Get previous maximum weight for an exercise by name
   *
   * Searches across all past sessions to find the highest weight
   * ever lifted for this exercise.
   *
   * **Implementation Requirement**: Implementations MUST perform case-insensitive
   * comparison for ASCII/English characters (e.g., "Bench Press" matches "bench press").
   * For SQLite implementations, use `COLLATE NOCASE` in queries. Note that Japanese
   * and other non-ASCII scripts are compared as-is (they have no case concept).
   *
   * @param exerciseName - Exercise name (case-insensitive for ASCII/English)
   * @returns Max weight in kg, or null if no history
   *
   * @example
   * const maxWeight = await storage.getPreviousMaxWeight('ベンチプレス');
   * // Returns: 82.5 (if user's previous max was 82.5kg)
   * // Also matches: 'べんちぷれす' (exact match), but not different case for Japanese
   */
  getPreviousMaxWeight(exerciseName: string): Promise<number | null>;
}

/**
 * Exercise Library Storage Contract
 *
 * Manages the user's exercise library - reusable exercise definitions
 * with optional video references.
 */
export interface IExerciseLibraryStorage {
  /**
   * Get all exercises from library
   *
   * @returns All library exercises, sorted by lastUsed descending
   *
   * @example
   * const exercises = await storage.getAllExercises();
   * // Returns: [{ id: 'ex1', name: 'ベンチプレス', bodyPart: '胸', ... }, ...]
   */
  getAllExercises(): Promise<Exercise[]>;

  /**
   * Get a single exercise by ID
   *
   * @param id - Exercise UUID
   * @returns Exercise or null if not found
   *
   * @example
   * const exercise = await storage.getExerciseById('ex-uuid');
   * // Returns: { id: 'ex-uuid', name: 'スクワット', bodyPart: '脚', ... }
   */
  getExerciseById(id: string): Promise<Exercise | null>;

  /**
   * Get exercises filtered by body part
   *
   * @param bodyPart - Body part to filter by
   * @returns Exercises for specified body part
   *
   * @example
   * const chestExercises = await storage.getExercisesByBodyPart('胸');
   * // Returns: [{ name: 'ベンチプレス', ... }, { name: 'ダンベルフライ', ... }]
   */
  getExercisesByBodyPart(bodyPart: BodyPart): Promise<Exercise[]>;

  /**
   * Create a new exercise in library
   *
   * Auto-generates UUID and sets createdAt timestamp.
   *
   * @param data - Exercise data (without id, createdAt, lastUsed)
   * @returns Created exercise
   *
   * @example
   * const exercise = await storage.createExercise({
   *   name: 'デッドリフト',
   *   bodyPart: '背中',
   *   videoUrl: 'https://youtube.com/watch?v=...'
   * });
   * // Returns: { id: 'generated-uuid', name: 'デッドリフト', createdAt: '...', ... }
   */
  createExercise(
    data: Omit<Exercise, 'id' | 'createdAt' | 'lastUsed'>
  ): Promise<Exercise>;

  /**
   * Update an existing exercise in library
   *
   * Only updates provided fields.
   *
   * @param id - Exercise UUID
   * @param data - Partial exercise data to update
   * @returns Updated exercise
   * @throws Error if exercise not found
   *
   * @example
   * const updated = await storage.updateExercise('ex-uuid', {
   *   videoUrl: 'https://youtube.com/watch?v=new-video'
   * });
   * // Returns: { id: 'ex-uuid', videoUrl: 'new-video', ... }
   */
  updateExercise(
    id: string,
    data: Partial<Omit<Exercise, 'id' | 'createdAt'>>
  ): Promise<Exercise>;

  /**
   * Delete an exercise from library
   *
   * Does NOT cascade to workout_exercises (historical data preserved).
   * Only removes from library.
   *
   * @param id - Exercise UUID
   * @throws Error if exercise not found
   *
   * @example
   * await storage.deleteExercise('ex-uuid');
   * // Deletes from library, but past workouts still show the exercise name
   */
  deleteExercise(id: string): Promise<void>;

}


/**
 * Type Guards
 *
 * Helper functions to validate data types at runtime.
 */

/**
 * Check if value is a valid BodyPart
 */
export function isBodyPart(value: unknown): value is BodyPart {
  const validBodyParts = ['胸', '背中', '脚', '肩', '腕', '腹筋', 'その他'];
  return typeof value === 'string' && validBodyParts.includes(value);
}

/**
 * Check if value is a valid ISO 8601 timestamp
 * Supports date-only (YYYY-MM-DD) and full datetime with optional fractional seconds and either Z or timezone offset
 */
export function isISO8601(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const iso8601Regex =
    /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2}))?$/;
  return iso8601Regex.test(value);
}

/**
 * Check if value is a valid UUID v4
 */
export function isUUIDv4(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const uuidv4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Regex.test(value);
}

/**
 * Contract Test Checklist
 *
 * All implementations MUST pass these contract tests:
 *
 * IWorkoutSessionStorage:
 * - ✅ getAllSessions() returns empty array when no sessions exist
 * - ✅ getAllSessions() returns all sessions sorted by date DESC
 * - ✅ getSessionById() returns null when session doesn't exist
 * - ✅ getSessionById() returns session when it exists
 * - ✅ getSessionsByDateRange() filters sessions within range
 * - ✅ createSession() generates UUID for new session
 * - ✅ createSession() sets createdAt and updatedAt timestamps
 * - ✅ createSession() preserves all exercise and set data
 * - ✅ updateSession() updates session fields
 * - ✅ updateSession() throws error when session not found
 * - ✅ deleteSession() deletes session by id
 * - ✅ deleteSession() cascades to delete exercises and sets
 * - ✅ getPreviousMaxWeight() returns null when no history
 * - ✅ getPreviousMaxWeight() returns max weight from previous sessions
 *
 * IExerciseLibraryStorage:
 * - ✅ getAllExercises() returns empty array when no exercises exist
 * - ✅ getAllExercises() returns all exercises sorted by lastUsed DESC
 * - ✅ getExerciseById() returns null when exercise doesn't exist
 * - ✅ getExerciseById() returns exercise when it exists
 * - ✅ getExercisesByBodyPart() filters by body part
 * - ✅ createExercise() generates UUID and sets createdAt
 * - ✅ updateExercise() updates exercise fields
 * - ✅ deleteExercise() deletes exercise from library
 * - ✅ updateExercise() can update lastUsed field
 *
 * IPreferencesStorage:
 * - ✅ get() returns null when key doesn't exist
 * - ✅ set() creates new preference
 * - ✅ set() updates existing preference
 * - ✅ remove() deletes preference
 * - ✅ clear() removes all preferences
 * - ✅ keys() returns all preference keys as array
 */

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
  set(key: string, value: unknown): Promise<void>;

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
