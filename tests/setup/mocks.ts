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

// Mock @capacitor-community/sqlite for in-memory testing
let mockConnection: any = null;
let mockDbData: Map<string, any[]> = new Map();

const createMockConnection = () => ({
  execute: vi.fn().mockImplementation(async (sql: string) => {
    // Handle table creation
    if (sql.includes('CREATE TABLE')) {
      return { changes: { changes: 0 } };
    }
    // Handle INSERT statements
    if (sql.toUpperCase().includes('INSERT INTO schema_version')) {
      return { changes: { changes: 1 } };
    }
    return { changes: { changes: 0 } };
  }),
  query: vi.fn().mockImplementation(async (sql: string, values?: any[]) => {
    // Simple mock query responses
    return { values: [] };
  }),
  run: vi.fn().mockImplementation(async (sql: string, values?: any[]) => {
    return { changes: { changes: 1, lastId: 1 } };
  }),
  close: vi.fn().mockResolvedValue(undefined),
  isDBOpen: vi.fn().mockResolvedValue({ result: true }),
});

vi.mock('@capacitor-community/sqlite', () => ({
  CapacitorSQLite: {
    createConnection: vi.fn().mockImplementation(async (options: any) => {
      if (!mockConnection) {
        mockConnection = createMockConnection();
      }
      return mockConnection;
    }),
    closeConnection: vi.fn().mockImplementation(async () => {
      mockConnection = null;
      mockDbData.clear();
      return undefined;
    }),
    isConnection: vi.fn().mockResolvedValue({ result: true }),
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
