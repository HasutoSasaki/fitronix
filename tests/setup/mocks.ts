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

// Mock @capacitor-community/sqlite with sql.js (real SQLite in memory)
import initSqlJs, { Database } from 'sql.js';

interface MockConnection {
  open: ReturnType<typeof vi.fn>;
  execute: ReturnType<typeof vi.fn>;
  query: ReturnType<typeof vi.fn>;
  run: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  isDBOpen: ReturnType<typeof vi.fn>;
  beginTransaction: ReturnType<typeof vi.fn>;
  commitTransaction: ReturnType<typeof vi.fn>;
  rollbackTransaction: ReturnType<typeof vi.fn>;
}

let sqlJsDb: Database | null = null;
let mockConnection: MockConnection | null = null;

async function initSqlJsDb() {
  if (!sqlJsDb) {
    const SQL = await initSqlJs({
      // Use local node_modules path for WASM file
      locateFile: (file) => `node_modules/sql.js/dist/${file}`,
    });
    sqlJsDb = new SQL.Database();
  }
  return sqlJsDb;
}

const createMockConnection = () => ({
  open: vi.fn().mockImplementation(async () => {
    await initSqlJsDb();
    return undefined;
  }),
  execute: vi.fn().mockImplementation(async (sql: string) => {
    const db = await initSqlJsDb();
    db.exec(sql);
    return { changes: { changes: 0 } };
  }),
  query: vi.fn().mockImplementation(async (sql: string, values?: any[]) => {
    const db = await initSqlJsDb();

    try {
      const stmt = db.prepare(sql);
      if (values && values.length > 0) {
        stmt.bind(values);
      }

      const results: any[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();

      return { values: results };
    } catch (error) {
      console.error('SQL query error:', error);
      throw error;
    }
  }),
  run: vi.fn().mockImplementation(async (sql: string, values?: any[]) => {
    const db = await initSqlJsDb();

    try {
      const stmt = db.prepare(sql);
      if (values && values.length > 0) {
        stmt.bind(values);
      }
      stmt.step();
      const changes = db.getRowsModified();
      stmt.free();

      return { changes: { changes, lastId: changes } };
    } catch (error) {
      console.error('SQL run error:', error);
      throw error;
    }
  }),
  close: vi.fn().mockImplementation(() => {
    if (sqlJsDb) {
      sqlJsDb.close();
      sqlJsDb = null;
    }
    return undefined;
  }),
  isDBOpen: vi.fn().mockResolvedValue({ result: true }),
  beginTransaction: vi.fn().mockImplementation(async () => {
    const db = await initSqlJsDb();
    db.exec('BEGIN TRANSACTION');
    return undefined;
  }),
  commitTransaction: vi.fn().mockImplementation(async () => {
    const db = await initSqlJsDb();
    db.exec('COMMIT');
    return undefined;
  }),
  rollbackTransaction: vi.fn().mockImplementation(async () => {
    const db = await initSqlJsDb();
    db.exec('ROLLBACK');
    return undefined;
  }),
});

vi.mock('@capacitor-community/sqlite', () => ({
  CapacitorSQLite: {
    createConnection: vi.fn().mockImplementation((_options: any) => {
      mockConnection ??= createMockConnection();
      return mockConnection;
    }),
    closeConnection: vi.fn().mockImplementation(() => {
      mockConnection = null;
      if (sqlJsDb) {
        sqlJsDb.close();
        sqlJsDb = null;
      }
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
