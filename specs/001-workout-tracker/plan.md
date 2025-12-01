# Implementation Plan: Workout Tracker Mobile App

**Branch**: `001-workout-tracker` | **Date**: 2025-11-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-workout-tracker/spec.md`

**Note**: This plan has been completed by the `/speckit.plan` command with comprehensive research and design artifacts.

## Summary

This feature implements an **offline-first mobile workout tracker** with a one-handed UI optimized for gym use and lock-screen timer functionality. The app allows users to record workout sessions (exercises, sets, weight, reps), view history, manage an exercise library, and use a rest timer with lock-screen controls.

**Technical Approach**:
- **Frontend**: React 19 + TypeScript 5.7 with Vite 6 + Capacitor 6 (single codebase for iOS/Android/Web PWA fallback)
- **Storage**: Capacitor Preferences API (UserDefaults on iOS, SharedPreferences on Android) for local-only data persistence
- **State Management**: Zustand 5 (lightweight, performant, < 1KB bundle)
- **Notifications**: Capacitor Local Notifications API for lock-screen timer with action buttons (pause, resume, skip)
- **Performance**: react-window virtualization for 100+ workout history items, WCAG 2.1 AA compliant touch targets (44x44dp minimum)
- **Testing**: TDD with Vitest 3 + React Testing Library 16 (Kent Beck & 和田卓人 methodologies), F.I.R.S.T principles

## Technical Context

**Language/Version**: TypeScript 5.7.x, React 19.x, Vite 6.x
**Primary Dependencies**: React 19, Capacitor 6.x, Zustand 5, react-window 1.8.x, Vitest 3, React Testing Library 16
**Storage**: Capacitor Preferences API (UserDefaults on iOS, SharedPreferences on Android)
**Testing**: Vitest 3, React Testing Library 16, Capacitor testing utilities
**Target Platform**: iOS 15+, Android 12+, Web (PWA fallback)
**Project Type**: Mobile (React + Capacitor, single codebase for iOS/Android)
**Performance Goals**: UI rendering < 1.5s FCP, < 3s TTI; Data operations < 1s; List virtualization for 100+ history items
**Constraints**: Offline-first (no network required), < 512MB memory, WCAG 2.1 AA compliant (44x44dp touch targets)
**Scale/Scope**: Single-user mobile app, local-only data, ~100-500 workout sessions expected, 10-50 exercises in library

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on constitution v1.1.0, all gates have been verified:

### Code Quality Gates (Principle I)
- ✅ DRY: Custom hooks for storage, reusable components
- ✅ Naming: TypeScript interfaces enforce clear naming
- ✅ Consistent Style: ESLint + Prettier configuration
- ✅ Self-Documenting: TypeScript types serve as documentation
- ✅ Error Prevention: Strict TypeScript, no `any` types

### Testing Standards Gates (Principle II - TDD Mandatory)
- ✅ Red-Green-Refactor: All features developed test-first (Kent Beck)
- ✅ TDDの三原則: (1) テスト書くまでコード書かない (2) 失敗テスト1つずつ (3) テストパスさせる以上書かない
- ✅ テストの段階: 仮実装 → 三角測量 → 明白な実装
- ✅ F.I.R.S.T Principles: Fast (<100ms unit), Independent, Repeatable, Self-Validating, Timely
- ✅ Contract Tests: Storage hooks, Capacitor plugin wrappers
- ✅ Integration Tests: Full user journeys (record workout, view history, timer flow)
- ✅ Unit Tests: Business logic (max weight calculation, set ordering)

### UX Consistency Gates (Principle III)
- ✅ Touch Targets: 44x44dp minimum (WCAG 2.1 AA), keypad buttons 60x60dp
- ✅ Response Times: < 1s for data operations, immediate UI feedback
- ✅ Accessibility: WCAG 2.1 AA (screen reader support, color contrast, orientation)
- ✅ Error Messages: Japanese user-facing messages, clear actionable guidance

### Performance Gates (Principle IV)
- ✅ UI: < 1.5s FCP, < 3s TTI (React 19 concurrent features + automatic batching)
- ✅ Memory: < 512MB (Zustand 5 minimizes state overhead)
- ✅ Virtualization: History list uses react-window for 100+ sessions
- ✅ Data Operations: < 1s (Preferences API is fast)

### Observability Gates (Principle V)
- ✅ Structured Logging: Console with context (dev), Sentry possible (prod)
- ⚠️ **Partial**: Health checks N/A for mobile app (no `/health` endpoint)
- ✅ Error Tracking: Try-catch with user-friendly fallbacks

**Compliance Summary**: All gates pass, no violations. Mobile app context appropriately adapts server-oriented requirements.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
Mobile Application (React + Capacitor)

src/
├── components/        # React components
│   ├── workout/       # Workout recording UI
│   ├── history/       # History list & details
│   ├── library/       # Exercise library
│   ├── timer/         # Rest timer component
│   ├── keypad/        # One-handed input keypad
│   └── shared/        # Reusable components (Button, Input, TabBar)
├── hooks/             # Custom React hooks
│   ├── useWorkoutStorage.ts
│   ├── useExerciseLibrary.ts
│   ├── useTimer.ts
│   └── useNotifications.ts
├── stores/            # Zustand state stores
│   ├── workoutStore.ts
│   ├── libraryStore.ts
│   └── timerStore.ts
├── services/
│   ├── storage.ts     # Preferences API wrapper
│   ├── notifications.ts # Local Notifications wrapper
│   └── calculations.ts  # Business logic (max weight, stats)
├── types/             # TypeScript types
│   ├── models.ts
│   ├── api.ts
│   └── ui.ts
└── utils/             # Utilities
    ├── date.ts
    ├── validation.ts
    └── constants.ts

tests/
├── unit/              # Fast isolated tests
├── integration/       # User journey tests
├── contract/          # API contract tests
└── setup/             # Test utilities, mocks

ios/                   # Capacitor iOS project
android/               # Capacitor Android project
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: Selected mobile-first structure with React + Capacitor. The `src/` directory contains all React components, hooks, and services. Platform-specific native code lives in `ios/` and `android/` directories managed by Capacitor. Tests are organized by type (unit, integration, contract) following TDD principles from constitution v1.1.0. This structure supports the offline-first architecture with clear separation between UI components, business logic (services/), and state management (stores/).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations recorded** - All constitution gates pass. See Constitution Check section above for verification.
