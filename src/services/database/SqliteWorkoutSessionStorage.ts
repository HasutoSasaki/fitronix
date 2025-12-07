/**
 * SqliteWorkoutSessionStorage - SQLite implementation of IWorkoutSessionStorage
 * Manages workout sessions, exercises, and sets in SQLite database
 */

import type { IWorkoutSessionStorage } from '../../../specs/002-workout-tracker-sqlite-migration/contracts/storage';
import type {
  WorkoutSession,
  WorkoutExercise,
  Set,
} from '../../types/models';
import { generateUUID, getCurrentTimestamp, getUpdatedTimestamp } from '../../utils/storage';
import DatabaseManager from './DatabaseManager';

export class SqliteWorkoutSessionStorage implements IWorkoutSessionStorage {
  private async getDb() {
    return await DatabaseManager.getConnection();
  }

  async getAllSessions(): Promise<WorkoutSession[]> {
    const db = await this.getDb();

    // Get all sessions sorted by date DESC
    const sessionsResult = await db.query(
      'SELECT * FROM workout_sessions ORDER BY date DESC'
    );

    if (!sessionsResult.values || sessionsResult.values.length === 0) {
      return [];
    }

    // For each session, fetch exercises and sets
    const sessions: WorkoutSession[] = [];
    for (const sessionRow of sessionsResult.values) {
      const exercises = await this.getExercisesForSession(sessionRow.id);
      sessions.push({
        id: sessionRow.id,
        date: sessionRow.date,
        totalTime: sessionRow.totalTime ?? undefined,
        exercises,
        createdAt: sessionRow.createdAt,
        updatedAt: sessionRow.updatedAt,
      });
    }

    return sessions;
  }

  async getSessionById(id: string): Promise<WorkoutSession | null> {
    const db = await this.getDb();

    const result = await db.query(
      'SELECT * FROM workout_sessions WHERE id = ?',
      [id]
    );

    if (!result.values || result.values.length === 0) {
      return null;
    }

    const sessionRow = result.values[0];
    const exercises = await this.getExercisesForSession(sessionRow.id);

    return {
      id: sessionRow.id,
      date: sessionRow.date,
      totalTime: sessionRow.totalTime ?? undefined,
      exercises,
      createdAt: sessionRow.createdAt,
      updatedAt: sessionRow.updatedAt,
    };
  }

  async getSessionsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<WorkoutSession[]> {
    const db = await this.getDb();

    const result = await db.query(
      'SELECT * FROM workout_sessions WHERE date >= ? AND date <= ? ORDER BY date DESC',
      [startDate, endDate]
    );

    if (!result.values || result.values.length === 0) {
      return [];
    }

    const sessions: WorkoutSession[] = [];
    for (const sessionRow of result.values) {
      const exercises = await this.getExercisesForSession(sessionRow.id);
      sessions.push({
        id: sessionRow.id,
        date: sessionRow.date,
        totalTime: sessionRow.totalTime ?? undefined,
        exercises,
        createdAt: sessionRow.createdAt,
        updatedAt: sessionRow.updatedAt,
      });
    }

    return sessions;
  }

