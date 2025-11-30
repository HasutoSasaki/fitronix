# Data Model: Workout Tracker Mobile App

**Feature**: 001-workout-tracker
**Created**: 2025-11-29
**Storage**: Capacitor Preferences API (key-value JSON)

## Entity Relationship Diagram

```
┌─────────────────┐
│  WorkoutSession │
│  (many)         │
└────────┬────────┘
         │ has many
         ▼
┌─────────────────┐         ┌─────────────┐
│ WorkoutExercise │────────▶│  Exercise   │
│  (many)         │ refs    │  (library)  │
└────────┬────────┘         └─────────────┘
         │ has many
         ▼
┌─────────────────┐
│      Set        │
│  (many)         │
└─────────────────┘

┌─────────────────┐         ┌─────────────┐
│   TimerPreset   │         │  BodyPart   │
│  (config)       │         │  (enum)     │
└─────────────────┘         └─────────────┘
```

---

## Entities

### 1. WorkoutSession

Represents a single training session (one day's workout).

**Fields**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | string (UUID) | Yes | Unique identifier | UUID v4 format |
| `date` | string (ISO 8601) | Yes | Session date | ISO timestamp |
| `exercises` | WorkoutExercise[] | Yes | Exercises in this session | Min 1 exercise |
| `totalTime` | number | No | Duration in seconds | >= 0 |
| `createdAt` | string (ISO 8601) | Yes | Creation timestamp | ISO timestamp |
| `updatedAt` | string (ISO 8601) | Yes | Last update timestamp | ISO timestamp |

**Relationships**:
- Has many `WorkoutExercise` (1:N)

**Indexes** (for search/filter):
- `date` (descending) - for history list sorted by most recent

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2025-11-29T10:30:00.000Z",
  "exercises": [
    { /* WorkoutExercise object */ }
  ],
  "totalTime": 3600,
  "createdAt": "2025-11-29T10:30:00.000Z",
  "updatedAt": "2025-11-29T11:30:00.000Z"
}
```

**State Transitions**:
1. **Draft** → User starts session, adds exercises
2. **In Progress** → User is actively recording sets
3. **Completed** → User saves session

---

### 2. WorkoutExercise

Instance of an exercise within a specific workout session.

**Fields**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | string (UUID) | Yes | Unique identifier | UUID v4 format |
| `sessionId` | string (UUID) | Yes | Parent session ID | Must exist in sessions |
| `exerciseId` | string (UUID) | No | Reference to Exercise library | Optional (user can input new) |
| `exerciseName` | string | Yes | Exercise name (denormalized) | 1-100 chars |
| `bodyPart` | string | Yes | Body part (denormalized) | Valid BodyPart enum |
| `sets` | Set[] | Yes | Sets performed | Min 1 set |
| `maxWeight` | number | No | Calculated max weight from sets | Derived field |
| `order` | number | Yes | Order in session | >= 0 |

**Relationships**:
- Belongs to one `WorkoutSession` (N:1)
- Has many `Set` (1:N)
- Optionally references one `Exercise` (N:1)

**Derivations**:
- `maxWeight`: `Math.max(...sets.map(s => s.weight))`

**Example**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "exerciseId": "770e8400-e29b-41d4-a716-446655440002",
  "exerciseName": "ベンチプレス",
  "bodyPart": "胸",
  "sets": [
    { /* Set object */ }
  ],
  "maxWeight": 80,
  "order": 0
}
```

---

### 3. Set

One set of an exercise (weight × reps).

**Fields**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | string (UUID) | Yes | Unique identifier | UUID v4 format |
| `exerciseId` | string (UUID) | Yes | Parent exercise ID | Must exist in workout exercises |
| `weight` | number | Yes | Weight in kg | >= 0, allows decimals (2.5kg increments) |
| `reps` | number | Yes | Repetitions | >= 1, integer only |
| `completedAt` | string (ISO 8601) | Yes | Completion timestamp | ISO timestamp |
| `order` | number | Yes | Order within exercise | >= 0 |

