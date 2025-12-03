/**
 * DatabaseManager - Singleton for SQLite database management
 * Handles initialization, schema creation, and connection management
 */

import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';
import {
  CREATE_TABLES_SQL,
  CREATE_INDEXES_SQL,
  INSERT_SCHEMA_VERSION_SQL,
  SCHEMA_VERSION,
} from './schema';

class DatabaseManager {
  private static instance: DatabaseManager;
  private db: SQLiteDBConnection | null = null;
  private dbName: string = 'fitronix_workout_tracker';
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
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
      const ret = await CapacitorSQLite.createConnection({
        database: this.dbName,
        version: SCHEMA_VERSION,
        encrypted: false,
        mode: 'no-encryption',
        readonly: false,
      });

      this.db = ret;

      // Open database
      await this.db.open();

      // Create tables and indexes
      await this.createTables();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error(`Database initialization failed: ${error}`);
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
      throw new Error(`Table creation failed: ${error}`);
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
   */
  public async importFromJson(jsonString: string): Promise<void> {
    try {
      // JSON の妥当性チェック
      JSON.parse(jsonString);

      // CapacitorSQLite の期待する形式で渡す
      await CapacitorSQLite.importFromJson({ jsonstring: jsonString });
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON format: ${error.message}`);
      }
      throw new Error(`Failed to import database: ${error}`);
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
      return result.values[0]?.version as number;
    }

    return 0;
  }
}

// Export singleton instance
export default DatabaseManager.getInstance();
