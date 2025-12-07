# Tasks: SQLite Storage Implementation

**Input**: Design documents from `/specs/002-workout-tracker-sqlite-migration/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/storage.ts

**Context**: Phase 1 (DatabaseManager) and Phase 2 (Preferences storage) are already complete. This task list focuses on implementing SQLite-based storage classes that satisfy the existing storage contracts.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths assume repository structure from plan.md

---

## Phase 1: Setup (SQLite Infrastructure) ✅ COMPLETED

**Status**: Already implemented in previous PR (#3)

- ✅ T001 DatabaseManager singleton implementation
- ✅ T002 Schema definitions and SQL DDL
- ✅ T003 Contract tests for storage interfaces

---

## Phase 2: Foundational (Contract-Driven Development)

**Purpose**: Prepare for SQLite storage implementation

**⚠️ CRITICAL**: SQLite mock setup must be complete before implementation begins

- [X] T004 Setup SQLite mock for contract tests in tests/setup/mocks.ts
- [X] T005 Update test setup to support both Preferences and SQLite backends in tests/setup/setup.ts
- [X] T006 Create vitest.contract-sqlite.config.ts for SQLite-specific contract tests
- [X] T006.5 **TDD: Run existing contract tests with SQLite mock → verify they FAIL (RED phase)** before implementation begins

**Checkpoint**: Contract test infrastructure ready, tests verified RED (TDD cycle enforced)

---

## Phase 3: User Story 1 - Data Persistence with Relational Integrity (Priority: P1) 🎯 MVP

**Goal**: Implement SQLite storage classes that satisfy IWorkoutSessionStorage and IExerciseLibraryStorage contracts with foreign key constraints and cascade deletes

**Independent Test**: Create workout session with exercises → delete session → verify all related data is cascade-deleted

### Implementation for User Story 1

- [X] T007 [P] [US1] Create SqliteWorkoutSessionStorage class in src/services/database/storage.ts implementing IWorkoutSessionStorage
- [X] T008 [P] [US1] Create SqliteExerciseLibraryStorage class in src/services/database/storage.ts implementing IExerciseLibraryStorage
- [X] T009 [US1] Implement getAllSessions() with indexed query (idx_workout_sessions_date)
- [X] T010 [US1] Implement getSessionById() with parameterized query
- [X] T011 [US1] Implement getSessionsByDateRange() with indexed date filtering
- [X] T012 [US1] Implement createSession() with transaction and foreign key generation
- [X] T013 [US1] Implement updateSession() preserving createdAt and using getUpdatedTimestamp()
- [X] T014 [US1] Implement deleteSession() verifying CASCADE DELETE behavior
- [X] T015 [US1] Implement getPreviousMaxWeight() with exercise name query
- [X] T016 [P] [US1] Implement getAllExercises() from exercise library
- [X] T017 [P] [US1] Implement getExercisesByBodyPart() with indexed filtering
- [X] T018 [P] [US1] Implement getExerciseById() for library lookups
- [X] T019 [P] [US1] Implement searchExercises() with COLLATE NOCASE
- [X] T020 [US1] Implement createExercise() for library management
- [X] T021 [US1] Implement updateExercise() preserving createdAt
- [X] T022 [US1] Implement deleteExercise() from library
- [X] T023 [US1] Implement markExerciseAsUsed() updating lastUsed timestamp

**Checkpoint**: **TDD: All contract tests pass (GREEN phase)** - Same 67 tests as Preferences, RED→GREEN cycle complete

---

## Phase 4: User Story 2 - Efficient Querying and Indexing (Priority: P1)

**Goal**: Verify index usage and query performance meet spec requirements (<2s for 100 sessions)

**Independent Test**: Create 100 sessions → query date range → verify < 2s response time

### Implementation for User Story 2

- [ ] T024 [US2] Add query performance measurements to getAllSessions()
- [ ] T025 [US2] Verify idx_workout_sessions_date usage with EXPLAIN QUERY PLAN
- [ ] T026 [US2] Verify idx_workout_exercises_exerciseName usage for getPreviousMaxWeight()
- [ ] T027 [US2] Verify idx_exercises_bodyPart usage for getExercisesByBodyPart()
- [ ] T028 [US2] Add performance test: 100 sessions, date range query < 2s
- [ ] T029 [US2] Add performance test: 50 exercise history entries, search < 1s

**Checkpoint**: All indexed queries verified, performance tests pass

---

## Phase 5: User Story 3 - Schema Versioning and Migration (Priority: P2)

**Goal**: Expose schema version management through storage layer

**Independent Test**: Initialize database → verify schema_version table → getSchemaVersion() returns 1

### Implementation for User Story 3

- [X] T030 [US3] Add getSchemaVersion() method to DatabaseManager
- [X] T031 [US3] Add verifySchemaIntegrity() to check for schema drift
- [X] T032 [US3] Document future migration pattern in data-model.md

**Checkpoint**: Schema versioning accessible, migration pattern documented

---

## Phase 6: User Story 4 - Data Export and Import (Priority: P3)

**Goal**: Implement JSON export/import for backup and device migration

**Independent Test**: Create workout data → export to JSON → clear DB → import JSON → verify data restored

### Implementation for User Story 4

- [X] T033 [P] [US4] Implement exportToJson() in DatabaseManager
- [X] T034 [P] [US4] Implement importFromJson() in DatabaseManager
- [X] T035 [US4] Add transaction support for import operations
- [X] T036 [US4] Add JSON validation and error handling
- [ ] T037 [US4] Test export/import with 100 sessions (< 5s requirement)
- [X] T038 [US4] Handle invalid JSON format with proper error messages

**Checkpoint**: Export/import fully functional, performance requirements met

---

## Phase 7: Polish & Integration

**Purpose**: Final touches and cross-cutting concerns

- [X] T039 Add JSDoc comments to all public methods in SqliteWorkoutSessionStorage
- [X] T040 Add JSDoc comments to all public methods in SqliteExerciseLibraryStorage
- [X] T041 Update README with SQLite migration notes and usage examples
- [X] T042 Run full test suite (npm test) and verify 100% pass rate
- [X] T043 Verify no console errors or warnings in test output
- [X] T044 Run linter (npm run lint) and fix any issues

**Final Checkpoint**: All tasks complete, ready for PR

---

## Dependencies

### User Story Completion Order

```
Phase 2 (Foundational)
    ↓
