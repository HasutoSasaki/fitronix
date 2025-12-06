import { vi } from 'vitest';

// Mock Capacitor Preferences API with in-memory storage
const inMemoryStorage = new Map<string, string>();

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockImplementation(async ({ key }: { key: string }) => {
      const value = inMemoryStorage.get(key) ?? null;
      return { value };
    }),
    set: vi.fn().mockImplementation(async ({ key, value }: { key: string; value: string }) => {
      inMemoryStorage.set(key, value);
      return undefined;
    }),
    remove: vi.fn().mockImplementation(async ({ key }: { key: string }) => {
      inMemoryStorage.delete(key);
      return undefined;
    }),
    clear: vi.fn().mockImplementation(async () => {
      inMemoryStorage.clear();
      return undefined;
    }),
    keys: vi.fn().mockImplementation(async () => {
      const keys = Array.from(inMemoryStorage.keys());
      return { keys };
    }),
  },
}));

// Mock Capacitor Local Notifications API
vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    schedule: vi.fn().mockResolvedValue({ notifications: [] }),
    getPending: vi.fn().mockResolvedValue({ notifications: [] }),
    cancel: vi.fn().mockResolvedValue(undefined),
    requestPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
    checkPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
  },
}));
