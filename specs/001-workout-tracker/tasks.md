# Tasks: Workout Tracker Mobile App

**Input**: Design documents from `/specs/001-workout-tracker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: **MANDATORY** - TDD approach per constitution v1.1.0 (Kent Beck & 和田卓人 methodologies)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US6)
- Include exact file paths in descriptions

## Path Conventions

- **Mobile project**: `src/` at repository root
- **Tests**: `tests/unit/`, `tests/integration/`, `tests/contract/`
- **Native**: `ios/`, `android/` (managed by Capacitor)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize React + TypeScript + Vite project with package.json
- [x] T002 Install core dependencies: React 19, TypeScript 5.7, Vite 6, Capacitor 6
- [x] T003 [P] Install Zustand 5 for state management
- [x] T004 [P] Install react-window for virtualization
- [x] T005 [P] Install Vitest 3 and React Testing Library 16 for testing
- [ ] T006 [P] Configure ESLint and Prettier with constitution standards
- [ ] T007 Initialize Capacitor with app ID com.fitronix.workouttracker
- [ ] T008 Add iOS platform with npx cap add ios
- [ ] T009 Add Android platform with npx cap add android
- [ ] T010 [P] Install @capacitor/preferences plugin
- [ ] T011 [P] Install @capacitor/local-notifications plugin
- [ ] T012 Create src/ directory structure (components/, hooks/, stores/, services/, types/, utils/)
- [ ] T013 Create tests/ directory structure (unit/, integration/, contract/, setup/)
- [ ] T014 Configure Vitest in vitest.config.ts
- [ ] T015 [P] Setup test mocks for Capacitor plugins in tests/setup/mocks.ts
- [ ] T016 [P] Configure TypeScript strict mode in tsconfig.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Type Definitions (Foundation)

- [ ] T017 [P] Define WorkoutSession type in src/types/models.ts
- [ ] T018 [P] Define WorkoutExercise type in src/types/models.ts
- [ ] T019 [P] Define Set type in src/types/models.ts
- [ ] T020 [P] Define Exercise type in src/types/models.ts
- [ ] T021 [P] Define BodyPart enum in src/types/models.ts
- [ ] T022 [P] Define TimerPreset type in src/types/models.ts
- [ ] T023 [P] Define TimerState type in src/types/models.ts

### Storage Layer (Foundation - TDD)

**Red Phase**:
- [ ] T024 [P] Contract test for IPreferencesStorage.get in tests/contract/storage/preferences.test.ts
- [ ] T025 [P] Contract test for IPreferencesStorage.set in tests/contract/storage/preferences.test.ts
- [ ] T026 [P] Contract test for IWorkoutSessionStorage in tests/contract/storage/workout-sessions.test.ts
- [ ] T027 [P] Contract test for IExerciseLibraryStorage in tests/contract/storage/exercise-library.test.ts

**Green Phase**:
- [ ] T028 Implement PreferencesStorage in src/services/storage.ts (仮実装 - make T024-T025 pass)
- [ ] T029 Implement WorkoutSessionStorage in src/services/storage.ts (仮実装 - make T026 pass)
- [ ] T030 Implement ExerciseLibraryStorage in src/services/storage.ts (仮実装 - make T027 pass)

**Refactor Phase**:
- [ ] T031 Refactor storage implementations with proper error handling and validation
- [ ] T032 Add storage utility functions in src/utils/storage.ts

### Shared UI Components (Foundation)

- [ ] T033 [P] Create Button component in src/components/shared/Button.tsx
- [ ] T034 [P] Create InputField component in src/components/shared/InputField.tsx
- [ ] T035 [P] Create Modal component in src/components/shared/Modal.tsx
- [ ] T036 [P] Create LoadingSpinner component in src/components/shared/LoadingSpinner.tsx
- [ ] T037 [P] Create EmptyState component in src/components/shared/EmptyState.tsx
- [ ] T038 [P] Create ErrorMessage component in src/components/shared/ErrorMessage.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 6 - Seamless Navigation (Priority: P1) 🎯 MVP Foundation

**Goal**: Implement tab bar navigation to enable access to all app screens

**Independent Test**: アプリ起動→タブバーで「履歴」タップ→履歴画面表示→「ライブラリ」タップ→ライブラリ画面表示→「記録」タップ→記録画面表示、の流れがスムーズに動作することを確認

**Note**: US6 must be implemented alongside US1 as it provides navigation structure

### Tests for User Story 6 (TDD - Red Phase)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T039 [P] [US6] Unit test for TabBar component in tests/unit/components/TabBar.test.tsx
- [ ] T040 [P] [US6] Unit test for TabItem component in tests/unit/components/TabItem.test.tsx
- [ ] T041 [P] [US6] Integration test for tab navigation flow in tests/integration/navigation.test.tsx

### Implementation for User Story 6 (Green Phase)

- [ ] T042 [P] [US6] Create TabItem component in src/components/shared/TabItem.tsx (仮実装)
- [ ] T043 [US6] Create TabBar component in src/components/shared/TabBar.tsx (依存: T042)
- [ ] T044 [US6] Create App.tsx with tab navigation state management
- [ ] T045 [P] [US6] Create RecordScreen placeholder in src/components/workout/RecordScreen.tsx
- [ ] T046 [P] [US6] Create HistoryScreen placeholder in src/components/history/HistoryScreen.tsx
- [ ] T047 [P] [US6] Create LibraryScreen placeholder in src/components/library/LibraryScreen.tsx
- [ ] T048 [US6] Implement dark theme styles in src/styles/theme.ts
- [ ] T049 [US6] Apply WCAG 2.1 AA touch targets (44x44dp minimum) to TabBar

### Refactor Phase for User Story 6

- [ ] T050 [US6] Refactor navigation state to use React Router (if needed for deep linking)
- [ ] T051 [US6] Add accessibility labels and screen reader support

**Checkpoint**: At this point, User Story 6 should be fully functional - tab navigation works independently

---

## Phase 4: User Story 1 - Basic Workout Recording (Priority: P1) 🎯 MVP Core

**Goal**: ユーザーがワークアウトセッションを開始し、部位・種目・セットを記録できる

**Independent Test**: ユーザーが新規セッションを開始→部位選択→種目選択→重量とレップ数入力→保存、の一連の流れを完了でき、保存したデータがアプリ再起動後も残っていることを確認できる

### Tests for User Story 1 (TDD - Red Phase)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T052 [P] [US1] Unit test for useActiveWorkout hook in tests/unit/hooks/useActiveWorkout.test.ts
- [ ] T053 [P] [US1] Unit test for useWorkoutStorage hook in tests/unit/hooks/useWorkoutStorage.test.ts
- [ ] T054 [P] [US1] Unit test for calculations.ts (max weight) in tests/unit/services/calculations.test.ts
- [ ] T055 [P] [US1] Integration test for complete workout recording flow in tests/integration/workout-recording.test.tsx
- [ ] T056 [P] [US1] Integration test for previous max weight display in tests/integration/previous-max.test.tsx

### Implementation for User Story 1 (Green Phase)

**Zustand Store**:
- [ ] T057 [P] [US1] Create workoutStore in src/stores/workoutStore.ts (仮実装 - minimal state)

**Custom Hooks**:
- [ ] T058 [P] [US1] Implement useWorkoutStorage hook in src/hooks/useWorkoutStorage.ts (三角測量)
- [ ] T059 [US1] Implement useActiveWorkout hook in src/hooks/useActiveWorkout.ts (依存: T057, T058)

**Business Logic**:
- [ ] T060 [P] [US1] Implement calculateMaxWeight in src/services/calculations.ts
- [ ] T061 [P] [US1] Implement date/time utilities in src/utils/date.ts
- [ ] T062 [P] [US1] Implement validation helpers in src/utils/validation.ts

**UI Components**:
- [ ] T063 [P] [US1] Create SetRow component in src/components/workout/SetRow.tsx
- [ ] T064 [US1] Create SetInput component in src/components/workout/SetInput.tsx (依存: T063)
- [ ] T065 [P] [US1] Create ExerciseInput component in src/components/workout/ExerciseInput.tsx
- [ ] T066 [US1] Implement WorkoutRecordingScreen in src/components/workout/WorkoutRecordingScreen.tsx (依存: T064, T065)
- [ ] T067 [US1] Connect WorkoutRecordingScreen to RecordScreen placeholder from T045

**Data Persistence**:
- [ ] T068 [US1] Integrate useWorkoutStorage with Capacitor Preferences API
- [ ] T069 [US1] Test data persistence across app restart (manual iOS/Android simulator test)

### Refactor Phase for User Story 1

- [ ] T070 [US1] Refactor workout store with proper TypeScript types and error handling
- [ ] T071 [US1] Add input validation for weight (>= 0, decimals allowed) and reps (>= 1, integers only)
- [ ] T072 [US1] Add user-facing error messages in Japanese
- [ ] T073 [US1] Optimize re-renders with React.memo for SetRow components

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can record workouts and see previous max weight

---

## Phase 5: User Story 2 - One-Handed Optimized Input (Priority: P2)

**Goal**: 片手操作に最適化されたテンキーパッドで重量・レップ数を素早く入力できる

**Independent Test**: 重量入力フィールドをタップ→画面下部にテンキーパッド表示→クイックボタン「22.5kg」をタップ→「完了」で確定、の流れがスムーズに完了できることを確認

### Tests for User Story 2 (TDD - Red Phase)

- [ ] T074 [P] [US2] Unit test for NumericKeypad component in tests/unit/components/keypad/NumericKeypad.test.tsx
- [ ] T075 [P] [US2] Unit test for QuickButtons component in tests/unit/components/keypad/QuickButtons.test.tsx
- [ ] T076 [P] [US2] Unit test for useKeypad hook in tests/unit/hooks/useKeypad.test.ts
- [ ] T077 [P] [US2] Integration test for keypad input flow (weight) in tests/integration/keypad-weight.test.tsx
- [ ] T078 [P] [US2] Integration test for keypad input flow (reps) in tests/integration/keypad-reps.test.tsx

### Implementation for User Story 2 (Green Phase)

**Custom Hook**:
- [ ] T079 [P] [US2] Implement useKeypad hook in src/hooks/useKeypad.ts (仮実装)

**UI Components**:
- [ ] T080 [P] [US2] Create QuickButtons component in src/components/keypad/QuickButtons.tsx (仮実装)
- [ ] T081 [US2] Create NumericKeypad component in src/components/keypad/NumericKeypad.tsx (依存: T080)
- [ ] T082 [US2] Integrate NumericKeypad with SetInput component (update T064)
- [ ] T083 [US2] Add keypad open/close logic with useKeypad hook

**Touch Target Compliance**:
- [ ] T084 [US2] Ensure all keypad buttons are 60x60dp (exceeds WCAG 2.1 AA 44x44dp minimum)
- [ ] T085 [US2] Add visual feedback for button presses (active state styling)

### Refactor Phase for User Story 2

- [ ] T086 [US2] Refactor QuickButtons to use constants from src/utils/constants.ts
- [ ] T087 [US2] Add decimal point validation (weight only, not reps)
- [ ] T088 [US2] Optimize keypad animations for 60fps performance

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - one-handed input enhances workout recording

---

## Phase 6: User Story 3 - Rest Timer with Lock Screen Support (Priority: P2)

**Goal**: セット間の休憩タイマーをロック画面で操作できる

**Independent Test**: セット完了後にタイマー開始→iPhoneをロック→ロック画面にタイマー表示→通知から一時停止・再開→タイマー終了時に通知音とバイブレーション、の流れを確認

### Tests for User Story 3 (TDD - Red Phase)

- [ ] T089 [P] [US3] Unit test for useTimer hook in tests/unit/hooks/useTimer.test.ts
- [ ] T090 [P] [US3] Unit test for useNotifications hook in tests/unit/hooks/useNotifications.test.ts
- [ ] T091 [P] [US3] Unit test for TimerNotificationManager in tests/unit/services/notifications.test.ts
- [ ] T092 [P] [US3] Unit test for RestTimer component in tests/unit/components/timer/RestTimer.test.tsx
- [ ] T093 [P] [US3] Integration test for timer countdown in tests/integration/timer-countdown.test.tsx
- [ ] T094 [P] [US3] Integration test for lock screen actions in tests/integration/timer-lockscreen.test.tsx

### Implementation for User Story 3 (Green Phase)

**Zustand Store**:
- [ ] T095 [P] [US3] Create timerStore in src/stores/timerStore.ts (仮実装)

**Services**:
- [ ] T096 [P] [US3] Implement TimerNotificationManager in src/services/notifications.ts (仮実装)

**Custom Hooks**:
- [ ] T097 [P] [US3] Implement useNotifications hook in src/hooks/useNotifications.ts (三角測量)
- [ ] T098 [US3] Implement useTimer hook in src/hooks/useTimer.ts (依存: T095, T097)

**UI Components**:
- [ ] T099 [P] [US3] Create TimerDisplay component in src/components/timer/TimerDisplay.tsx
- [ ] T100 [P] [US3] Create TimerPresetSelector component in src/components/timer/TimerPresetSelector.tsx
- [ ] T101 [US3] Create RestTimer component in src/components/timer/RestTimer.tsx (依存: T099, T100)
- [ ] T102 [US3] Integrate RestTimer into WorkoutRecordingScreen (update T066)

**Lock Screen Integration**:
- [ ] T103 [US3] Request notification permissions on timer first use
- [ ] T104 [US3] Schedule ongoing notification with pause/resume/skip actions
- [ ] T105 [US3] Listen to notification action events (pause, resume, skip)
- [ ] T106 [US3] Update notification body with remaining time every second
- [ ] T107 [US3] Fire "rest complete" notification with sound + vibration at 0 seconds

### Refactor Phase for User Story 3

- [ ] T108 [US3] Refactor timer to use setInterval with drift correction
- [ ] T109 [US3] Handle app backgrounding/foregrounding edge cases
- [ ] T110 [US3] Add error handling for notification permission denial
- [ ] T111 [US3] Test timer accuracy on iOS and Android simulators

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - timer enhances rest period management

---

## Phase 7: User Story 4 - Workout History Review (Priority: P3)

**Goal**: 過去のワークアウト履歴を閲覧し、メニューを再利用できる

**Independent Test**: 「履歴」タブを開く→過去のワークアウトリストが日付順に表示→任意の履歴をタップ→詳細が表示される、の流れを確認

### Tests for User Story 4 (TDD - Red Phase)

- [ ] T112 [P] [US4] Unit test for HistoryItem component in tests/unit/components/history/HistoryItem.test.tsx
- [ ] T113 [P] [US4] Unit test for ExerciseDetailCard component in tests/unit/components/history/ExerciseDetailCard.test.tsx
- [ ] T114 [P] [US4] Integration test for history list virtualization in tests/integration/history-list.test.tsx
- [ ] T115 [P] [US4] Integration test for workout reuse flow in tests/integration/workout-reuse.test.tsx

### Implementation for User Story 4 (Green Phase)

**UI Components**:
- [ ] T116 [P] [US4] Create HistoryItem component in src/components/history/HistoryItem.tsx (仮実装)
- [ ] T117 [P] [US4] Create ExerciseDetailCard component in src/components/history/ExerciseDetailCard.tsx (仮実装)
- [ ] T118 [US4] Implement HistoryListScreen in src/components/history/HistoryListScreen.tsx (依存: T116)
- [ ] T119 [US4] Connect HistoryListScreen to HistoryScreen placeholder from T046
- [ ] T120 [US4] Implement WorkoutDetailScreen in src/components/history/WorkoutDetailScreen.tsx (依存: T117)

**Virtualization**:
- [ ] T121 [US4] Integrate react-window FixedSizeList in HistoryListScreen for 100+ sessions
- [ ] T122 [US4] Optimize list item height for consistent scrolling

**Workout Reuse**:
- [ ] T123 [US4] Add "このメニューを再利用" button in WorkoutDetailScreen
- [ ] T124 [US4] Implement reuse logic to populate activeWorkout from history session
- [ ] T125 [US4] Navigate to RecordScreen with pre-filled exercises

### Refactor Phase for User Story 4

- [ ] T126 [US4] Add empty state when no history exists ("まだデータがありません")
- [ ] T127 [US4] Add swipe-to-delete gesture for history items (iOS/Android native feel)
- [ ] T128 [US4] Optimize history data loading (lazy load session details)

**Checkpoint**: At this point, User Stories 1-4 should all work independently - history enables progress tracking

---

## Phase 8: User Story 5 - Exercise Library Management (Priority: P4)

**Goal**: 部位ごとにトレーニング種目を登録・管理できる

**Independent Test**: 「ライブラリ」タブを開く→「新規種目追加」→部位「背中」、種目名「デッドリフト」、動画URL入力→保存→ライブラリに表示される、の流れを確認

### Tests for User Story 5 (TDD - Red Phase)

- [ ] T129 [P] [US5] Unit test for useExerciseLibrary hook in tests/unit/hooks/useExerciseLibrary.test.ts
- [ ] T130 [P] [US5] Unit test for ExerciseForm component in tests/unit/components/library/ExerciseForm.test.tsx
- [ ] T131 [P] [US5] Unit test for ExerciseCard component in tests/unit/components/library/ExerciseCard.test.tsx
- [ ] T132 [P] [US5] Unit test for BodyPartFilter component in tests/unit/components/library/BodyPartFilter.test.tsx
- [ ] T133 [P] [US5] Integration test for exercise CRUD operations in tests/integration/exercise-library.test.tsx

### Implementation for User Story 5 (Green Phase)

**Zustand Store**:
- [ ] T134 [P] [US5] Create libraryStore in src/stores/libraryStore.ts (仮実装)

**Custom Hook**:
- [ ] T135 [US5] Implement useExerciseLibrary hook in src/hooks/useExerciseLibrary.ts (依存: T134)

**UI Components**:
- [ ] T136 [P] [US5] Create BodyPartFilter component in src/components/library/BodyPartFilter.tsx (仮実装)
- [ ] T137 [P] [US5] Create ExerciseCard component in src/components/library/ExerciseCard.tsx (仮実装)
- [ ] T138 [P] [US5] Create ExerciseForm component in src/components/library/ExerciseForm.tsx (仮実装)
- [ ] T139 [US5] Implement ExerciseLibraryScreen in src/components/library/ExerciseLibraryScreen.tsx (依存: T136, T137)
- [ ] T140 [US5] Connect ExerciseLibraryScreen to LibraryScreen placeholder from T047

**CRUD Operations**:
- [ ] T141 [US5] Implement create exercise flow (modal with ExerciseForm)
- [ ] T142 [US5] Implement edit exercise flow (pre-fill form with existing data)
- [ ] T143 [US5] Implement delete exercise flow (confirmation modal)
- [ ] T144 [US5] Add body part filter logic (filter exercises by selected body part)

**Library Integration with Workout Recording**:
- [ ] T145 [US5] Update ExerciseInput (T065) to suggest exercises from library
- [ ] T146 [US5] Add "Add to Library" button when entering new exercise name
- [ ] T147 [US5] Update lastUsed timestamp when exercise is used in workout

### Refactor Phase for User Story 5

- [ ] T148 [US5] Add URL validation for video links (warn if invalid, but allow)
- [ ] T149 [US5] Add duplicate exercise name warning (same bodyPart + name)
- [ ] T150 [US5] Add empty state when library is empty ("種目を追加してください")
- [ ] T151 [US5] Sort library by lastUsed (most recent first) for quick access

**Checkpoint**: All user stories (1-5) should now be independently functional - library adds long-term value

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Performance Optimization

- [ ] T152 [P] Add React.memo to all list item components (HistoryItem, ExerciseCard, SetRow)
- [ ] T153 [P] Optimize Zustand selectors to prevent unnecessary re-renders
- [ ] T154 [P] Add bundle size analysis with vite-plugin-bundle-visualizer
- [ ] T155 Measure and optimize First Contentful Paint (target < 1.5s)
- [ ] T156 Measure and optimize Time to Interactive (target < 3s)

### Error Handling & Validation

- [ ] T157 [P] Add global error boundary in App.tsx
- [ ] T158 [P] Add Japanese error messages for all validation failures
- [ ] T159 [P] Add retry logic for storage operations
- [ ] T160 Add user-facing error message when storage quota exceeded

### Accessibility (WCAG 2.1 AA)

- [ ] T161 [P] Add aria-labels to all interactive elements
- [ ] T162 [P] Test with iOS VoiceOver and Android TalkBack
- [ ] T163 [P] Verify color contrast ratios (dark theme white text on black background)
- [ ] T164 Test landscape orientation support (all screens should adapt)

### Testing & Documentation

- [ ] T165 [P] Add unit tests for all utility functions in tests/unit/utils/
- [ ] T166 [P] Verify test coverage >= 80% (per constitution v1.1.0)
- [ ] T167 [P] Run integration tests on iOS simulator
- [ ] T168 [P] Run integration tests on Android emulator
- [ ] T169 Update quickstart.md with any discovered issues or improvements

### Production Readiness

- [ ] T170 [P] Add app icons for iOS and Android (1024x1024 source)
- [ ] T171 [P] Add splash screen for iOS and Android
- [ ] T172 [P] Configure iOS Info.plist with notification permissions description
- [ ] T173 [P] Configure Android AndroidManifest.xml with notification permissions
- [ ] T174 Build release APK for Android (npx cap build android)
- [ ] T175 Build release IPA for iOS (Xcode Archive → Distribute)
- [ ] T176 Test on physical iOS device
- [ ] T177 Test on physical Android device

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 6 (Phase 3)**: Depends on Foundational completion - MUST complete before User Story 1
- **User Story 1 (Phase 4)**: Depends on Foundational + US6 completion - MVP core feature
- **User Story 2 (Phase 5)**: Depends on Foundational + US1 completion - Enhances US1
- **User Story 3 (Phase 6)**: Depends on Foundational completion - Can run parallel with US2
- **User Story 4 (Phase 7)**: Depends on Foundational + US1 completion - Reads US1 data
- **User Story 5 (Phase 8)**: Depends on Foundational completion - Can run parallel with US1-4
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 6 (P1)**: Navigation foundation - NO dependencies on other stories, but REQUIRED for all screens
- **User Story 1 (P1)**: Workout recording - Depends ONLY on US6 (navigation)
- **User Story 2 (P2)**: One-handed input - Enhances US1, should integrate after US1 complete
- **User Story 3 (P2)**: Timer - Independent of US1/US2, can run in parallel with US2
- **User Story 4 (P3)**: History - Depends on US1 (reads workout sessions)
- **User Story 5 (P4)**: Library - Independent, can run in parallel with US1-4

### Within Each User Story (TDD Workflow)

1. **Red**: Write failing tests (contract → integration → unit)
2. **Green**: Implement with 仮実装 (minimal code to pass tests)
3. **Refactor**: Improve code quality (DRY, meaningful names, error handling)
4. **三角測量**: Add more test cases to drive towards 明白な実装

### Parallel Opportunities

- **Phase 1 (Setup)**: All tasks marked [P] can run in parallel
- **Phase 2 (Foundational)**:
  - Type definitions (T017-T023) can all run in parallel
  - Contract tests (T024-T027) can run in parallel
  - Shared UI components (T033-T038) can run in parallel
- **User Stories**: Once Foundational completes:
  - US3, US5 can start in parallel with US1
  - US2 should wait for US1 core implementation
  - US4 should wait for US1 data model
- **Phase 9 (Polish)**: Most tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Red Phase - Launch all tests together:
Task: "T052 Unit test for useActiveWorkout hook"
Task: "T053 Unit test for useWorkoutStorage hook"
Task: "T054 Unit test for calculations.ts"
Task: "T055 Integration test for workout recording flow"

# Green Phase - Launch parallelizable implementations:
Task: "T057 Create workoutStore (仮実装)"
Task: "T058 Implement useWorkoutStorage hook (三角測量)"
Task: "T060 Implement calculateMaxWeight"
Task: "T061 Implement date/time utilities"
Task: "T062 Implement validation helpers"

# Green Phase - UI components (some parallel):
Task: "T063 Create SetRow component"
Task: "T065 Create ExerciseInput component"
```

