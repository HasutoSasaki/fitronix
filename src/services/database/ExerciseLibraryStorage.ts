/**
 * ExerciseLibraryStorage - SQLite implementation of IExerciseLibraryStorage
 * Manages user's exercise library in SQLite database
 */

import type { IExerciseLibraryStorage } from '../../contracts/storage';
import type { Exercise, BodyPart } from '../../types/models';
import { generateUUID, getCurrentTimestamp } from '../../utils/storage';
import DatabaseManager from './DatabaseManager';
import type { SQLiteRow } from './types';

/**
 * Helper function to safely convert unknown to SQLiteRow
 */
function toSQLiteRow(value: unknown): SQLiteRow {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Invalid SQLiteRow: expected object');
  }
  return value as SQLiteRow;
}

/**
 * Helper function to safely convert SQLiteRow to Exercise
 */
function rowToExercise(row: SQLiteRow): Exercise {
  const videoUrl = row.videoUrl;
  const lastUsed = row.lastUsed;

  return {
    id: String(row.id),
    name: String(row.name),
    bodyPart: String(row.bodyPart) as BodyPart,
    ...(videoUrl !== null && { videoUrl: String(videoUrl) }),
    createdAt: String(row.createdAt),
    ...(lastUsed !== null && { lastUsed: String(lastUsed) }),
  };
}

export class ExerciseLibraryStorage implements IExerciseLibraryStorage {
  private async getDb() {
    return await DatabaseManager.getConnection();
  }

  /**
   * Get all exercises from library sorted by last used (most recent first)
   *
   * Uses indexed query on `idx_exercises_lastUsed` for performance.
   *
   * @returns Promise<Exercise[]> - All library exercises
   *
   * @example
   * ```typescript
   * const storage = new ExerciseLibraryStorage();
   * const exercises = await storage.getAllExercises();
   * console.log(exercises[0].name); // Most recently used exercise
   * ```
   */
  async getAllExercises(): Promise<Exercise[]> {
    const db = await this.getDb();

    const result = await db.query(
      'SELECT * FROM exercises ORDER BY lastUsed DESC'
    );

    if (!result.values || result.values.length === 0) {
      return [];
    }

    return result.values.map((rawRow) => rowToExercise(toSQLiteRow(rawRow)));
  }

  /**
   * Get a single exercise by ID
   *
   * @param id - Exercise UUID
   * @returns Promise<Exercise | null> - Exercise or null if not found
   */
  async getExerciseById(id: string): Promise<Exercise | null> {
    const db = await this.getDb();

    const result = await db.query('SELECT * FROM exercises WHERE id = ?', [id]);

    if (!result.values || result.values.length === 0) {
      return null;
    }

    const firstRow: unknown = result.values[0];
    if (firstRow === undefined) {
      return null;
    }
    return rowToExercise(toSQLiteRow(firstRow));
  }

  /**
   * Get exercises filtered by body part
   *
   * Uses indexed query on `idx_exercises_bodyPart` for performance.
   *
   * @param bodyPart - Body part to filter by (e.g., '胸', '背中')
   * @returns Promise<Exercise[]> - Exercises for specified body part
   */
  async getExercisesByBodyPart(bodyPart: BodyPart): Promise<Exercise[]> {
    const db = await this.getDb();

    const result = await db.query(
      'SELECT * FROM exercises WHERE bodyPart = ? ORDER BY lastUsed DESC',
      [bodyPart]
    );

    if (!result.values || result.values.length === 0) {
      return [];
    }

    return result.values.map((rawRow) => rowToExercise(toSQLiteRow(rawRow)));
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    const db = await this.getDb();

    // Escape SQL wildcards to prevent unintended pattern matching
    const escapedQuery = query
      .replace(/\\/g, '\\\\') // Escape backslash first
      .replace(/%/g, '\\%') // Escape percent
      .replace(/_/g, '\\_'); // Escape underscore

    const result = await db.query(
      "SELECT * FROM exercises WHERE name LIKE ? ESCAPE '\\' COLLATE NOCASE ORDER BY lastUsed DESC",
      [`%${escapedQuery}%`]
    );

    if (!result.values || result.values.length === 0) {
      return [];
    }

    return result.values.map((rawRow) => rowToExercise(toSQLiteRow(rawRow)));
  }

