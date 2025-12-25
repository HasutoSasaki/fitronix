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

  // Clear SQLite database if initialized
  try {
    await DatabaseManager.clearAllData();
  } catch (error) {
    console.error(error);
  }
});