**Relationships**:
- Belongs to one `WorkoutExercise` (N:1)

**Validation Rules**:
- `weight`: Must be >= 0, allows decimals (e.g., 22.5, 80.0)
- `reps`: Must be >= 1, integer only (no decimals)

**Example**:
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "exerciseId": "660e8400-e29b-41d4-a716-446655440001",
  "weight": 80.0,
  "reps": 10,
  "completedAt": "2025-11-29T10:35:00.000Z",
  "order": 0
}
```

---

### 4. Exercise (Library)

Reusable exercise definition in user's library.

**Fields**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | string (UUID) | Yes | Unique identifier | UUID v4 format |
| `name` | string | Yes | Exercise name | 1-100 chars, unique per bodyPart |
| `bodyPart` | string | Yes | Body part | Valid BodyPart enum |
| `videoUrl` | string | No | Reference video URL | Valid URL or empty |
| `createdAt` | string (ISO 8601) | Yes | Creation timestamp | ISO timestamp |
| `lastUsed` | string (ISO 8601) | No | Last time used in workout | ISO timestamp |

**Relationships**:
- Referenced by `WorkoutExercise` (1:N)

**Indexes**:
- `bodyPart` - for filtering library by body part
- `lastUsed` (descending) - for showing recently used exercises

**Validation Rules**:
- `name`: Must be unique within the same `bodyPart`
- `videoUrl`: Must be valid URL format (http/https) or empty

**Example**:
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "ベンチプレス",
  "bodyPart": "胸",
  "videoUrl": "https://youtube.com/watch?v=example",
  "createdAt": "2025-11-20T12:00:00.000Z",
  "lastUsed": "2025-11-29T10:30:00.000Z"
}
```

---

### 5. BodyPart (Enum)

Predefined body parts for categorization.

**Values**:
- `胸` (Chest)
- `背中` (Back)
- `脚` (Legs)
- `肩` (Shoulders)
- `腕` (Arms)
- `腹筋` (Abs)
- `その他` (Other)

**Storage**: Stored as string literals in other entities, validated against enum.

---

### 6. TimerPreset

Predefined timer durations for rest between sets.

**Fields**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | string | Yes | Unique identifier | String ID (e.g., "short", "medium", "long") |
| `duration` | number | Yes | Duration in seconds | >= 30, <= 600 |
| `name` | string | Yes | Display name | Japanese label |

**Predefined Presets**:
```json
[
  { "id": "short", "duration": 60, "name": "短い休憩 (60秒)" },
  { "id": "medium", "duration": 90, "name": "普通の休憩 (90秒)" },
  { "id": "long", "duration": 120, "name": "長い休憩 (120秒)" },
  { "id": "custom", "duration": 0, "name": "カスタム" }
]
```

**Storage**: Hardcoded in app (not user-editable in MVP).

---

### 7. TimerState (Runtime)

