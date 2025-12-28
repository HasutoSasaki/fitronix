# Research: Workout Tracker Mobile App

**Feature**: 001-workout-tracker
**Created**: 2025-11-29
**Updated**: 2025-12-01 (最新技術スタックに更新)
**Purpose**: Technical research findings to inform implementation decisions

## Technology Stack (2025年12月時点最新)

**Core Technologies**:

- **React 19.x**: 最新安定版 (2024年12月リリース)
  - React Compiler導入で自動メモ化
  - useActionStateでフォーム処理改善
  - Document Metadata APIでSEO最適化
- **TypeScript 5.7.x**: 最新 (2024年11月リリース)
  - Inferred Type Predicatesで型推論強化
  - Path Rewriting for Relative Paths
  - 初期化チェック強化
- **Vite 6.x**: 最新 (2024年11月リリース)
  - Environment API導入
  - ビルド高速化・バンドルサイズ最適化
- **Capacitor 6.x**: 最新安定版
  - iOS 15+, Android 12+対応
  - モダンなプラグインAPI
- **Zustand 5.x**: 最新
  - React 19完全対応
  - TypeScript型推論強化
- **Vitest 3.x + React Testing Library 16.x**:
  - React 19対応
  - ESM完全サポート

---

## Storage Strategy

### Decision: Capacitor Preferences API

**Rationale**:

- Native persistence using UserDefaults (iOS) and SharedPreferences (Android)
- Simple key-value store with JSON serialization support
- Data persists even with app reinstalls
- Perfect for workout records (not high-volume database needs)
- Async/await API: `set()`, `get()`, `remove()`, `clear()`, `keys()`
- No external dependencies required

**Alternatives Considered**:

- **SQLite** (via @capacitor-community/sqlite): Overkill for this app's data volume; adds complexity
- **IndexedDB**: Web-only, not native; poor performance on mobile
- **AsyncStorage** (React Native): Not available in Capacitor; Preferences API is the Capacitor equivalent

