import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';
import './mocks';
import { Preferences } from '@capacitor/preferences';

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

// Clear all Preferences storage before each test to prevent test interference
beforeEach(async () => {
  await Preferences.clear();
});
