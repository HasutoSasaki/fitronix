/**
 * Contract Tests for IWorkoutSessionStorage
 * Test: T026
 *
 * These tests define the contract that IWorkoutSessionStorage implementation MUST satisfy.
 * Red phase - will fail until T029 implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { IWorkoutSessionStorage } from '../../../src/contracts/storage';
import { BodyPart } from '../../../src/types/models';

// Import implementation (will be created in T029)
import { WorkoutSessionStorage } from '../../../src/services/storage';

describe('Contract: IWorkoutSessionStorage', () => {
  let storage: IWorkoutSessionStorage;

  beforeEach(async () => {
    storage = new WorkoutSessionStorage();
    // Clear all sessions before each test
    const allSessions = await storage.getAllSessions();
    await Promise.all(allSessions.map((s) => storage.deleteSession(s.id)));
  });

  describe('getAllSessions()', () => {
    it('returns empty array when no sessions exist', async () => {
      const sessions = await storage.getAllSessions();
      expect(sessions).toEqual([]);
    });

    it('returns all sessions sorted by date descending', async () => {
      const session1 = await storage.createSession({
        date: '2025-11-27T10:00:00.000Z',
        exercises: [
          {
            id: 'ex1',
            sessionId: '',
            exerciseName: 'ベンチプレス',
            bodyPart: BodyPart.CHEST,
            sets: [
              {
                id: 'set1',
                exerciseId: 'ex1',
                weight: 80,
                reps: 10,
                completedAt: '2025-11-27T10:05:00.000Z',
                order: 0,
              },
            ],
            order: 0,
          },
        ],
      });

      const session2 = await storage.createSession({
        date: '2025-11-29T10:00:00.000Z',
        exercises: [
          {
            id: 'ex2',
            sessionId: '',
            exerciseName: 'スクワット',
            bodyPart: BodyPart.LEGS,
            sets: [
              {
                id: 'set2',
                exerciseId: 'ex2',
                weight: 100,
                reps: 12,
                completedAt: '2025-11-29T10:05:00.000Z',
                order: 0,
              },
            ],
            order: 0,
          },
        ],
      });

      const session3 = await storage.createSession({
        date: '2025-11-28T10:00:00.000Z',
        exercises: [
          {
            id: 'ex3',
            sessionId: '',
            exerciseName: 'デッドリフト',
            bodyPart: BodyPart.BACK,
            sets: [
              {
                id: 'set3',
                exerciseId: 'ex3',
                weight: 120,
                reps: 8,
                completedAt: '2025-11-28T10:05:00.000Z',
                order: 0,
              },
            ],
            order: 0,
          },
        ],
      });

      const allSessions = await storage.getAllSessions();
      expect(allSessions).toHaveLength(3);
      // Most recent first
      expect(allSessions[0]?.id).toBe(session2.id);
      expect(allSessions[1]?.id).toBe(session3.id);
      expect(allSessions[2]?.id).toBe(session1.id);
    });
  });

  describe('getSessionById()', () => {
    it('returns null when session does not exist', async () => {
      const result = await storage.getSessionById('nonexistent-id');
      expect(result).toBeNull();
    });

    it('returns session when it exists', async () => {
      const created = await storage.createSession({
        date: '2025-11-29T10:00:00.000Z',
        exercises: [
          {
            id: 'ex1',
            sessionId: '',
            exerciseName: 'ベンチプレス',
            bodyPart: BodyPart.CHEST,
            sets: [
              {
                id: 'set1',
                exerciseId: 'ex1',
                weight: 80,
                reps: 10,
                completedAt: '2025-11-29T10:05:00.000Z',
                order: 0,
              },
            ],
            order: 0,
          },
        ],
      });

      const fetched = await storage.getSessionById(created.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.id).toBe(created.id);
      expect(fetched?.date).toBe(created.date);
      expect(fetched?.exercises).toHaveLength(1);
    });
  });

  describe('getSessionsByDateRange()', () => {
    it('returns sessions within date range', async () => {
      await storage.createSession({
        date: '2025-11-25T10:00:00.000Z',
        exercises: [
          {
            id: 'ex1',
            sessionId: '',
            exerciseName: 'Test',
            bodyPart: BodyPart.CHEST,
            sets: [
              {
                id: 'set1',
                exerciseId: 'ex1',
                weight: 80,
                reps: 10,
                completedAt: '2025-11-25T10:05:00.000Z',
                order: 0,
              },
            ],
            order: 0,
          },
        ],
      });

      const withinRange = await storage.createSession({
        date: '2025-11-27T10:00:00.000Z',
        exercises: [
          {
            id: 'ex2',
            sessionId: '',
            exerciseName: 'Test',
            bodyPart: BodyPart.CHEST,
            sets: [
              {
                id: 'set2',
                exerciseId: 'ex2',
                weight: 80,
                reps: 10,
                completedAt: '2025-11-27T10:05:00.000Z',
                order: 0,
              },
            ],
            order: 0,
          },
        ],
      });

      await storage.createSession({
        date: '2025-11-30T10:00:00.000Z',
        exercises: [
          {
            id: 'ex3',
            sessionId: '',
            exerciseName: 'Test',
            bodyPart: BodyPart.CHEST,
            sets: [
              {
                id: 'set3',
                exerciseId: 'ex3',
                weight: 80,
                reps: 10,
                completedAt: '2025-11-30T10:05:00.000Z',
                order: 0,
              },
            ],
            order: 0,
          },
        ],
      });

      const filtered = await storage.getSessionsByDateRange(
        '2025-11-26T00:00:00.000Z',
        '2025-11-28T23:59:59.999Z'
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.id).toBe(withinRange.id);
    });

    it('returns empty array when no sessions in range', async () => {
      await storage.createSession({
        date: '2025-11-20T10:00:00.000Z',
        exercises: [
          {
            id: 'ex1',
            sessionId: '',
            exerciseName: 'Test',
            bodyPart: BodyPart.CHEST,
            sets: [
              {
                id: 'set1',
                exerciseId: 'ex1',
                weight: 80,
                reps: 10,
                completedAt: '2025-11-20T10:05:00.000Z',
                order: 0,
              },
            ],
            order: 0,
          },
        ],
      });

      const filtered = await storage.getSessionsByDateRange(
        '2025-11-25T00:00:00.000Z',
        '2025-11-27T23:59:59.999Z'
      );

      expect(filtered).toEqual([]);
    });
  });

  describe('createSession()', () => {
    it('generates UUID for new session', async () => {
      const session = await storage.createSession({
        date: '2025-11-29T10:00:00.000Z',
        exercises: [
          {
            id: 'ex1',
            sessionId: '',
            exerciseName: 'ベンチプレス',
            bodyPart: BodyPart.CHEST,
            sets: [
              {
                id: 'set1',
                exerciseId: 'ex1',
                weight: 80,
                reps: 10,
                completedAt: '2025-11-29T10:05:00.000Z',
                order: 0,
              },
            ],
            order: 0,
          },
        ],
      });

      expect(session.id).toBeTruthy();
      expect(session.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('sets createdAt and updatedAt timestamps', async () => {
      const before = new Date().toISOString();
      const session = await storage.createSession({
        date: '2025-11-29T10:00:00.000Z',
        exercises: [
          {
            id: 'ex1',
            sessionId: '',
            exerciseName: 'Test',
            bodyPart: BodyPart.CHEST,
            sets: [
              {
                id: 'set1',
                exerciseId: 'ex1',
                weight: 80,
                reps: 10,
                completedAt: '2025-11-29T10:05:00.000Z',
                order: 0,
              },
            ],
            order: 0,
          },
        ],
      });
      const after = new Date().toISOString();

      expect(session.createdAt).toBeTruthy();
      expect(session.updatedAt).toBeTruthy();
      expect(session.createdAt >= before).toBe(true);
      expect(session.createdAt <= after).toBe(true);
      expect(session.updatedAt).toBe(session.createdAt);
    });

    it('preserves all exercise and set data', async () => {
      const sessionData = {
        date: '2025-11-29T10:00:00.000Z',
        totalTime: 3600,
        exercises: [
          {
            id: 'ex1',
            sessionId: '',
            exerciseId: 'lib-ex-1',
            exerciseName: 'ベンチプレス',
            bodyPart: BodyPart.CHEST,
            sets: [
              {
                id: 'set1',
                exerciseId: 'ex1',
                weight: 80,
                reps: 10,
                completedAt: '2025-11-29T10:05:00.000Z',
                order: 0,
              },
              {
                id: 'set2',
                exerciseId: 'ex1',
                weight: 80,
                reps: 8,
                completedAt: '2025-11-29T10:08:00.000Z',
                order: 1,
              },
            ],
            maxWeight: 80,
            order: 0,
          },
        ],
      };

      const created = await storage.createSession(sessionData);
      expect(created.exercises).toHaveLength(1);
      expect(created.exercises[0]?.exerciseName).toBe('ベンチプレス');
      expect(created.exercises[0]?.sets).toHaveLength(2);
      expect(created.totalTime).toBe(3600);
    });
  });

  describe('updateSession()', () => {
    it('updates session fields', async () => {
      const session = await storage.createSession({
        date: '2025-11-29T10:00:00.000Z',
        exercises: [
          {
            id: 'ex1',
            sessionId: '',
            exerciseName: 'Test',
            bodyPart: BodyPart.CHEST,
            sets: [
              {
                id: 'set1',
                exerciseId: 'ex1',
                weight: 80,
                reps: 10,
                completedAt: '2025-11-29T10:05:00.000Z',
                order: 0,
              },
            ],
            order: 0,
          },
        ],
      });

      const updated = await storage.updateSession(session.id, {
        totalTime: 3600,
      });

      expect(updated.totalTime).toBe(3600);
      expect(updated.updatedAt).not.toBe(session.updatedAt);
    });

    it('throws error when session not found', async () => {
      await expect(
        storage.updateSession('nonexistent', { totalTime: 100 })
      ).rejects.toThrow();
    });
  });

  describe('deleteSession()', () => {
    it('deletes session by id', async () => {
      const session = await storage.createSession({
        date: '2025-11-29T10:00:00.000Z',
        exercises: [
          {
            id: 'ex1',
            sessionId: '',
            exerciseName: 'Test',
            bodyPart: BodyPart.CHEST,
            sets: [
              {
                id: 'set1',
                exerciseId: 'ex1',
                weight: 80,
                reps: 10,
                completedAt: '2025-11-29T10:05:00.000Z',
                order: 0,
              },
            ],
            order: 0,
          },
        ],
      });

      await storage.deleteSession(session.id);
      const fetched = await storage.getSessionById(session.id);
      expect(fetched).toBeNull();
    });

    it('throws error when session not found', async () => {
      await expect(storage.deleteSession('nonexistent')).rejects.toThrow();
    });
  });

  describe('getPreviousMaxWeight()', () => {
    it('returns null when no history for exercise', async () => {
      const maxWeight = await storage.getPreviousMaxWeight('ベンチプレス');
      expect(maxWeight).toBeNull();
    });

    it('returns max weight from previous sessions', async () => {
      await storage.createSession({
        date: '2025-11-27T10:00:00.000Z',
        exercises: [
          {
            id: 'ex1',
            sessionId: '',
            exerciseName: 'ベンチプレス',
            bodyPart: BodyPart.CHEST,
            sets: [
              {
                id: 'set1',
                exerciseId: 'ex1',
                weight: 70,
                reps: 10,
                completedAt: '2025-11-27T10:05:00.000Z',
                order: 0,
              },
              {
                id: 'set2',
                exerciseId: 'ex1',
                weight: 75,
                reps: 8,
                completedAt: '2025-11-27T10:08:00.000Z',
                order: 1,
              },
            ],
            maxWeight: 75,
            order: 0,
          },
        ],
      });

      await storage.createSession({
        date: '2025-11-28T10:00:00.000Z',
        exercises: [
          {
            id: 'ex2',
            sessionId: '',
            exerciseName: 'ベンチプレス',
            bodyPart: BodyPart.CHEST,
            sets: [
              {
                id: 'set3',
                exerciseId: 'ex2',
                weight: 80,
                reps: 10,
                completedAt: '2025-11-28T10:05:00.000Z',
                order: 0,
              },
              {
                id: 'set4',
                exerciseId: 'ex2',
                weight: 82.5,
                reps: 6,
                completedAt: '2025-11-28T10:08:00.000Z',
                order: 1,
              },
            ],
            maxWeight: 82.5,
            order: 0,
          },
        ],
      });

      const maxWeight = await storage.getPreviousMaxWeight('ベンチプレス');
      expect(maxWeight).toBe(82.5);
    });
  });
});
