# Fitronix

ワークアウトトラッカーモバイルアプリ - React + Capacitor + SQLite

## 概要

Fitronixは、筋トレの記録と管理を行うモバイルアプリケーションです。SQLiteデータベースを使用して、ワークアウトセッション、エクササイズ、セットデータを効率的に管理します。

## 技術スタック

- **フロントエンド**: React 19
- **状態管理**: Zustand 5
- **モバイルランタイム**: Capacitor 7
- **データベース**: SQLite (@capacitor-community/sqlite ^7.0.2)
- **言語**: TypeScript 5.7
- **テスト**: Vitest 3

## セットアップ

### 前提条件

- Node.js 18+
- iOS: Xcode 14+
- Android: Android Studio

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

### モバイルビルド

```bash
# iOSビルド
npx cap sync ios
npx cap open ios

# Androidビルド
npx cap sync android
npx cap open android
```

## データベース構造

### SQLiteスキーマ (バージョン 1)

アプリは以下の5つのテーブルを使用します：

1. **workout_sessions** - ワークアウトセッション
2. **workout_exercises** - セッション内のエクササイズ
3. **sets** - エクササイズのセット
4. **exercises** - エクササイズライブラリ
5. **schema_version** - スキーマバージョン管理

詳細は [data-model.md](specs/002-workout-tracker-sqlite-migration/data-model.md) を参照してください。

### ストレージAPI

```typescript
import { WorkoutSessionStorage, ExerciseLibraryStorage } from './services/database/storage';

// ワークアウトセッション管理
const sessionStorage = new WorkoutSessionStorage();
const sessions = await sessionStorage.getAllSessions();

// エクササイズライブラリ管理
const libraryStorage = new ExerciseLibraryStorage();
const exercises = await libraryStorage.getAllExercises();
```

## 開発

### テスト実行

```bash
# 全テスト実行
npm test

# 契約テスト
npm run test:contract

# カバレッジ付き
npm run test:coverage
```

### Lint & Format

```bash
# Lint実行
npm run lint

# Lint自動修正
npm run lint:fix

# フォーマット
npm run format

# フォーマットチェック
npm run format:check
```

## パフォーマンス

- **データベース初期化**: < 1秒
- **100セッションのクエリ**: < 2秒
- **エクササイズ検索**: < 1秒（50件）
- **データエクスポート/インポート**: < 5秒（1000セッション）

## データバックアップ

```typescript
import DatabaseManager from './services/database/DatabaseManager';

// エクスポート
const db = DatabaseManager;
const jsonBackup = await db.exportToJson();
localStorage.setItem('backup', jsonBackup);

// インポート
const backup = localStorage.getItem('backup');
if (backup) {
  await db.importFromJson(backup);
}
```

## スキーママイグレーション

将来的なスキーマ変更については、[data-model.md](specs/002-workout-tracker-sqlite-migration/data-model.md#migration-strategy) のマイグレーションパターンを参照してください。

### 現在のスキーマバージョン確認

```typescript
const version = await DatabaseManager.getSchemaVersion();
console.log(`Schema version: ${version}`);

// スキーマ整合性チェック
const isValid = await DatabaseManager.verifySchemaIntegrity();
if (!isValid) {
  console.error('Schema integrity check failed');
}
```

## プロジェクト構成

```
fitronix/
├── src/
│   ├── services/
│   │   └── database/
│   │       ├── DatabaseManager.ts      # シングルトンDB管理
│   │       ├── WorkoutSessionStorage.ts # セッションストレージ
│   │       ├── ExerciseLibraryStorage.ts # ライブラリストレージ
│   │       ├── schema.ts                 # SQLスキーマ定義
│   │       └── storage.ts                # エクスポート用インデックス
│   ├── types/
│   │   └── models.ts                    # TypeScript型定義
│   └── utils/
│       └── storage.ts                   # ユーティリティ関数
├── tests/
│   ├── contract/                        # 契約テスト
│   └── setup/                           # テストセットアップ
└── specs/
    └── 002-workout-tracker-sqlite-migration/
        ├── spec.md                      # 機能仕様
        ├── plan.md                      # 実装計画
        ├── data-model.md                # データモデル
        └── contracts/                   # ストレージ契約
```

## ライセンス

Private

## 関連ドキュメント

- [機能仕様](specs/002-workout-tracker-sqlite-migration/spec.md)
- [実装計画](specs/002-workout-tracker-sqlite-migration/plan.md)
- [データモデル](specs/002-workout-tracker-sqlite-migration/data-model.md)
- [技術調査](specs/002-workout-tracker-sqlite-migration/research.md)
