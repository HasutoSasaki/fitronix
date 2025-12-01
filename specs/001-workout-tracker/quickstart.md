# Quickstart Guide: Workout Tracker Mobile App

**Feature**: 001-workout-tracker
**Created**: 2025-11-29
**Updated**: 2025-12-01 (最新技術スタックに更新)
**Tech Stack**: React 19 + TypeScript 5.7 + Vite 6 + Capacitor 6

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.x or higher ([Download](https://nodejs.org/)) - React 19対応
- **npm**: v10.x or higher (comes with Node.js)
- **Xcode**: 15.x or higher (macOS only, for iOS development)
- **Android Studio**: 2024.x or higher (for Android development)
- **Java JDK**: 17 or higher (for Android builds)

## 1. Project Setup

### Clone Repository & Install Dependencies

```bash
cd /Users/sasakihasuto/develop/fitronix
npm install
```

This installs:
- React 19.x (最新安定版)
- TypeScript 5.7.x (最新)
- Vite 6.x (最新ビルドツール)
- Capacitor 6.x
- Zustand 5.x (state management)
- Vitest 3.x + React Testing Library 16.x (testing)
- react-window 1.8.x (virtualization)

### Initialize Capacitor

```bash
npx cap init
```

When prompted:
- **App name**: Workout Tracker
- **App ID**: com.fitronix.workouttracker
- **Web directory**: dist

### Add iOS and Android Platforms

```bash
# Add iOS platform
npx cap add ios

# Add Android platform
npx cap add android
```

This creates `ios/` and `android/` directories with native project files.

---

## 2. Development Workflow

### Run Web Development Server

```bash
npm run dev
```

- Opens browser at `http://localhost:5173`
- Hot reload enabled (changes reflect immediately)
- Use browser DevTools for debugging
- Simulate mobile viewport: DevTools → Toggle device toolbar (Cmd+Shift+M)

### Build for Production

```bash
npm run build
```

- Outputs to `dist/` directory
- Optimized bundle with minification
- TypeScript type-checking included

---

## 3. Running on iOS Simulator

### Prerequisites

- macOS with Xcode installed
- iOS Simulator installed via Xcode

### Steps

1. **Sync web assets to iOS project**:
   ```bash
   npm run build
   npx cap sync ios
   ```

2. **Open iOS project in Xcode**:
   ```bash
   npx cap open ios
   ```

3. **Select simulator**:
   - In Xcode, select target device (e.g., "iPhone 15 Pro")
   - Click "Run" button (▶️) or press Cmd+R

4. **Grant permissions** (when prompted in simulator):
   - Notifications: Required for timer lock screen display

### Troubleshooting iOS

- **Build fails**: Clean build folder (Xcode → Product → Clean Build Folder)
- **Permissions error**: Check `ios/App/App/Info.plist` for permission keys
- **Hot reload not working**: Run `npx cap sync ios` after code changes

---

## 4. Running on Android Emulator

### Prerequisites

- Android Studio installed
- Android SDK installed (API level 33+ recommended)
- Android Emulator set up

### Steps

1. **Sync web assets to Android project**:
   ```bash
   npm run build
   npx cap sync android
   ```

2. **Open Android project in Android Studio**:
   ```bash
   npx cap open android
   ```

3. **Start emulator**:
   - In Android Studio, Tools → Device Manager
   - Click "Play" on an emulator (or create new one)

4. **Run app**:
   - Click "Run" button (▶️) or press Shift+F10
   - Select running emulator from device list

5. **Grant permissions** (when prompted in emulator):
   - Notifications: Required for timer
   - Exact alarms (Android 12+): Required for precise timer

### Troubleshooting Android

- **Gradle build fails**: Update `android/build.gradle` and sync
- **Emulator slow**: Enable hardware acceleration (HAXM on Intel, WHPX on AMD)
- **Permissions not requested**: Check `android/app/src/main/AndroidManifest.xml`

---

## 5. Running Tests

### Unit Tests

```bash
npm run test
```

- Runs Vitest in watch mode
- Executes tests in `tests/unit/`
- Fast tests (<100ms each, per F.I.R.S.T principles)

### Integration Tests

```bash
npm run test:integration
```

- Runs integration tests (user journey tests)
- Tests in `tests/integration/`
- Slower tests (may interact with mocked Capacitor APIs)

### Contract Tests

```bash
npm run test:contract
```

- Validates API contracts (storage, hooks, components)
- Tests in `tests/contract/`
- Ensures interfaces match implementation

### Test Coverage

```bash
npm run test:coverage
```

- Generates coverage report in `coverage/` directory
- Open `coverage/index.html` in browser to view
- Target: 80% coverage (per constitution)

### E2E Tests (Future)

```bash
npm run test:e2e
```

- Runs end-to-end tests (not yet implemented)
- Would use Playwright or Cypress

---

## 6. Linting & Formatting

### Run ESLint

```bash
npm run lint
```

- Checks TypeScript and React code for issues
- Auto-fix: `npm run lint:fix`

### Run Prettier

```bash
npm run format
```

- Formats code according to `.prettierrc` config
- Check without fixing: `npm run format:check`

---

## 7. Debugging

### Web Browser

- Open Chrome DevTools (F12)
- Use React DevTools extension for component inspection
- Use Console for logs and errors
- Use Network tab for storage inspection (Preferences API uses `localStorage` in web)

### iOS Simulator

- **Safari Web Inspector**:
  1. Enable: Safari → Preferences → Advanced → "Show Develop menu"
  2. Connect: Develop → [Simulator Name] → [App Name]
  3. Inspect elements, view console logs, debug network
- **Xcode Console**:
  - View native logs (Xcode → View → Debug Area → Show Debug Area)

### Android Emulator

- **Chrome DevTools**:
  1. Open `chrome://inspect` in Chrome browser
  2. Find device and click "inspect"
  3. Use DevTools as normal
- **Logcat**:
  - View native logs (Android Studio → Logcat tab)
  - Filter by app: `com.fitronix.workouttracker`

---

## 8. Common Capacitor Commands

### Sync Web Assets to Native Projects

```bash
npx cap sync
```

- Runs after every `npm run build`
- Copies `dist/` to `ios/App/App/public/` and `android/app/src/main/assets/public/`
- Updates native plugin dependencies

### Update Capacitor Plugins

```bash
npm update @capacitor/core @capacitor/ios @capacitor/android
npx cap sync
```

### View Installed Plugins

```bash
npx cap ls
```

---

## 9. Testing Workflows

### TDD Workflow (Kent Beck & 和田卓人)

Follow strict TDD methodology:

1. **Red**: Write a failing test
   ```bash
   # Create test file: tests/unit/services/storage.test.ts
   npm run test
   # Test should fail (Red)
   ```

2. **Green**: Write minimal code to pass
   ```typescript
   // Implement in src/services/storage.ts
   // Just enough to make test pass (仮実装)
   ```

3. **Refactor**: Improve code quality
   ```typescript
   // Clean up code while keeping tests green
   // Apply DRY, meaningful naming, etc.
   ```

4. **Repeat**: Write next test, iterate

### Test Execution Order

1. **Contract Tests** (define interfaces)
2. **Unit Tests** (test isolated functions/hooks)
3. **Integration Tests** (test user journeys)
4. **E2E Tests** (test full app flow)

---

## 10. Capacitor Storage & Notifications Setup

### Testing Preferences API

```typescript
// Mock in tests
import { Preferences } from '@capacitor/preferences';

// Set value
await Preferences.set({ key: 'workoutSessions', value: JSON.stringify(sessions) });

// Get value
const { value } = await Preferences.get({ key: 'workoutSessions' });
const sessions = JSON.parse(value || '[]');
```

### Testing Local Notifications

```typescript
// Mock in tests
import { LocalNotifications } from '@capacitor/local-notifications';

// Request permission
const permission = await LocalNotifications.requestPermissions();

// Schedule notification
const notificationId = 1;
await LocalNotifications.schedule({
  notifications: [{
    id: notificationId,
    title: '休憩タイマー',
    body: '残り 60秒',
    ongoing: true,
    actions: [
      { id: 'pause', title: '一時停止' },
      { id: 'skip', title: 'スキップ' }
    ]
  }]
});

// Listen to actions
await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
  console.log('Action performed:', action.actionId);
});
```

---

## 11. Project Structure Navigation

```
/Users/sasakihasuto/develop/fitronix/
├── src/
│   ├── components/      # React components
│   ├── hooks/           # Custom hooks
│   ├── stores/          # Zustand stores
│   ├── services/        # Business logic (storage, notifications)
│   ├── types/           # TypeScript types
│   └── utils/           # Utilities
├── tests/
│   ├── unit/            # Fast isolated tests
│   ├── integration/     # User journey tests
│   └── contract/        # API contract tests
├── specs/001-workout-tracker/
│   ├── spec.md          # Feature specification
│   ├── plan.md          # Implementation plan
│   ├── research.md      # Technical research
│   ├── data-model.md    # Data entities
│   ├── contracts/       # TypeScript interfaces
│   └── quickstart.md    # This file
├── ios/                 # iOS native project (Xcode)
├── android/             # Android native project (Android Studio)
├── dist/                # Production build output
├── vite.config.ts       # Vite bundler config
├── vitest.config.ts     # Vitest test runner config
├── capacitor.config.ts  # Capacitor configuration
└── package.json         # Dependencies
```

---

## 12. Next Steps

After setup, follow this implementation order:

1. **Phase 1: Core Storage** (`/speckit.tasks` will generate tasks)
   - Implement `src/services/storage.ts`
   - Write contract tests for storage interfaces
   - Implement Zustand stores

2. **Phase 2: Basic Workout Recording** (P1 user story)
   - Build workout recording UI
   - Implement set input functionality
   - Connect to storage layer

3. **Phase 3: One-Handed Keypad** (P2 user story)
   - Build numeric keypad component
   - Add quick buttons for weight/reps
   - Ensure 44x44dp touch targets (WCAG 2.1 AA)

4. **Phase 4: Rest Timer** (P2 user story)
   - Implement timer logic with Zustand
   - Integrate Local Notifications API
   - Handle lock screen actions

5. **Phase 5: History & Library** (P3/P4 user stories)
   - Build history list (with react-window virtualization)
   - Implement exercise library CRUD
   - Add body part filtering

---

## Helpful Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Preferences API](https://capacitorjs.com/docs/apis/preferences)
- [Capacitor Local Notifications](https://capacitorjs.com/docs/apis/local-notifications)
- [React + TypeScript Best Practices](https://react-typescript-cheatsheet.netlify.app/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Vitest Documentation](https://vitest.dev/)
- [WCAG 2.1 Mobile Guidance](https://www.w3.org/TR/wcag2mobile-22/)

---

## Support

For issues or questions:
1. Check specs and contracts in `specs/001-workout-tracker/`
2. Review research findings in `research.md`
3. Consult constitution v1.1.0 in `.specify/memory/constitution.md`
4. Run tests to validate implementation