Timer state (not persisted to storage, only in Zustand).

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isActive` | boolean | Yes | Timer is running |
| `isPaused` | boolean | Yes | Timer is paused |
| `remainingTime` | number | Yes | Seconds remaining |
| `notificationId` | number | No | Active notification ID |
| `presetId` | string | No | Selected preset |

**State Transitions**:
1. **Idle** → User taps "Start Timer"
2. **Running** → Timer counts down
3. **Paused** → User taps pause (from lock screen or app)
4. **Completed** → Timer reaches 0, notification fired

**Not Persisted**: This state is ephemeral (lost on app close).

---

## Storage Strategy

### Preferences API Keys

| Key | Value Type | Description |
|-----|------------|-------------|
| `workoutSessions` | JSON array | All workout sessions |
| `exerciseLibrary` | JSON array | User's exercise library |
| `appSettings` | JSON object | App settings (future) |

### Data Lifecycle

**Create Workflow** (Workout Session):
1. User starts new session → Generate UUID
2. User adds exercise → Generate UUID, add to `exercises` array
3. User adds set → Generate UUID, add to `sets` array
4. User saves → Serialize to JSON, store in `workoutSessions` key

**Read Workflow** (History):
1. Read `workoutSessions` key from Preferences API
2. Deserialize JSON array
3. Sort by `date` descending
4. Display in virtualized list

**Update Workflow** (Edit Exercise):
1. Read `exerciseLibrary` key
2. Find exercise by ID
3. Update fields
4. Serialize and save back to `exerciseLibrary` key

**Delete Workflow** (Remove Exercise):
1. Read `exerciseLibrary` key
2. Filter out exercise by ID
3. Serialize and save back to `exerciseLibrary` key

---

## Validation Rules Summary

| Entity | Field | Rule |
|--------|-------|------|
| WorkoutSession | `date` | ISO 8601 timestamp |
| WorkoutSession | `exercises` | Min 1 exercise |
| WorkoutExercise | `exerciseName` | 1-100 chars |
| WorkoutExercise | `bodyPart` | Valid enum value |
| Set | `weight` | >= 0, allows decimals |
| Set | `reps` | >= 1, integer only |
| Exercise | `name` | 1-100 chars, unique per bodyPart |
| Exercise | `videoUrl` | Valid URL or empty |

---

## Migration Strategy (Future)

### V1 → V2 (Add Cloud Sync)

If cloud sync is added later:
- Add `syncedAt` timestamp to all entities
- Add `deletedAt` for soft deletes
- Add `userId` foreign key
- Implement conflict resolution (last-write-wins or CRDT)

---

## Performance Considerations

### Data Volume Estimates

| Entity | Est. Count | Storage Size |
|--------|------------|--------------|
| WorkoutSession | 100-500 | ~50KB per session (with sets) |
| Exercise | 10-50 | ~1KB per exercise |
| Set | 1,000-5,000 | ~100B per set |
| **Total** | | **5-25MB** |

### Optimization Strategies

1. **Lazy Loading**: Load full session details only when user taps (not in list)
2. **Virtualization**: react-window for history list (only render visible items)
3. **Indexes**: Pre-sort sessions by date for fast lookup
4. **Caching**: Keep last 10 sessions in Zustand for instant access

---

## Example Complete Workout Session

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2025-11-29T10:30:00.000Z",
  "totalTime": 3600,
  "createdAt": "2025-11-29T10:30:00.000Z",
  "updatedAt": "2025-11-29T11:30:00.000Z",
  "exercises": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "exerciseId": "770e8400-e29b-41d4-a716-446655440002",
      "exerciseName": "ベンチプレス",
      "bodyPart": "胸",
      "maxWeight": 80,
      "order": 0,
      "sets": [
        {
          "id": "880e8400-e29b-41d4-a716-446655440003",
          "exerciseId": "660e8400-e29b-41d4-a716-446655440001",
          "weight": 80.0,
          "reps": 10,
          "completedAt": "2025-11-29T10:35:00.000Z",
          "order": 0
        },
        {
          "id": "990e8400-e29b-41d4-a716-446655440004",
          "exerciseId": "660e8400-e29b-41d4-a716-446655440001",
          "weight": 80.0,
          "reps": 8,
          "completedAt": "2025-11-29T10:38:00.000Z",
          "order": 1
        },
        {
          "id": "aa0e8400-e29b-41d4-a716-446655440005",
          "exerciseId": "660e8400-e29b-41d4-a716-446655440001",
          "weight": 75.0,
          "reps": 10,
          "completedAt": "2025-11-29T10:41:00.000Z",
          "order": 2
        }
      ]
    },
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440006",
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "exerciseId": "cc0e8400-e29b-41d4-a716-446655440007",
      "exerciseName": "スクワット",
      "bodyPart": "脚",
      "maxWeight": 100,
      "order": 1,
      "sets": [
        {
          "id": "dd0e8400-e29b-41d4-a716-446655440008",
          "exerciseId": "bb0e8400-e29b-41d4-a716-446655440006",
          "weight": 100.0,
          "reps": 12,
          "completedAt": "2025-11-29T10:50:00.000Z",
          "order": 0
        }
      ]
    }
  ]
}
```
