import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';
import './mocks';
import { Preferences } from '@capacitor/preferences';
import DatabaseManager from '../../src/services/database/DatabaseManager';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Clear all storage before each test to prevent test interference
beforeEach(async () => {
  // Clear Preferences storage
  await Preferences.clear();

  // Recreate SQLite tables with latest schema (applies new constraints)
  // This ensures UNIQUE constraints and other schema changes are applied
  try {
    await DatabaseManager.recreateTables();
  } catch (error) {
    // Log errors for debugging (database might not be initialized yet)
    console.error(error);
  }
});