---

## Implementation Strategy

### MVP First (User Stories 6 + 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 6 (Navigation)
4. Complete Phase 4: User Story 1 (Workout Recording)
5. **STOP and VALIDATE**: Test US6 + US1 independently on iOS/Android simulators
6. Deploy/demo if ready

**MVP Scope**: Navigation + Basic workout recording with previous max weight display. Users can track workouts without keypad, timer, history, or library.

### Incremental Delivery

1. **Foundation** (Phase 1 + 2) → Core types, storage, shared components ready
2. **Navigation** (Phase 3: US6) → Tab bar works → Test independently
3. **Workout Recording** (Phase 4: US1) → MVP! → Test independently → Deploy/Demo
4. **One-Handed Input** (Phase 5: US2) → Enhances US1 → Test independently → Deploy/Demo
5. **Rest Timer** (Phase 6: US3) → Adds timer → Test independently → Deploy/Demo
6. **History** (Phase 7: US4) → Enables progress tracking → Test independently → Deploy/Demo
7. **Library** (Phase 8: US5) → Long-term value → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together**
2. **Once Foundational is done**:
   - Developer A: User Story 6 (Navigation) - FIRST PRIORITY
   - Developer B: User Story 1 (Workout Recording) - Waits for US6
   - Developer C: User Story 3 (Timer) - Can start parallel with US1
   - Developer D: User Story 5 (Library) - Can start parallel with US1
3. **After US1 completes**:
   - Developer A: User Story 2 (Keypad) - Integrates with US1
   - Developer B: User Story 4 (History) - Depends on US1 data
4. Stories complete and integrate independently

---

## Notes

- **[P] tasks** = different files, no dependencies - safe to parallelize
- **[Story] label** maps task to specific user story for traceability
- **TDD is mandatory** per constitution v1.1.0 (Kent Beck & 和田卓人 methodologies)
- **仮実装 → 三角測量 → 明白な実装** progression for all implementations
- Each user story should be independently completable and testable
- Verify tests **FAIL** before implementing (Red-Green-Refactor)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **WCAG 2.1 AA compliance**: All touch targets >= 44x44dp, color contrast ratios verified
- **Performance targets**: FCP < 1.5s, TTI < 3s, memory < 512MB
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
