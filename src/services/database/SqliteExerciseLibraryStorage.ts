/**
 * SqliteExerciseLibraryStorage - SQLite implementation of IExerciseLibraryStorage
 * Manages user's exercise library in SQLite database
 */

import type { IExerciseLibraryStorage } from '../../../specs/002-workout-tracker-sqlite-migration/contracts/storage';
import type {
  Exercise,
  BodyPart,
} from '../../types/models';
import { generateUUID, getCurrentTimestamp } from '../../utils/storage';
import DatabaseManager from './DatabaseManager';

export class SqliteExerciseLibraryStorage implements IExerciseLibraryStorage {
  private async getDb() {
    return await DatabaseManager.getConnection();
  }

  async getAllExercises(): Promise<Exercise[]> {
    const db = await this.getDb();

    const result = await db.query(
      'SELECT * FROM exercises ORDER BY lastUsed DESC'
    );

    if (!result.values || result.values.length === 0) {
      return [];
    }

    return result.values.map(row => ({
      id: row.id,
      name: row.name,
      bodyPart: row.bodyPart,
      videoUrl: row.videoUrl ?? undefined,
      createdAt: row.createdAt,
      lastUsed: row.lastUsed ?? undefined,
    }));
  }

  async getExerciseById(id: string): Promise<Exercise | null> {
    const db = await this.getDb();

    const result = await db.query(
      'SELECT * FROM exercises WHERE id = ?',
      [id]
    );

    if (!result.values || result.values.length === 0) {
      return null;
    }

    const row = result.values[0];
    return {
      id: row.id,
      name: row.name,
      bodyPart: row.bodyPart,
      videoUrl: row.videoUrl ?? undefined,
      createdAt: row.createdAt,
      lastUsed: row.lastUsed ?? undefined,
    };
  }

  async getExercisesByBodyPart(bodyPart: BodyPart): Promise<Exercise[]> {
    const db = await this.getDb();

    const result = await db.query(
      'SELECT * FROM exercises WHERE bodyPart = ? ORDER BY lastUsed DESC',
      [bodyPart]
    );

    if (!result.values || result.values.length === 0) {
      return [];
    }

    return result.values.map(row => ({
      id: row.id,
      name: row.name,
      bodyPart: row.bodyPart,
      videoUrl: row.videoUrl ?? undefined,
      createdAt: row.createdAt,
      lastUsed: row.lastUsed ?? undefined,
    }));
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    const db = await this.getDb();

    const result = await db.query(
      'SELECT * FROM exercises WHERE name LIKE ? COLLATE NOCASE ORDER BY lastUsed DESC',
      [`%${query}%`]
    );

    if (!result.values || result.values.length === 0) {
      return [];
    }

    return result.values.map(row => ({
      id: row.id,
      name: row.name,
      bodyPart: row.bodyPart,
      videoUrl: row.videoUrl ?? undefined,
      createdAt: row.createdAt,
      lastUsed: row.lastUsed ?? undefined,
    }));
  }

  async createExercise(
    data: Omit<Exercise, 'id' | 'createdAt' | 'lastUsed'>
  ): Promise<Exercise> {
    const db = await this.getDb();

    const id = generateUUID();
    const createdAt = getCurrentTimestamp();

    await db.run(
      `INSERT INTO exercises (id, name, bodyPart, videoUrl, createdAt, lastUsed)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.name, data.bodyPart, data.videoUrl ?? null, createdAt, null]
    );

    const created = await this.getExerciseById(id);
    if (!created) {
      throw new Error('Failed to retrieve created exercise');
    }

    return created;
  }

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
    const values: any[] = [];

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
      await db.run(
        `UPDATE exercises SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    const updated = await this.getExerciseById(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated exercise');
    }

    return updated;
  }

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

  async updateLastUsed(id: string, timestamp: string): Promise<void> {
    const db = await this.getDb();

    await db.run(
      'UPDATE exercises SET lastUsed = ? WHERE id = ?',
      [timestamp, id]
    );
  }
}
