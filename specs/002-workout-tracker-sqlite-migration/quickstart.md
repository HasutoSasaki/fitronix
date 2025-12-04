# Quickstart Guide: SQLite Database

**Audience**: Developers working on Fitronix Workout Tracker
**Prerequisites**: Node.js 18+, Capacitor 7, basic SQL knowledge
**Estimated Time**: 15 minutes

---

## Overview

This guide shows you how to:
1. Initialize the SQLite database
2. Use storage interfaces in your components
3. Run contract tests
4. Inspect the database with SQLite tools
5. Troubleshoot common issues

---

## 1. Database Initialization

The database is auto-initialized on first access via `DatabaseManager.getConnection()`.

### Automatic Initialization (Recommended)

```typescript
import DatabaseManager from './services/database/DatabaseManager';

// Anywhere in your app - first call initializes DB
const db = await DatabaseManager.getConnection();
```

### Manual Initialization (Optional)

```typescript
import DatabaseManager from './services/database/DatabaseManager';

// Initialize with custom database name
await DatabaseManager.initialize('fitronix_workout_tracker');

// Or use in-memory database (testing only)
await DatabaseManager.initialize(':memory:');
```

### Where to Initialize

**Option A**: In App.tsx (recommended)

```typescript
// src/App.tsx
import { useEffect } from 'react';
import DatabaseManager from './services/database/DatabaseManager';

function App() {
  useEffect(() => {
    const initDB = async () => {
      try {
        await DatabaseManager.initialize();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initDB();
  }, []);

  return <div>Your app content</div>;
}
```

**Option B**: Lazy initialization (on demand)

```typescript
// Storage layer calls getConnection(), which auto-initializes
const storage = new WorkoutSessionStorage();
const sessions = await storage.getAllSessions();  // DB initialized here if needed
```

---

## 2. Using Storage Interfaces

### Workout Session Storage

```typescript
import { WorkoutSessionStorage } from './services/storage';
import { BodyPart } from './types/models';

const storage = new WorkoutSessionStorage();

// Create a new workout session
const session = await storage.createSession({
  date: new Date().toISOString(),
  exercises: [
    {
      id: 'ex1',  // Temporary ID (will be replaced with UUID)
      sessionId: '',  // Will be auto-filled
      exerciseName: 'ベンチプレス',
      bodyPart: BodyPart.CHEST,
      sets: [
        {
          id: 'set1',
          exerciseId: 'ex1',
          weight: 80,
          reps: 10,
          completedAt: new Date().toISOString(),
          order: 0,
        },
      ],
      order: 0,
    },
  ],
});

console.log('Created session:', session.id);

// Get all sessions
const allSessions = await storage.getAllSessions();
console.log('Total sessions:', allSessions.length);

// Get previous max weight
const maxWeight = await storage.getPreviousMaxWeight('ベンチプレス');
console.log('Previous max:', maxWeight);  // e.g., 82.5
```

### Exercise Library Storage

```typescript
import { ExerciseLibraryStorage } from './services/storage';
import { BodyPart } from './types/models';

const storage = new ExerciseLibraryStorage();

// Add exercise to library
const exercise = await storage.createExercise({
  name: 'デッドリフト',
  bodyPart: BodyPart.BACK,
  videoUrl: 'https://youtube.com/watch?v=example',
});

// Get exercises by body part
const chestExercises = await storage.getExercisesByBodyPart(BodyPart.CHEST);

// Update last used timestamp
await storage.updateLastUsed(exercise.id, new Date().toISOString());
```

### Preferences Storage

```typescript
import { PreferencesStorage } from './services/storage';

const storage = new PreferencesStorage();

// Save preference
await storage.set('theme', 'dark');
await storage.set('defaultRestTime', '90');

// Get preference
const theme = await storage.get('theme');  // 'dark'

// Get all preferences
const allPrefs = await storage.getAll();
console.log(allPrefs);  // { theme: 'dark', defaultRestTime: '90' }
```

---

## 3. Running Contract Tests

Contract tests verify that storage implementations satisfy the expected behavior.

### Run All Contract Tests

```bash
npm run test:contract
```

### Run Specific Contract Test

```bash
npx vitest run tests/contract/storage/workout-sessions.test.ts
```

### Watch Mode (for TDD)

```bash
npx vitest watch tests/contract/storage/
```

### Test Output Example

```
✓ tests/contract/storage/workout-sessions.test.ts (14 tests)
  ✓ Contract: IWorkoutSessionStorage
    ✓ getAllSessions() returns empty array when no sessions exist
    ✓ getAllSessions() returns all sessions sorted by date descending
    ✓ getSessionById() returns null when session does not exist
    ✓ createSession() generates UUID for new session
    ✓ deleteSession() cascades to delete exercises and sets
    ...

Test Files  1 passed (1)
     Tests  14 passed (14)
  Start at  10:00:00
  Duration  1.23s
```