**Source**: [Capacitor Preferences API Documentation](https://capacitorjs.com/docs/apis/preferences)

---

## Local Notifications for Timer

### Decision: Capacitor Local Notifications API

**Rationale**:

- Schedule notifications with `schedule()` method
- Supports action buttons on lock screen (pause, resume, skip)
- Android 12+ requires `SCHEDULE_EXACT_ALARM` permission for exact timing
- Android Doze mode: use `allowWhileIdle: true` (limited to once per 9 minutes)
- iOS supports `silent` mode for foreground suppression
- Event listeners: `localNotificationReceived`, `localNotificationActionPerformed`

**Implementation Notes**:

- Request notification permissions on first timer use
- Use `schedule()` with exact trigger time for countdown
- Action buttons defined in schedule payload: `{ id: 'pause', title: '一時停止' }`, `{ id: 'resume', title: '再開' }`, `{ id: 'skip', title: 'スキップ' }`
- Listen to `localNotificationActionPerformed` to handle button taps
- Update notification every second (or use 5-second intervals to conserve battery)

**Alternatives Considered**:

- **Background Tasks API**: Too complex; notifications are simpler and more user-visible
- **Web Notifications**: Not native; won't work reliably on lock screen

**Source**: [Local Notifications Documentation](https://capacitorjs.com/docs/apis/local-notifications)

---

## State Management

### Decision: Zustand

**Rationale**:

- Lightweight (<1KB) - critical for mobile bundle size
- React 19完全対応 (Zustand 5.x)
- Only re-renders components subscribed to changed state (Context API re-renders all consumers)
- Real-world performance improvement: "fixing a huge performance problem by moving useState + context over to zustand"
- No providers needed = cleaner code
- Perfect for workout session state (active sets, timer state, history cache)
- TypeScript 5.7完全対応、excellent type inference

**Use Cases in This App**:

- `workoutStore`: Active session state, current sets, max weight calculation
- `libraryStore`: Exercise library, body parts, cached exercises
- `timerStore`: Timer countdown, pause state, notification ID

**Alternatives Considered**:

- **Context API**: Re-renders all consumers on any state change; performance issues at scale
- **Redux Toolkit**: Overkill for this app; too much boilerplate
- **Jotai/Recoil**: Atomic state is nice but Zustand is simpler and more proven

**Sources**:

- [React State Management 2025: Context API vs Zustand](https://dev.to/cristiansifuentes/react-state-management-in-2025-context-api-vs-zustand-385m)
- [Zustand vs Context Performance](https://medium.com/@bloodturtle/react-state-management-why-context-api-might-be-causing-performance-issues-and-how-zustand-can-ec7718103a71)

---

## Performance Optimizations

### Memoization Strategy

**Decision**: Use React.memo, useCallback, useMemo selectively

**Rationale (React 19での変更点)**:

- **React 19のReact Compiler**により、多くのメモ化が自動化される
- ただし、以下のケースでは引き続き手動メモ化が有効:
  - Heavy calculations (max weight across all sets)
  - Frequently re-rendering components (history list items)
  - Callback functions passed to child components
- React Compiler未使用時は従来通り選択的にメモ化

**React 19の新機能**:

- Automatic batching (すべてのstate更新が自動的にバッチ処理)
- React Compiler (opt-in): 自動的にメモ化とパフォーマンス最適化
- useActionState: フォーム処理の簡素化

**Anti-Patterns to Avoid**:

- Don't memo every component (measure first)
- Don't useCallback for simple inline functions
- Don't useMemo for cheap calculations

**Source**: [React Performance Optimization 2025](https://dev.to/frontendtoolstech/react-performance-optimization-best-practices-for-2025-2g6b)

---

### Virtualization for History List

**Decision**: react-window for history virtualization

**Rationale**:

- Renders only visible items in viewport
- "drastically improves scrolling on mobile devices or lower-powered systems"
- Essential for 100+ workout sessions
- Smaller bundle than react-virtualized
- Good TypeScript support

**Implementation**:

- Use `FixedSizeList` for uniform row heights
- Estimate 80px per history item
- Viewport height = screen height - tab bar - header
- Load next page when scroll reaches 80% of list

**Alternatives Considered**:

- **react-virtualized**: Larger bundle, more features (not needed here)
- **@tanstack/react-virtual**: Newer, less proven; react-window is stable

**Sources**:

- [React Performance Optimization 2025](https://dev.to/frontendtoolstech/react-performance-optimization-best-practices-for-2025-2g6b)
- [React Native Scalability Best Practices](https://indiit.com/best-practices-for-building-scalable-mobile-apps-with-react-native/)

---

## Accessibility Compliance (WCAG 2.1 AA)

### Touch Target Size

**Decision**: 44x44dp minimum for all interactive elements

**Rationale**:

- WCAG 2.2 AA requires minimum 24x24px
- Apple HIG recommends 44x44dp for usability
- Critical for one-handed operation with large fingers/thumbs
- If smaller (icon buttons), ensure no overlap with adjacent elements

**Application in This App**:

- Keypad buttons: 60x60dp (extra-large for gym use)
- Tab bar icons: 48x48dp
- Set add/delete buttons: 44x44dp
- Input fields: 44dp height minimum

**Source**: [Touch Target Size Requirements](https://www.browserstack.com/docs/app-accessibility/rule-repository/rules-list/touch-target/touch-target-size)

---

### Mobile-Specific WCAG Criteria

**Decision**: Comply with mobile-specific WCAG 2.1 AA criteria

**Criteria**:

- **1.3.4 Orientation (AA)**: Support both portrait and landscape
- **2.5.1 Pointer Gestures (A)**: Provide single-pointer alternatives to multi-touch gestures
- **2.5.7 Dragging Movements (AA)**: Provide alternatives to drag-and-drop

**Implementation**:

- Use CSS media queries for responsive layout (portrait/landscape)
- No drag-to-reorder (use edit mode with up/down buttons instead)
- No pinch-to-zoom gestures (use explicit zoom buttons if needed)
- All actions available via tap (no long-press exclusive features)

**Source**: [WCAG 2.2 Mobile Guidance](https://www.w3.org/TR/wcag2mobile-22/)

---

## Architecture Pattern

### Decision: Offline-First Architecture with Feature-Based Modules

**Rationale**:

- All data stored locally first (Preferences API)
- No cloud sync needed for MVP
- Domain-Driven Design (DDD) pattern observed in similar apps
- Feature-based modular structure:
  - `/workout`: Recording UI + logic
  - `/history`: History list + details
  - `/library`: Exercise library CRUD
  - `/timer`: Rest timer component
  - `/shared`: Reusable UI components

**Data Flow**:

1. User action → Component
2. Component → Zustand store (optimistic update)
3. Store → Service layer (storage.ts)
4. Service → Capacitor Preferences API
5. API → Native storage (UserDefaults/SharedPreferences)

**Benefits**:

- Works offline by default
- Fast UX (optimistic updates)
- Testable (mock service layer)
- Scalable (add cloud sync later without major refactor)

**Sources**:

- [MuscleQuest Offline-First Tracker](https://github.com/isotronic/musclequest)
- [Offline App Architecture 2025](https://www.aalpha.net/blog/offline-app-architecture-building-offline-first-apps/)

---

## Testing Strategy

### Decision: Vitest + React Testing Library + Capacitor Mocks

**Rationale**:

- **Vitest**: Faster than Jest, native ESM support, Vite integration
- **React Testing Library**: Test behavior, not implementation
- **Capacitor Mocks**: Mock Preferences/Notifications APIs for tests

**Test Pyramid**:

- **70% Unit Tests**: Services, hooks, utils (fast, isolated)
- **20% Integration Tests**: User journeys (record workout, view history, timer flow)
- **10% Contract Tests**: API interfaces (storage CRUD, notification contracts)

**TDD Workflow (Kent Beck & 和田卓人)**:

1. **Red**: Write failing test (test-first)
2. **Green**: Minimal implementation (仮実装 → 三角測量 → 明白な実装)
3. **Refactor**: Improve code quality while keeping tests green

**F.I.R.S.T Principles**:

- **Fast**: Unit tests < 100ms
- **Independent**: No shared state between tests
- **Repeatable**: Deterministic results
- **Self-Validating**: Pass/fail without manual checks
- **Timely**: Written before production code

---

## Security & Privacy

### Decision: Local-Only Data, No Network Access

**Rationale**:

- All data stays on device (Preferences API)
- No user accounts, no authentication needed
- No PII sent to external servers
- No analytics/tracking (privacy-first)

**GDPR/Privacy Compliance**:

- Data portability: Export function (future)
- Right to erasure: Clear all data button
- Transparency: Privacy policy stating local-only storage

---

## Performance Benchmarks

### Target Metrics

| Metric                          | Target  | Rationale                   |
| ------------------------------- | ------- | --------------------------- |
| First Contentful Paint (FCP)    | < 1.5s  | Constitution requirement    |
| Time to Interactive (TTI)       | < 3s    | Constitution requirement    |
| Data read/write                 | < 1s    | Preferences API is fast     |
| History list scroll (100 items) | 60fps   | react-window virtualization |
| Memory usage                    | < 512MB | Constitution requirement    |
| App bundle size                 | < 5MB   | Mobile data constraints     |

### Monitoring Strategy

- Use Chrome DevTools Lighthouse for FCP/TTI
- Use React DevTools Profiler for render performance
- Monitor memory with browser DevTools
- Test on real devices (iPhone SE, Android mid-range)

---

## Deployment Strategy

### Decision: Capacitor Live Updates (optional, future)

**Rationale**:

- Push JS/CSS updates without App Store review
- Critical bug fixes deployed immediately
- Native code changes still require full release

**MVP Deployment**:

- Standard App Store / Google Play release
- Manual testing on iOS Simulator + Android Emulator
- Beta testing via TestFlight (iOS) + Internal Testing (Android)

---

## Summary of Key Decisions

| Area                 | Decision                             | Rationale                                                       |
| -------------------- | ------------------------------------ | --------------------------------------------------------------- |
| **Storage**          | Capacitor Preferences API            | Native, persistent, simple                                      |
| **Notifications**    | Capacitor Local Notifications        | Lock screen support, action buttons                             |
| **State Management** | Zustand                              | Lightweight, performant, simple                                 |
| **Performance**      | react-window virtualization          | Smooth scrolling for 100+ items                                 |
| **Accessibility**    | 44x44dp touch targets, WCAG 2.1 AA   | One-handed gym use, inclusive                                   |
| **Architecture**     | Offline-first, feature-based modules | Fast UX, testable, scalable                                     |
| **Testing**          | Vitest + RTL + TDD                   | Fast tests, behavior-driven, Kent Beck & 和田卓人 methodologies |
| **Privacy**          | Local-only data                      | No cloud, no tracking, GDPR-friendly                            |