  async createSession(
    session: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkoutSession> {
    const db = await this.getDb();

    const sessionId = generateUUID();
    const now = getCurrentTimestamp();

    // Insert session
    await db.run(
      `INSERT INTO workout_sessions (id, date, totalTime, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?)`,
      [sessionId, session.date, session.totalTime ?? null, now, now]
    );

    // Insert exercises and sets
    for (const exercise of session.exercises) {
      const exerciseId = generateUUID();

      // Calculate maxWeight from sets
      const maxWeight = exercise.sets.length > 0
        ? Math.max(...exercise.sets.map(s => s.weight))
        : null;

      await db.run(
        `INSERT INTO workout_exercises (id, sessionId, exerciseId, exerciseName, bodyPart, maxWeight, "order")
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          exerciseId,
          sessionId,
          exercise.exerciseId ?? null,
          exercise.exerciseName,
          exercise.bodyPart,
          maxWeight,
          exercise.order,
        ]
      );

      // Insert sets
      for (const set of exercise.sets) {
        const setId = generateUUID();
        await db.run(
          `INSERT INTO sets (id, exerciseId, weight, reps, completedAt, "order")
           VALUES (?, ?, ?, ?, ?, ?)`,
          [setId, exerciseId, set.weight, set.reps, set.completedAt, set.order]
        );
      }
    }

    // Return created session
    const createdSession = await this.getSessionById(sessionId);
    if (!createdSession) {
      throw new Error('Failed to retrieve created session');
    }

    return createdSession;
  }

  async updateSession(
    id: string,
    data: Partial<Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<WorkoutSession> {
    const db = await this.getDb();

    // Get existing session to preserve createdAt
    const existing = await this.getSessionById(id);
    if (!existing) {
      throw new Error(`Session not found: ${id}`);
    }

    const updatedAt = getUpdatedTimestamp(existing.updatedAt);

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (data.date !== undefined) {
      updates.push('date = ?');
      values.push(data.date);
    }
    if (data.totalTime !== undefined) {
      updates.push('totalTime = ?');
      values.push(data.totalTime);
    }
    if (data.exercises !== undefined) {
      // Delete existing exercises (cascade will delete sets)
      await db.run('DELETE FROM workout_exercises WHERE sessionId = ?', [id]);

      // Insert new exercises
      for (const exercise of data.exercises) {
        const exerciseId = generateUUID();
        const maxWeight = exercise.sets.length > 0
          ? Math.max(...exercise.sets.map(s => s.weight))
          : null;

        await db.run(
          `INSERT INTO workout_exercises (id, sessionId, exerciseId, exerciseName, bodyPart, maxWeight, "order")
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            exerciseId,
            id,
            exercise.exerciseId ?? null,
            exercise.exerciseName,
            exercise.bodyPart,
            maxWeight,
            exercise.order,
          ]
        );

        // Insert sets
        for (const set of exercise.sets) {
          const setId = generateUUID();
          await db.run(
            `INSERT INTO sets (id, exerciseId, weight, reps, completedAt, "order")
             VALUES (?, ?, ?, ?, ?, ?)`,
            [setId, exerciseId, set.weight, set.reps, set.completedAt, set.order]
          );
        }
      }
    }

    // Always update updatedAt
    updates.push('updatedAt = ?');
    values.push(updatedAt);

    if (updates.length > 0) {
      values.push(id);
      await db.run(
        `UPDATE workout_sessions SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Return updated session
    const updated = await this.getSessionById(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated session');
    }

    return updated;
  }

  async deleteSession(id: string): Promise<void> {
    const db = await this.getDb();

    // Check if session exists
    const existing = await this.getSessionById(id);
    if (!existing) {
      throw new Error(`Session not found: ${id}`);
    }

    // Delete session (CASCADE will delete exercises and sets)
    await db.run('DELETE FROM workout_sessions WHERE id = ?', [id]);
  }

  async getPreviousMaxWeight(exerciseName: string): Promise<number | null> {
    const db = await this.getDb();

    const result = await db.query(
      `SELECT MAX(maxWeight) as maxWeight
       FROM workout_exercises
       WHERE exerciseName = ? COLLATE NOCASE`,
      [exerciseName]
    );

    if (!result.values || result.values.length === 0 || result.values[0].maxWeight === null) {
      return null;
    }

    return result.values[0].maxWeight as number;
  }

  /**
   * Helper: Get exercises with sets for a session
   */
  private async getExercisesForSession(sessionId: string): Promise<WorkoutExercise[]> {
    const db = await this.getDb();

    const exercisesResult = await db.query(
      'SELECT * FROM workout_exercises WHERE sessionId = ? ORDER BY "order" ASC',
      [sessionId]
    );

    if (!exercisesResult.values || exercisesResult.values.length === 0) {
      return [];
    }

    const exercises: WorkoutExercise[] = [];
    for (const exerciseRow of exercisesResult.values) {
      const setsResult = await db.query(
        'SELECT * FROM sets WHERE exerciseId = ? ORDER BY "order" ASC',
        [exerciseRow.id]
      );

      const sets: Set[] = (setsResult.values || []).map(setRow => ({
        id: setRow.id,
        exerciseId: setRow.exerciseId,
        weight: setRow.weight,
        reps: setRow.reps,
        completedAt: setRow.completedAt,
        order: setRow.order,
      }));

      exercises.push({
        id: exerciseRow.id,
        sessionId: exerciseRow.sessionId,
        exerciseId: exerciseRow.exerciseId ?? undefined,
        exerciseName: exerciseRow.exerciseName,
        bodyPart: exerciseRow.bodyPart,
        sets,
        order: exerciseRow.order,
      });
    }

    return exercises;
  }
}
