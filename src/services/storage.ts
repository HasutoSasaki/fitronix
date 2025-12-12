/**
 * Storage Layer Implementations
 * Phase 2: Storage layer with TDD approach (仮実装 → 三角測量 → 明白な実装)
 * Refactored: T031 - Improved error handling and code reuse
 */

import { Preferences } from '@capacitor/preferences';
import type {
  IPreferencesStorage,
  IWorkoutSessionStorage,
  IExerciseLibraryStorage,
} from '../contracts/storage';
import type {
  WorkoutSession,
  Exercise,
} from '../types/models';
import { generateUUID, getCurrentTimestamp, getUpdatedTimestamp } from '../utils/storage';

/**
 * PreferencesStorage - Key-value storage using Capacitor Preferences
 * T028: 仮実装 (Fake It) - Minimal implementation to pass contract tests
 */
export class PreferencesStorage implements IPreferencesStorage {
  /**
   * Get a value from storage by key
   * Returns null if key doesn't exist
   */
  async get<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });

    if (value === null || value === undefined) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      // If parsing fails, return as-is (for backward compatibility)
      return value as T;
    }
  }

  /**
   * Set a value in storage
   * Serializes value to JSON string
   */
  async set<T>(key: string, value: T): Promise<void> {
    const serialized = JSON.stringify(value);
    await Preferences.set({ key, value: serialized });
  }

  /**
   * Remove a key from storage
   * No-op if key doesn't exist (idempotent)
   */
  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  /**
   * Clear all preferences
   * WARNING: Destructive operation
   */
  async clear(): Promise<void> {
    await Preferences.clear();
  }

  /**
   * Get all storage keys
   */
  async keys(): Promise<string[]> {
    const { keys } = await Preferences.keys();
    return keys;
  }
}

/**
 * WorkoutSessionStorage - CRUD operations for workout sessions
 * T029: 仮実装 (Fake It) - Minimal implementation to pass contract tests
 */
export class WorkoutSessionStorage implements IWorkoutSessionStorage {
  private readonly STORAGE_KEY = 'workoutSessions';
  private prefsStorage = new PreferencesStorage();

