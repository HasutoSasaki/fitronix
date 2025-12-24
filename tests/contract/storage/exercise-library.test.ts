/**
 * Contract Tests for IExerciseLibraryStorage
 * Test: T027
 *
 * These tests define the contract that IExerciseLibraryStorage implementation MUST satisfy.
 * Red phase - will fail until T030 implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { IExerciseLibraryStorage } from '../../../src/contracts/storage';
import { BodyPart } from '../../../src/types/models';

// Import implementation (will be created in T030)
import { ExerciseLibraryStorage } from '../../../src/services/storage';

describe('Contract: IExerciseLibraryStorage', () => {
  let storage: IExerciseLibraryStorage;

  beforeEach(async () => {
    storage = new ExerciseLibraryStorage();
    // Clear library before each test
    const allExercises = await storage.getAllExercises();
    await Promise.all(allExercises.map((e) => storage.deleteExercise(e.id)));
  });

  describe('getAllExercises()', () => {
    it('returns empty array when library is empty', async () => {
      const exercises = await storage.getAllExercises();
      expect(exercises).toEqual([]);
    });

    it('returns all exercises in library', async () => {
      await storage.createExercise({
        name: 'ベンチプレス',
        bodyPart: BodyPart.CHEST,
      });

      await storage.createExercise({
        name: 'スクワット',
        bodyPart: BodyPart.LEGS,
      });

      await storage.createExercise({
        name: 'デッドリフト',
        bodyPart: BodyPart.BACK,
      });

      const exercises = await storage.getAllExercises();
      expect(exercises).toHaveLength(3);
    });
  });

  describe('getExercisesByBodyPart()', () => {
    beforeEach(async () => {
      await storage.createExercise({ name: 'ベンチプレス', bodyPart: BodyPart.CHEST });
      await storage.createExercise({ name: 'ダンベルプレス', bodyPart: BodyPart.CHEST });
      await storage.createExercise({ name: 'スクワット', bodyPart: BodyPart.LEGS });
      await storage.createExercise({ name: 'デッドリフト', bodyPart: BodyPart.BACK });
    });

    it('returns exercises filtered by body part', async () => {
      const chestExercises = await storage.getExercisesByBodyPart(BodyPart.CHEST);
      expect(chestExercises).toHaveLength(2);
      expect(chestExercises.every((e) => e.bodyPart === BodyPart.CHEST)).toBe(true);
    });

    it('returns empty array when no exercises for body part', async () => {
      const shoulderExercises = await storage.getExercisesByBodyPart(BodyPart.SHOULDERS);
      expect(shoulderExercises).toEqual([]);
    });
  });

  describe('getExerciseById()', () => {
    it('returns null when exercise does not exist', async () => {
      const result = await storage.getExerciseById('nonexistent-id');
      expect(result).toBeNull();
    });

    it('returns exercise when it exists', async () => {
      const created = await storage.createExercise({
        name: 'ベンチプレス',
        bodyPart: BodyPart.CHEST,
        videoUrl: 'https://youtube.com/watch?v=example',
      });

      const fetched = await storage.getExerciseById(created.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.id).toBe(created.id);
      expect(fetched?.name).toBe('ベンチプレス');
      expect(fetched?.videoUrl).toBe('https://youtube.com/watch?v=example');
    });
  });

  describe('searchExercises()', () => {
    beforeEach(async () => {
      await storage.createExercise({ name: 'ベンチプレス', bodyPart: BodyPart.CHEST });
      await storage.createExercise({ name: 'インクラインベンチプレス', bodyPart: BodyPart.CHEST });
      await storage.createExercise({ name: 'ダンベルプレス', bodyPart: BodyPart.CHEST });
      await storage.createExercise({ name: 'スクワット', bodyPart: BodyPart.LEGS });
    });

    it('finds exercises by partial name match', async () => {
      const results = await storage.searchExercises('プレス');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((e) => e.name.includes('プレス'))).toBe(true);
    });

    it('is case-insensitive', async () => {
      await storage.createExercise({ name: 'Push Up', bodyPart: BodyPart.CHEST });
      const results = await storage.searchExercises('push');
      expect(results.some((e) => e.name === 'Push Up')).toBe(true);
    });

    it('returns empty array when no matches', async () => {
      const results = await storage.searchExercises('xyz123notexist');
      expect(results).toEqual([]);
    });

    it('returns all exercises for empty query', async () => {
      const results = await storage.searchExercises('');
      expect(results.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('createExercise()', () => {
    it('generates UUID for new exercise', async () => {
      const exercise = await storage.createExercise({
        name: 'ベンチプレス',
        bodyPart: BodyPart.CHEST,
      });

      expect(exercise.id).toBeTruthy();
      expect(exercise.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('sets createdAt timestamp', async () => {
      const before = new Date().toISOString();
      const exercise = await storage.createExercise({
        name: 'ベンチプレス',
        bodyPart: BodyPart.CHEST,
      });
      const after = new Date().toISOString();

      expect(exercise.createdAt).toBeTruthy();
      expect(exercise.createdAt >= before).toBe(true);
      expect(exercise.createdAt <= after).toBe(true);
    });

    it('initializes lastUsed as undefined', async () => {
      const exercise = await storage.createExercise({
        name: 'ベンチプレス',
        bodyPart: BodyPart.CHEST,
      });

      expect(exercise.lastUsed).toBeUndefined();
    });

    it('preserves optional fields', async () => {
      const exercise = await storage.createExercise({
        name: 'ベンチプレス',
        bodyPart: BodyPart.CHEST,
        videoUrl: 'https://youtube.com/watch?v=test',
        lastUsed: '2025-11-29T10:00:00.000Z',
      });

      expect(exercise.videoUrl).toBe('https://youtube.com/watch?v=test');
      expect(exercise.lastUsed).toBe('2025-11-29T10:00:00.000Z');
    });

    it('allows duplicate names in same body part (UI warns, but API allows)', async () => {
      await storage.createExercise({
        name: 'ベンチプレス',
        bodyPart: BodyPart.CHEST,
      });

      const duplicate = await storage.createExercise({
        name: 'ベンチプレス',
        bodyPart: BodyPart.CHEST,
      });

      expect(duplicate).toBeTruthy();
      expect(duplicate.name).toBe('ベンチプレス');

      const all = await storage.getAllExercises();
      const benchPresses = all.filter((e) => e.name === 'ベンチプレス');
      expect(benchPresses.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('updateExercise()', () => {
    it('updates exercise fields', async () => {
      const exercise = await storage.createExercise({
        name: 'ベンチプレス',
        bodyPart: BodyPart.CHEST,
      });

      const updated = await storage.updateExercise(exercise.id, {
        name: 'バーベルベンチプレス',
        videoUrl: 'https://youtube.com/watch?v=updated',
      });

      expect(updated.name).toBe('バーベルベンチプレス');
      expect(updated.videoUrl).toBe('https://youtube.com/watch?v=updated');
      expect(updated.bodyPart).toBe(BodyPart.CHEST); // unchanged
    });

    it('throws error when exercise not found', async () => {
      await expect(storage.updateExercise('nonexistent', { name: 'New Name' })).rejects.toThrow();
    });

    it('allows partial updates', async () => {
      const exercise = await storage.createExercise({
        name: 'ベンチプレス',
        bodyPart: BodyPart.CHEST,
        videoUrl: 'https://youtube.com/old',
      });

      const updated = await storage.updateExercise(exercise.id, {
        videoUrl: 'https://youtube.com/new',
      });

      expect(updated.name).toBe('ベンチプレス'); // unchanged
      expect(updated.videoUrl).toBe('https://youtube.com/new'); // updated
    });
  });

  describe('deleteExercise()', () => {
    it('deletes exercise by id', async () => {
      const exercise = await storage.createExercise({
        name: 'ベンチプレス',
        bodyPart: BodyPart.CHEST,
      });

      await storage.deleteExercise(exercise.id);
      const fetched = await storage.getExerciseById(exercise.id);
      expect(fetched).toBeNull();
    });

    it('throws error when exercise not found', async () => {
      await expect(storage.deleteExercise('nonexistent')).rejects.toThrow();
    });
  });

  describe('markExerciseAsUsed()', () => {
    it('updates lastUsed timestamp for matching exercise', async () => {
      await storage.createExercise({
        name: 'ベンチプレス',
        bodyPart: BodyPart.CHEST,
      });

      const before = new Date().toISOString();
      await storage.markExerciseAsUsed('ベンチプレス');
      const after = new Date().toISOString();

      const exercises = await storage.searchExercises('ベンチプレス');
      const benchPress = exercises.find((e) => e.name === 'ベンチプレス');

      expect(benchPress?.lastUsed).toBeTruthy();
      if (benchPress?.lastUsed) {
        expect(benchPress.lastUsed >= before).toBe(true);
        expect(benchPress.lastUsed <= after).toBe(true);
      }
    });

    it('does nothing if exercise name not found (idempotent)', async () => {
      await expect(storage.markExerciseAsUsed('NonexistentExercise')).resolves.toBeUndefined();
    });

    it('updates only first matching exercise when duplicates exist', async () => {
      const ex1 = await storage.createExercise({
        name: 'ベンチプレス',
        bodyPart: BodyPart.CHEST,
      });

      const ex2 = await storage.createExercise({
        name: 'ベンチプレス',
        bodyPart: BodyPart.CHEST,
      });

      await storage.markExerciseAsUsed('ベンチプレス');

      const fetched1 = await storage.getExerciseById(ex1.id);
      const fetched2 = await storage.getExerciseById(ex2.id);

      // Exactly one exercise should be updated (the first created one, ex1)
      expect(fetched1?.lastUsed).toBeTruthy();
      expect(fetched2?.lastUsed).toBeUndefined();
    });
  });

  describe('Data integrity', () => {
    it('validates name length (1-100 chars)', async () => {
      const longName = 'a'.repeat(100);
      const exercise = await storage.createExercise({
        name: longName,
        bodyPart: BodyPart.CHEST,
      });
      expect(exercise.name).toBe(longName);
    });

    it('handles special characters in names', async () => {
      const exercise = await storage.createExercise({
        name: 'ベンチプレス（バーベル）',
        bodyPart: BodyPart.CHEST,
      });
      expect(exercise.name).toBe('ベンチプレス（バーベル）');
    });

    it('preserves empty videoUrl', async () => {
      const exercise = await storage.createExercise({
        name: 'ベンチプレス',
        bodyPart: BodyPart.CHEST,
        videoUrl: '',
      });
      expect(exercise.videoUrl).toBe('');
    });
  });
});
