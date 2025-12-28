/**
 * Type definitions for SQLite query results
 */

export type SQLiteRow = Record<string, string | number | null>;

export interface SQLiteQueryResult {
  values?: SQLiteRow[];
}

export interface SQLiteRunResult {
  changes: {
    changes: number;
    lastId?: number;
  };
}
