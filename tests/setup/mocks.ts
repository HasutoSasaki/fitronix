import { vi } from 'vitest';

// Mock Capacitor Preferences API with in-memory storage
const inMemoryStorage = new Map<string, string>();

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockImplementation(({ key }: { key: string }) => {
      const value = inMemoryStorage.get(key) ?? null;
      return { value };
    }),
    set: vi
      .fn()
      .mockImplementation(({ key, value }: { key: string; value: string }) => {
        inMemoryStorage.set(key, value);
        return undefined;
      }),
    remove: vi.fn().mockImplementation(({ key }: { key: string }) => {
      inMemoryStorage.delete(key);
      return undefined;
    }),
    clear: vi.fn().mockImplementation(() => {
      inMemoryStorage.clear();
      return undefined;
    }),
    keys: vi.fn().mockImplementation(() => {
      const keys = Array.from(inMemoryStorage.keys());
      return { keys };
    }),
  },
}));

// Mock @capacitor-community/sqlite for in-memory testing
let mockConnection: any = null;
const mockDbData = new Map<string, any[]>();

const createMockConnection = () => ({
  open: vi.fn().mockResolvedValue(undefined),
  execute: vi.fn().mockImplementation((sql: string) => {
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
  query: vi.fn().mockImplementation((_sql: string, _values?: any[]) => {
    // Simple mock query responses
    return { values: [] };
  }),
  run: vi.fn().mockImplementation((_sql: string, _values?: any[]) => {
    return { changes: { changes: 1, lastId: 1 } };
  }),
  close: vi.fn().mockResolvedValue(undefined),
  isDBOpen: vi.fn().mockResolvedValue({ result: true }),
  beginTransaction: vi.fn().mockResolvedValue(undefined),
  commitTransaction: vi.fn().mockResolvedValue(undefined),
  rollbackTransaction: vi.fn().mockResolvedValue(undefined),
});

vi.mock('@capacitor-community/sqlite', () => ({
  CapacitorSQLite: {
    createConnection: vi.fn().mockImplementation((_options: any) => {
      mockConnection ??= createMockConnection();
      return mockConnection;
    }),
    closeConnection: vi.fn().mockImplementation(() => {
      mockConnection = null;
      mockDbData.clear();
      return undefined;
    }),
    isConnection: vi.fn().mockResolvedValue({ result: true }),
    exportToJson: vi.fn().mockImplementation(() => {
      return {
        export: {
          database: 'fitronix.db',
          version: 1,
          encrypted: false,
          mode: 'full',
          tables: [],
        },
      };
    }),
    importFromJson: vi
      .fn()
      .mockImplementation(({ jsonstring }: { jsonstring: string }) => {
        // Validate JSON format
        JSON.parse(jsonstring);
        return { changes: { changes: 0 } };
      }),
  },
  SQLiteConnection: vi.fn().mockImplementation((sqlite: any) => ({
    createConnection: sqlite.createConnection,
  })),
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
