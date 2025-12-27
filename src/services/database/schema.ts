/**
 * Database Schema Definitions for SQLite
 * Version 1: Initial schema
 */

export const SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  appliedAt TEXT NOT NULL
);

-- Workout Sessions (parent table)
CREATE TABLE IF NOT EXISTS workout_sessions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  totalTime INTEGER,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Workout Exercises (denormalized for performance)
CREATE TABLE IF NOT EXISTS workout_exercises (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  exerciseId TEXT,
  exerciseName TEXT NOT NULL,
  bodyPart TEXT NOT NULL,
  maxWeight REAL,
  "order" INTEGER NOT NULL,
  FOREIGN KEY (sessionId) REFERENCES workout_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (exerciseId) REFERENCES exercises(id) ON DELETE SET NULL
);

-- Sets
CREATE TABLE IF NOT EXISTS sets (
  id TEXT PRIMARY KEY,
  exerciseId TEXT NOT NULL,
  weight REAL NOT NULL CHECK(weight >= 0),
  reps INTEGER NOT NULL CHECK(reps >= 1),
  completedAt TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  FOREIGN KEY (exerciseId) REFERENCES workout_exercises(id) ON DELETE CASCADE
);

-- Exercise Library
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bodyPart TEXT NOT NULL,
  videoUrl TEXT,
  createdAt TEXT NOT NULL,
  lastUsed TEXT,
  UNIQUE(name, bodyPart)
);
`;

export const CREATE_INDEXES_SQL = `
-- Workout Sessions indexes
CREATE INDEX IF NOT EXISTS idx_workout_sessions_date
  ON workout_sessions(date DESC);

-- Workout Exercises indexes
CREATE INDEX IF NOT EXISTS idx_workout_exercises_sessionId
  ON workout_exercises(sessionId);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_exerciseName
  ON workout_exercises(exerciseName COLLATE NOCASE);

-- Sets indexes
CREATE INDEX IF NOT EXISTS idx_sets_exerciseId
  ON sets(exerciseId);

-- Exercises indexes
CREATE INDEX IF NOT EXISTS idx_exercises_bodyPart
  ON exercises(bodyPart);

CREATE INDEX IF NOT EXISTS idx_exercises_lastUsed
  ON exercises(lastUsed DESC);

CREATE INDEX IF NOT EXISTS idx_exercises_name
  ON exercises(name COLLATE NOCASE);
`;

export const INSERT_SCHEMA_VERSION_SQL = `
INSERT OR IGNORE INTO schema_version (version, appliedAt)
VALUES (?, datetime('now'));
`;
