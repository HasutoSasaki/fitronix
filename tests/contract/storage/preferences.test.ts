/**
 * Contract Tests for IPreferencesStorage
 * Tests: T024, T025
 *
 * These tests define the contract that any IPreferencesStorage implementation MUST satisfy.
 * They will fail initially (Red phase) until the implementation is created.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { IPreferencesStorage } from '../../../src/contracts/storage';

// Import implementation (will be created in T028)
import { PreferencesStorage } from '../../../src/services/storage';

describe('Contract: IPreferencesStorage', () => {
  let storage: IPreferencesStorage;

  beforeEach(async () => {
    storage = new PreferencesStorage();
    await storage.clear();
  });

  describe('T024: get() method', () => {
    it('returns null when key does not exist', async () => {
      const result = await storage.get<string>('nonexistent');
      expect(result).toBeNull();
    });

    it('returns stored value for existing key', async () => {
      const testValue = { foo: 'bar', count: 42 };
      await storage.set('testKey', testValue);

      const result = await storage.get<typeof testValue>('testKey');
      expect(result).toEqual(testValue);
    });

    it('handles primitive types (string)', async () => {
      await storage.set('stringKey', 'hello world');
      const result = await storage.get<string>('stringKey');
      expect(result).toBe('hello world');
    });

    it('handles primitive types (number)', async () => {
      await storage.set('numberKey', 123.45);
      const result = await storage.get<number>('numberKey');
      expect(result).toBe(123.45);
    });

    it('handles primitive types (boolean)', async () => {
      await storage.set('boolKey', true);
      const result = await storage.get<boolean>('boolKey');
      expect(result).toBe(true);
    });

    it('handles arrays', async () => {
      const array = [1, 2, 3, 'four'];
      await storage.set('arrayKey', array);
      const result = await storage.get<typeof array>('arrayKey');
      expect(result).toEqual(array);
    });

    it('handles nested objects', async () => {
      const nested = {
        user: { name: 'John', age: 30 },
        preferences: { theme: 'dark', notifications: true },
      };
      await storage.set('nestedKey', nested);
      const result = await storage.get<typeof nested>('nestedKey');
      expect(result).toEqual(nested);
    });

    it('handles null value explicitly stored', async () => {
      await storage.set('nullKey', null);
      const result = await storage.get('nullKey');
      expect(result).toBeNull();
    });

    it('handles empty string', async () => {
      await storage.set('emptyString', '');
      const result = await storage.get<string>('emptyString');
      expect(result).toBe('');
    });

    it('handles empty array', async () => {
      await storage.set('emptyArray', []);
      const result = await storage.get<unknown[]>('emptyArray');
      expect(result).toEqual([]);
    });

    it('handles empty object', async () => {
      await storage.set('emptyObject', {});
      const result = await storage.get<Record<string, never>>('emptyObject');
      expect(result).toEqual({});
    });
  });

  describe('T025: set() method', () => {
    it('stores and retrieves string value', async () => {
      await storage.set('key1', 'value1');
      const result = await storage.get<string>('key1');
      expect(result).toBe('value1');
    });

    it('stores and retrieves number value', async () => {
      await storage.set('key2', 42);
      const result = await storage.get<number>('key2');
      expect(result).toBe(42);
    });

    it('stores and retrieves object value', async () => {
      const obj = { name: 'Test', count: 10 };
      await storage.set('key3', obj);
      const result = await storage.get<typeof obj>('key3');
      expect(result).toEqual(obj);
    });

    it('overwrites existing value', async () => {
      await storage.set('key4', 'first');
      await storage.set('key4', 'second');
      const result = await storage.get<string>('key4');
      expect(result).toBe('second');
    });

    it('handles special characters in keys', async () => {
      await storage.set('key-with-dashes', 'value');
      await storage.set('key_with_underscores', 'value');
      await storage.set('key.with.dots', 'value');

      expect(await storage.get('key-with-dashes')).toBe('value');
      expect(await storage.get('key_with_underscores')).toBe('value');
      expect(await storage.get('key.with.dots')).toBe('value');
    });

    it('handles Unicode characters in values', async () => {
      const japaneseText = 'こんにちは世界';
      await storage.set('unicodeKey', japaneseText);
      const result = await storage.get<string>('unicodeKey');
      expect(result).toBe(japaneseText);
    });

    it('stores array with mixed types', async () => {
      const mixed = [1, 'two', true, { four: 4 }, null];
      await storage.set('mixedArray', mixed);
      const result = await storage.get<typeof mixed>('mixedArray');
      expect(result).toEqual(mixed);
    });

    it('returns Promise<void>', async () => {
      const promise = storage.set('asyncKey', 'asyncValue');
      expect(promise).toBeInstanceOf(Promise);
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('Additional contract requirements', () => {
    it('remove() deletes key', async () => {
      await storage.set('toRemove', 'value');
      await storage.remove('toRemove');
      const result = await storage.get('toRemove');
      expect(result).toBeNull();
    });

    it('remove() is idempotent (no error on non-existent key)', async () => {
      await expect(storage.remove('doesNotExist')).resolves.toBeUndefined();
    });

    it('clear() removes all keys', async () => {
      await storage.set('key1', 'value1');
      await storage.set('key2', 'value2');
      await storage.set('key3', 'value3');

      await storage.clear();

      expect(await storage.get('key1')).toBeNull();
      expect(await storage.get('key2')).toBeNull();
      expect(await storage.get('key3')).toBeNull();
    });

    it('keys() returns all stored keys', async () => {
      await storage.clear();
      await storage.set('alpha', 1);
      await storage.set('beta', 2);
      await storage.set('gamma', 3);

      const allKeys = await storage.keys();
      expect(allKeys).toContain('alpha');
      expect(allKeys).toContain('beta');
      expect(allKeys).toContain('gamma');
      expect(allKeys.length).toBe(3);
    });

    it('keys() returns empty array when storage is empty', async () => {
      await storage.clear();
      const allKeys = await storage.keys();
      expect(allKeys).toEqual([]);
    });
  });

  describe('Performance characteristics', () => {
    it('handles large objects (workout sessions)', async () => {
      const largeSession = {
        id: 'test-id',
        date: new Date().toISOString(),
        exercises: Array.from({ length: 10 }, (_, i) => ({
          id: `ex-${i}`,
          sessionId: 'test-id',
          exerciseName: `Exercise ${i}`,
          bodyPart: '胸',
          sets: Array.from({ length: 5 }, (_, j) => ({
            id: `set-${i}-${j}`,
            exerciseId: `ex-${i}`,
            weight: 80 + j * 2.5,
            reps: 10 - j,
            completedAt: new Date().toISOString(),
            order: j,
          })),
          maxWeight: 90,
          order: i,
        })),
        totalTime: 3600,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await storage.set('largeSession', largeSession);
      const result = await storage.get<typeof largeSession>('largeSession');
      expect(result).toEqual(largeSession);
    });

    it('handles arrays with 100+ items (exercise library)', async () => {
      const exercises = Array.from({ length: 100 }, (_, i) => ({
        id: `ex-${i}`,
        name: `Exercise ${i}`,
        bodyPart: '胸',
        createdAt: new Date().toISOString(),
      }));

      await storage.set('exercises', exercises);
      const result = await storage.get<typeof exercises>('exercises');
      expect(result).toHaveLength(100);
      expect(result?.[0]?.name).toBe('Exercise 0');
      expect(result?.[99]?.name).toBe('Exercise 99');
    });
  });
});
