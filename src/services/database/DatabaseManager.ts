/**
 * DatabaseManager - Singleton for SQLite database management
 * Handles initialization, schema creation, and connection management
 */

import {
  CapacitorSQLite,
  SQLiteDBConnection,
  SQLiteConnection,
} from '@capacitor-community/sqlite';
import {
  CREATE_TABLES_SQL,
  CREATE_INDEXES_SQL,
  INSERT_SCHEMA_VERSION_SQL,
  SCHEMA_VERSION,
} from './schema';

class DatabaseManager {
  private static instance: DatabaseManager;
  private db: SQLiteDBConnection | null = null;
  private dbName = 'fitronix_workout_tracker';
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private sqliteConnection: SQLiteConnection;

  private constructor() {
    // Private constructor for singleton
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
  }

  public static getInstance(): DatabaseManager {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/prefer-nullish-coalescing
    if (DatabaseManager.instance === undefined) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize database connection and create tables
   * @param dbName - Optional database name (default: 'fitronix_workout_tracker')
   *                 Use ':memory:' for in-memory database (testing)
   */
  public async initialize(dbName?: string): Promise<void> {
    if (this.isInitialized && this.db) {
      return;
    }

    if (dbName) {
      this.dbName = dbName;
    }

    try {
      // Create connection
      this.db = await this.sqliteConnection.createConnection(
        this.dbName,
        false,
        'no-encryption',
        SCHEMA_VERSION,
        false
      );

      // Open database
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (this.db) {
        await this.db.open();
      }

      // Create tables and indexes
      await this.createTables();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error(`Database initialization failed: ${String(error)}`);
    }
  }

  /**
   * Create tables and indexes
   */
  public async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Create tables
      await this.db.execute(CREATE_TABLES_SQL);

      // Create indexes
      await this.db.execute(CREATE_INDEXES_SQL);

      // Insert schema version
      await this.db.run(INSERT_SCHEMA_VERSION_SQL, [SCHEMA_VERSION]);
    } catch (error) {
      console.error('Failed to create tables:', error);
      throw new Error(`Table creation failed: ${String(error)}`);
    }
  }

  /**
   * Get active database connection
   * @throws Error if database is not initialized
   */
  public async getConnection(): Promise<SQLiteDBConnection> {
    if (!this.db || !this.isInitialized) {
      // 既に初期化が進行中なら、その完了を待つ
      if (this.initializationPromise) {
        await this.initializationPromise;
      } else {
        // 初期化プロミスを保存して重複実行を防止
        this.initializationPromise = this.initialize();
        try {
          await this.initializationPromise;
        } finally {
          this.initializationPromise = null;
        }
      }
    }

    if (!this.db) {
      throw new Error('Database connection is not available');
    }

    return this.db;
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    if (this.db) {
      try {
        await this.db.close();
      } finally {
        this.db = null;
        this.isInitialized = false;
        this.initializationPromise = null;
      }
    }
  }

  /**
   * Clear all data from database (for testing)
   */
  public async clearAllData(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    await this.db.execute(`
      DELETE FROM sets;
      DELETE FROM workout_exercises;
      DELETE FROM workout_sessions;
      DELETE FROM exercises;
    `);
  }

  /**
   * Export database to JSON (for backup)
   */
  public async exportToJson(): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const exportResult = await CapacitorSQLite.exportToJson({
      database: this.dbName,
      jsonexportmode: 'full',
    });

    return JSON.stringify(exportResult.export);
  }

  /**
   * Import database from JSON (for restore)
   *
   * Performs import within a transaction to ensure atomicity.
   * If import fails, all changes are rolled back to prevent partial data corruption.
   *
   * @param jsonString - JSON string exported from exportToJson()
   * @throws Error if JSON is invalid or import operation fails
   *
   * @example
   * ```typescript
   * const db = DatabaseManager.getInstance();
   * const backup = await db.exportToJson();
   * // ... later restore ...
   * await db.importFromJson(backup);
   * ```
   */
  public async importFromJson(jsonString: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Validate JSON format before attempting import
      JSON.parse(jsonString);

      // Begin transaction for atomic import using plugin API
      await this.db.beginTransaction();

      try {
        // Import data using CapacitorSQLite API
        await CapacitorSQLite.importFromJson({
          jsonstring: jsonString,
        });

        // Commit transaction on success
        await this.db.commitTransaction();
      } catch (importError) {
        // Rollback transaction on failure to prevent partial import
        await this.db.rollbackTransaction();
        throw importError;
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON format: ${error.message}`);
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to import database: ${errorMessage}`);
    }
  }

  /**
   * Get current schema version
   */
  public async getSchemaVersion(): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const result = await this.db.query(
      'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
    );

    if (result.values && result.values.length > 0) {
      const row = result.values[0] as { version: number };
      return row.version;
    }

    return 0;
  }

  /**
   * Verify essential tables exist
   * Lightweight schema integrity check for production
   *
   * @returns true if all required tables exist, false otherwise
   */
  public async verifySchemaIntegrity(): Promise<boolean> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const requiredTables = [
      'schema_version',
      'workout_sessions',
      'workout_exercises',
      'sets',
      'exercises',
    ];

    try {
      for (const tableName of requiredTables) {
        const result = await this.db.query(
          `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
          [tableName]
        );

        if (!result.values || result.values.length === 0) {
          console.error(`Missing table: ${tableName}`);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Schema integrity check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export default DatabaseManager.getInstance();