---

## 4. Inspecting the Database

### Option A: SQLite Browser (Desktop App)

1. **Download**: [DB Browser for SQLite](https://sqlitebrowser.org/)
2. **Locate Database File**:
   - **iOS Simulator**: `~/Library/Developer/CoreSimulator/Devices/<DEVICE_ID>/data/Containers/Data/Application/<APP_ID>/Documents/databases/fitronix_workout_tracker.db`
   - **Android Emulator**: Use `adb pull /data/data/com.fitronix.workouttracker/databases/fitronix_workout_tracker.db`
3. **Open in DB Browser**: File → Open Database → Select file
4. **Browse Data**: Navigate to "Browse Data" tab, select table

### Option B: Command Line (sqlite3)

```bash
# macOS/Linux - locate database file first
cd ~/Library/Developer/CoreSimulator/Devices/<DEVICE_ID>/data/Containers/Data/Application/<APP_ID>/Documents/databases/

# Open database
sqlite3 fitronix_workout_tracker.db

# Show tables
.tables

# Show schema
.schema workout_sessions

# Query data
SELECT * FROM workout_sessions ORDER BY date DESC LIMIT 10;

# Check indexes
.indexes

# Explain query plan (verify index usage)
EXPLAIN QUERY PLAN SELECT * FROM workout_sessions WHERE date > '2025-11-01' ORDER BY date DESC;

# Exit
.quit
```

### Useful SQL Queries

```sql
-- Count total sessions
SELECT COUNT(*) FROM workout_sessions;

-- Count exercises per session
SELECT
  ws.id,
  ws.date,
  COUNT(we.id) as exercise_count
FROM workout_sessions ws
LEFT JOIN workout_exercises we ON we.sessionId = ws.id
GROUP BY ws.id
ORDER BY ws.date DESC;

-- Find exercises with most sets
SELECT
  we.exerciseName,
  COUNT(s.id) as total_sets
FROM workout_exercises we
JOIN sets s ON s.exerciseId = we.id
GROUP BY we.exerciseName
ORDER BY total_sets DESC;

-- Get schema version
SELECT * FROM schema_version;
```

---

## 5. Troubleshooting

### Issue: "Database not initialized"

**Error**:
```
Error: Database connection is not available
```

**Cause**: Called storage method before database initialization.

**Solution**: Ensure `DatabaseManager.initialize()` is called first, or use `getConnection()` which auto-initializes:

```typescript
// Option 1: Explicit initialization
await DatabaseManager.initialize();
const storage = new WorkoutSessionStorage();

// Option 2: Auto-initialization (recommended)
const storage = new WorkoutSessionStorage();
await storage.getAllSessions();  // Initializes DB on first call
```

---

### Issue: "Constraint violation: weight >= 0"

**Error**:
```
Error: CHECK constraint failed: weight >= 0
```

**Cause**: Tried to insert set with negative weight.

**Solution**: Validate weight before saving:

```typescript
const validateWeight = (weight: number) => {
  if (weight < 0) {
    throw new Error('Weight must be >= 0');
  }
};
```

---

### Issue: "Foreign key constraint failed"

**Error**:
```
Error: FOREIGN KEY constraint failed
```

**Cause**: Tried to insert exercise with non-existent sessionId.

**Solution**: Ensure parent session exists before creating exercises:

```typescript
// Correct: Create session first
const session = await storage.createSession({ date: '...', exercises: [] });

// Then add exercises
await storage.updateSession(session.id, {
  exercises: [{ sessionId: session.id, ... }],
});
```

---

### Issue: Tests failing with "table already exists"

**Error**:
```
Error: table workout_sessions already exists
```

**Cause**: Test database not cleaned up between tests.

**Solution**: Use `beforeEach()` to reset database:

```typescript
import DatabaseManager from '../../../src/services/database/DatabaseManager';

beforeEach(async () => {
  await DatabaseManager.close();  // Close previous connection
  await DatabaseManager.initialize(':memory:');  // Fresh in-memory DB
});
```

---

### Issue: Slow queries (> 2 seconds)

**Symptom**: `getAllSessions()` takes > 2 seconds with 100+ sessions.

**Diagnosis**: Check if index is being used:

```sql
EXPLAIN QUERY PLAN SELECT * FROM workout_sessions ORDER BY date DESC;
```

**Expected Output**:
```
SEARCH TABLE workout_sessions USING INDEX idx_workout_sessions_date
```

**If index is NOT used**:
- Verify index exists: `.indexes workout_sessions`
- Rebuild index: `REINDEX idx_workout_sessions_date;`
- Check SQLite version (should be >= 3.8.0)

---

### Issue: "Cannot find module '@capacitor-community/sqlite'"

**Error**:
```
Module not found: Error: Can't resolve '@capacitor-community/sqlite'
```

**Cause**: SQLite plugin not installed.

**Solution**: Install plugin and sync Capacitor:

```bash
npm install @capacitor-community/sqlite@^7.0.2
npx cap sync
```

For iOS:
```bash
cd ios/App
pod install
cd ../..
```

For Android:
```bash
npx cap sync android
```

---

## 6. Development Workflow

### TDD Workflow (Recommended)

1. **Red Phase**: Write failing contract test
   ```typescript
   it('should return previous max weight', async () => {
     const maxWeight = await storage.getPreviousMaxWeight('ベンチプレス');
     expect(maxWeight).toBe(82.5);
   });
   ```

2. **Green Phase**: Implement minimal code to pass
   ```typescript
   async getPreviousMaxWeight(exerciseName: string): Promise<number | null> {
     // Minimal implementation (仮実装)
     return 82.5;  // Hardcoded to pass test
   }
   ```

3. **Refactor Phase**: Improve code quality
   ```typescript
   async getPreviousMaxWeight(exerciseName: string): Promise<number | null> {
     const db = await DatabaseManager.getConnection();
     const result = await db.query(`
       SELECT MAX(weight) as maxWeight
       FROM sets s
       JOIN workout_exercises we ON we.id = s.exerciseId
       WHERE we.exerciseName = ? COLLATE NOCASE
     `, [exerciseName]);

     return result.values?.[0]?.maxWeight ?? null;
   }
   ```

---

## 7. Best Practices

### ✅ DO

- **Use UUIDs for IDs**: Generate with `uuid` package
  ```typescript
  import { v4 as uuidv4 } from 'uuid';
  const id = uuidv4();
  ```

- **Use ISO 8601 for timestamps**:
  ```typescript
  const timestamp = new Date().toISOString();  // '2025-11-29T10:00:00.123Z'
  ```

- **Wrap operations in try-catch**:
  ```typescript
  try {
    await storage.createSession({ ... });
  } catch (error) {
    console.error('Failed to create session:', error);
    // Show user-friendly error message
  }
  ```

- **Close database when testing**:
  ```typescript
  afterAll(async () => {
    await DatabaseManager.close();
  });
  ```

### ❌ DON'T

- **Don't hardcode database name**:
  ```typescript
  // ❌ BAD
  await DatabaseManager.initialize('my_database');

  // ✅ GOOD
  await DatabaseManager.initialize();  // Uses default name
  ```

- **Don't skip validation**:
  ```typescript
  // ❌ BAD
  await storage.createSession({ date: 'invalid-date', ... });

  // ✅ GOOD
  if (!isISO8601(date)) {
    throw new Error('Invalid date format');
  }
  ```

- **Don't mutate input objects**:
  ```typescript
  // ❌ BAD
  async createSession(data) {
    data.id = uuidv4();  // Mutates input
    return data;
  }

  // ✅ GOOD
  async createSession(data) {
    return { ...data, id: uuidv4() };  // Returns new object
  }
  ```

---

## 8. Performance Tips

### Batch Inserts

```typescript
// ❌ SLOW: Multiple round-trips
for (const exercise of exercises) {
  await storage.createExercise(exercise);
}

// ✅ FAST: Single transaction
const db = await DatabaseManager.getConnection();
await db.transaction(async (tx) => {
  for (const exercise of exercises) {
    await tx.execute('INSERT INTO exercises ...', [exercise]);
  }
});
```

### Use Indexes

```typescript
// ❌ SLOW: Full table scan
SELECT * FROM workout_exercises WHERE exerciseName = 'ベンチプレス';

// ✅ FAST: Uses idx_workout_exercises_exerciseName
SELECT * FROM workout_exercises WHERE exerciseName = 'ベンチプレス' COLLATE NOCASE;
```

### Limit Results

```typescript
// ❌ SLOW: Fetches all 1000 sessions
const allSessions = await storage.getAllSessions();

// ✅ FAST: Fetches only 20
const recentSessions = await storage.getSessionsByDateRange(
  lastMonth,
  today
).then(sessions => sessions.slice(0, 20));
```

---

## 9. Next Steps

- **Read**: [data-model.md](data-model.md) for detailed schema documentation
- **Read**: [contracts/storage.ts](contracts/storage.ts) for complete API reference
- **Read**: [research.md](research.md) for architecture decisions
- **Run**: `npm run test:contract` to verify your implementation
- **Implement**: Phase 2 tasks (T028-T032) from [../001-workout-tracker/tasks.md](../001-workout-tracker/tasks.md)

---

## 10. Getting Help

- **Contract Tests**: Check `tests/contract/storage/*.test.ts` for expected behavior
- **Database Schema**: See `src/services/database/schema.ts`
- **Type Definitions**: See `src/types/models.ts`
- **SQLite Docs**: https://www.sqlite.org/docs.html
- **Capacitor SQLite Plugin**: https://github.com/capacitor-community/sqlite

---

**Happy Coding!** 🚀