Phase 3 (US1) ←── MVP SCOPE
    ↓
Phase 4 (US2)
    ↓
Phase 5 (US3)
    ↓
Phase 6 (US4)
    ↓
Phase 7 (Polish)
```

### Parallel Opportunities

**Within US1** (after Phase 2):
- T007, T008 (create both storage classes in parallel)
- T016-T019 (ExerciseLibrary reads can run parallel to WorkoutSession implementation)

**Within US2**:
- T024-T027 (all index verification can run in parallel)

**Within US4**:
- T033, T034 (export and import methods can be developed in parallel)

---

## Implementation Strategy

### MVP Scope (Phase 3 only)

For immediate value delivery, implement only **User Story 1**:
- SQLite storage classes satisfying all contracts
- CASCADE DELETE behavior verified
- All 67 contract tests passing

This provides a drop-in replacement for Preferences storage with relational integrity.

### Incremental Delivery

After MVP, deliver user stories sequentially:
1. **US2**: Add performance measurements and verification
2. **US3**: Expose schema versioning APIs
3. **US4**: Add export/import for backup functionality

---

## Test Coverage

**Contract Tests (existing)**: 67 tests
- PreferencesStorage: 26 tests
- WorkoutSessionStorage: 15 tests
- ExerciseLibraryStorage: 26 tests

**Performance Tests (new)**: 2 tests
- US2-1: Date range query on 100 sessions
- US2-2: Exercise name search on 50 entries

**Integration Tests (new)**: 4 tests
- US1: CASCADE DELETE verification
- US3: Schema version retrieval
- US4: Export/import round-trip
- US4: Invalid JSON handling

**Total**: 73 tests

---

## Success Criteria Mapping

- **SC-001**: Database init < 1s → Verified by existing DatabaseManager tests
- **SC-002**: 100 sessions query < 2s → T028 performance test
- **SC-003**: Exercise search < 1s → T029 performance test
- **SC-004**: CASCADE DELETE 0 orphans → T014 contract test
- **SC-005**: Export/import < 5s → T037 performance test
- **SC-006**: Concurrent init → Already verified in DatabaseManager
- **SC-007**: getSchemaVersion < 100ms → T030 implementation
- **SC-008**: Transaction rollback → Verified by contract error tests
- **SC-009**: Index usage → T025-T027 EXPLAIN QUERY PLAN
- **SC-010**: 100% contract pass → T042 full test suite

---

## Notes

- All file paths assume repository root structure
- SQLite implementation reuses existing UUID and timestamp utilities from src/utils/storage.ts
- Contract tests already exist - implementation must satisfy them
- DatabaseManager provides singleton connection - storage classes use getConnection()
- Follow TDD: Run existing contract tests → implement → verify green