  /**
   * Create a new exercise in library
   *
   * Auto-generates UUID and sets createdAt timestamp.
   *
   * @param data - Exercise data without id, createdAt, lastUsed
   * @returns Promise<Exercise> - Created exercise with generated fields
   *
   * @example
   * ```typescript
   * const exercise = await storage.createExercise({
   *   name: 'デッドリフト',
   *   bodyPart: '背中',
   *   videoUrl: 'https://youtube.com/...'
   * });
   * ```
   */
  async createExercise(
    data: Omit<Exercise, 'id' | 'createdAt' | 'lastUsed'>
  ): Promise<Exercise> {
    const db = await this.getDb();

    const id = generateUUID();
    const createdAt = getCurrentTimestamp();

    try {
      await db.run(
        `INSERT INTO exercises (id, name, bodyPart, videoUrl, createdAt, lastUsed)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, data.name, data.bodyPart, data.videoUrl ?? null, createdAt, null]
      );
    } catch (error) {
      // Check for UNIQUE constraint violation
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('UNIQUE constraint failed')) {
        throw new Error(
          `Exercise "${data.name}" already exists in body part "${data.bodyPart}"`
        );
      }
      throw error;
    }

    const created = await this.getExerciseById(id);
    if (!created) {
      throw new Error('Failed to retrieve created exercise');
    }

    return created;
  }

  /**
   * Update an existing exercise in library
   *
   * Only updates provided fields. Preserves createdAt.
   *
   * @param id - Exercise UUID
   * @param data - Partial exercise data to update
   * @returns Promise<Exercise> - Updated exercise
   * @throws Error if exercise not found
   */
  async updateExercise(
    id: string,
    data: Partial<Omit<Exercise, 'id' | 'createdAt'>>
  ): Promise<Exercise> {
    const db = await this.getDb();

    // Get existing exercise to preserve createdAt
    const existing = await this.getExerciseById(id);
    if (!existing) {
      throw new Error(`Exercise not found: ${id}`);
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.bodyPart !== undefined) {
      updates.push('bodyPart = ?');
      values.push(data.bodyPart);
    }
    if (data.videoUrl !== undefined) {
      updates.push('videoUrl = ?');
      values.push(data.videoUrl);
    }
    if (data.lastUsed !== undefined) {
      updates.push('lastUsed = ?');
      values.push(data.lastUsed);
    }

    if (updates.length > 0) {
      values.push(id);
      try {
        await db.run(
          `UPDATE exercises SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      } catch (error) {
        // Check for UNIQUE constraint violation
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('UNIQUE constraint failed')) {
          const newName = data.name ?? existing.name;
          const newBodyPart = data.bodyPart ?? existing.bodyPart;
          throw new Error(
            `Exercise "${newName}" already exists in body part "${newBodyPart}"`
          );
        }
        throw error;
      }
    }

    const updated = await this.getExerciseById(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated exercise');
    }

    return updated;
  }

  /**
   * Delete an exercise from library
   *
   * Does NOT cascade to workout_exercises - historical workout data is preserved.
   *
   * @param id - Exercise UUID
   * @throws Error if exercise not found
   */
  async deleteExercise(id: string): Promise<void> {
    const db = await this.getDb();

    // Check if exercise exists
    const existing = await this.getExerciseById(id);
    if (!existing) {
      throw new Error(`Exercise not found: ${id}`);
    }

    // Delete exercise (does NOT cascade to workout_exercises - historical data preserved)
    await db.run('DELETE FROM exercises WHERE id = ?', [id]);
  }

  /**
   * Update lastUsed timestamp for an exercise
   *
   * Called automatically when exercise is used in a workout.
   *
   * @param id - Exercise UUID
   * @param timestamp - ISO 8601 timestamp
   */
  async updateLastUsed(id: string, timestamp: string): Promise<void> {
    const db = await this.getDb();

    await db.run('UPDATE exercises SET lastUsed = ? WHERE id = ?', [
      timestamp,
      id,
    ]);
  }

  /**
   * Mark an exercise as used by updating its lastUsed timestamp
   *
   * Searches for exercise by name (case-insensitive) and updates lastUsed to current time.
   * If multiple exercises have the same name, only the first match is updated.
   * Does nothing if no exercise with the name is found (idempotent).
   *
   * @param exerciseName - Exercise name (case-insensitive)
   * @returns Promise<void>
   *
   * @example
   * await storage.markExerciseAsUsed('ベンチプレス');
   * // Updates lastUsed timestamp for 'ベンチプレス' exercise
   */
  async markExerciseAsUsed(exerciseName: string): Promise<void> {
    const db = await this.getDb();
    const now = getCurrentTimestamp();

    // Find first matching exercise by name (case-insensitive)
    const result = await db.query(
      'SELECT id FROM exercises WHERE name = ? COLLATE NOCASE LIMIT 1',
      [exerciseName]
    );

    if (!result.values || result.values.length === 0) {
      // No matching exercise found - idempotent, do nothing
      return;
    }

    const firstRow = toSQLiteRow(result.values[0]);
    const exerciseId = String(firstRow.id);

    // Update lastUsed timestamp
    await db.run('UPDATE exercises SET lastUsed = ? WHERE id = ?', [
      now,
      exerciseId,
    ]);
  }
}