  async getAllSessions(): Promise<WorkoutSession[]> {
    const sessions = await this.prefsStorage.get<WorkoutSession[]>(this.STORAGE_KEY);
    if (!sessions) {
      return [];
    }
    // Sort by date descending (most recent first)
    return sessions.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getSessionById(id: string): Promise<WorkoutSession | null> {
    const sessions = await this.getAllSessions();
    return sessions.find(s => s.id === id) ?? null;
  }

  async getSessionsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<WorkoutSession[]> {
    const sessions = await this.getAllSessions();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return sessions.filter(s => {
      const sessionTime = new Date(s.date).getTime();
      return sessionTime >= start && sessionTime <= end;
    });
  }

  async createSession(
    session: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkoutSession> {
    const sessions = await this.getAllSessions();

    // Generate UUID and timestamps
    const now = getCurrentTimestamp();
    const newSession: WorkoutSession = {
      ...session,
      id: generateUUID(),
      createdAt: now,
      updatedAt: now,
      // Generate UUIDs for exercises and sets
      exercises: session.exercises.map((ex) => ({
        ...ex,
        id: generateUUID(),
        sessionId: '', // Will be filled below
        sets: ex.sets.map((set) => ({
          ...set,
          id: generateUUID(),
          exerciseId: '', // Will be filled below
        })),
      })),
    };

    // Fill in parent IDs
    newSession.exercises = newSession.exercises.map(ex => ({
      ...ex,
      sessionId: newSession.id,
      sets: ex.sets.map(set => ({
        ...set,
        exerciseId: ex.id,
      })),
    }));

    sessions.push(newSession);
    await this.prefsStorage.set(this.STORAGE_KEY, sessions);

    return newSession;
  }

  async updateSession(
    id: string,
    updates: Partial<WorkoutSession>
  ): Promise<WorkoutSession> {
    const sessions = await this.getAllSessions();
    const index = sessions.findIndex(s => s.id === id);

    if (index === -1) {
      throw new Error(`Session not found: ${id}`);
    }

    const updatedSession: WorkoutSession = {
      ...sessions[index]!,
      ...updates,
      id, // Preserve ID
      createdAt: sessions[index]!.createdAt, // Preserve createdAt
      updatedAt: getUpdatedTimestamp(sessions[index]!.updatedAt),
    };

    sessions[index] = updatedSession;
    await this.prefsStorage.set(this.STORAGE_KEY, sessions);

    return updatedSession;
  }

  async deleteSession(id: string): Promise<void> {
    const sessions = await this.getAllSessions();
    const filtered = sessions.filter(s => s.id !== id);

    if (filtered.length === sessions.length) {
      throw new Error(`Session not found: ${id}`);
    }

    await this.prefsStorage.set(this.STORAGE_KEY, filtered);
  }

  async getPreviousMaxWeight(exerciseName: string): Promise<number | null> {
    const sessions = await this.getAllSessions();
    let maxWeight: number | null = null;

    for (const session of sessions) {
      for (const exercise of session.exercises) {
        if (exercise.exerciseName.toLowerCase() === exerciseName.toLowerCase()) {
          for (const set of exercise.sets) {
            if (maxWeight === null || set.weight > maxWeight) {
              maxWeight = set.weight;
            }
          }
        }
      }
    }

    return maxWeight;
  }
}

/**
 * ExerciseLibraryStorage - CRUD operations for exercise library
 * T030: 仮実装 (Fake It) - Minimal implementation to pass contract tests
 */
export class ExerciseLibraryStorage implements IExerciseLibraryStorage {
  private readonly STORAGE_KEY = 'exerciseLibrary';
  private prefsStorage = new PreferencesStorage();

  async getAllExercises(): Promise<Exercise[]> {
    const exercises = await this.prefsStorage.get<Exercise[]>(this.STORAGE_KEY);
    return exercises ?? [];
  }

  async getExercisesByBodyPart(bodyPart: string): Promise<Exercise[]> {
    const exercises = await this.getAllExercises();
    return exercises.filter(e => e.bodyPart === bodyPart);
  }

  async getExerciseById(id: string): Promise<Exercise | null> {
    const exercises = await this.getAllExercises();
    return exercises.find(e => e.id === id) ?? null;
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    const exercises = await this.getAllExercises();

    if (!query) {
      return exercises;
    }

    const lowerQuery = query.toLowerCase();
    return exercises.filter(e =>
      e.name.toLowerCase().includes(lowerQuery)
    );
  }

  async createExercise(
    exercise: Omit<Exercise, 'id' | 'createdAt'>
  ): Promise<Exercise> {
    const exercises = await this.getAllExercises();

    const newExercise: Exercise = {
      ...exercise,
      id: generateUUID(),
      createdAt: getCurrentTimestamp(),
    };

    exercises.push(newExercise);
    await this.prefsStorage.set(this.STORAGE_KEY, exercises);

    return newExercise;
  }

  async updateExercise(
    id: string,
    updates: Partial<Exercise>
  ): Promise<Exercise> {
    const exercises = await this.getAllExercises();
    const index = exercises.findIndex(e => e.id === id);

    if (index === -1) {
      throw new Error(`Exercise not found: ${id}`);
    }

    const updatedExercise: Exercise = {
      ...exercises[index]!,
      ...updates,
      id, // Preserve ID
      createdAt: exercises[index]!.createdAt, // Preserve createdAt
    };

    exercises[index] = updatedExercise;
    await this.prefsStorage.set(this.STORAGE_KEY, exercises);

    return updatedExercise;
  }

  async deleteExercise(id: string): Promise<void> {
    const exercises = await this.getAllExercises();
    const filtered = exercises.filter(e => e.id !== id);

    if (filtered.length === exercises.length) {
      throw new Error(`Exercise not found: ${id}`);
    }

    await this.prefsStorage.set(this.STORAGE_KEY, filtered);
  }

  async markExerciseAsUsed(exerciseName: string): Promise<void> {
    const exercises = await this.getAllExercises();
    const now = new Date().toISOString();

    // Find exercise by name and update lastUsed (only first match)
    let updated = false;
    const result = exercises.map(e => {
      if (!updated && e.name.toLowerCase() === exerciseName.toLowerCase()) {
        updated = true;
        return { ...e, lastUsed: now };
      }
      return e;
    });

    await this.prefsStorage.set(this.STORAGE_KEY, result);
  }
}
