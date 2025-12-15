# Capacitor から Expo Go への移行プラン

## プロジェクト概要

**現在の状態**: Capacitor 7.4.0 + React 19.0 + SQLite ベースのワークアウトトラッカー
**移行目標**: Expo Go + React Native での開発環境構築

## 現在のプロジェクト構成分析

### 使用中のCapacitorプラグイン
- `@capacitor-community/sqlite` (v7.0.2) - SQLiteデータベース
- `@capacitor/preferences` (v7.0.2) - キー・バリューストレージ
- `@capacitor/local-notifications` (v7.0.4) - ローカル通知

### アーキテクチャ構成
- **フロントエンド**: React 19.0 + TypeScript 5.7
- **状態管理**: Zustand 5.0
- **ビルドツール**: Vite 6.0
- **データベース**: SQLite (リレーショナル設計)
- **テスト**: Vitest + Testing Library

### データベース構造
```sql
- workout_sessions (セッション管理)
- workout_exercises (エクササイズ記録)
- sets (セット詳細)
- exercises (エクササイズマスタ)
- schema_version (バージョン管理)
```

## 移行プラン

### フェーズ1: 技術調査・準備 (1-2日)

#### 1.1 Expo環境の技術検証
- [ ] Expo CLI のセットアップとプロジェクト作成
- [ ] React Native + TypeScript 構成の確認
- [ ] Expo Go での SQLite 動作検証

#### 1.2 プラグイン互換性調査
- [ ] **SQLite**: `expo-sqlite` vs `@capacitor-community/sqlite` 機能比較
- [ ] **通知**: `expo-notifications` vs `@capacitor/local-notifications` 機能比較
- [ ] **ストレージ**: `expo-secure-store` vs `@capacitor/preferences` 機能比較

#### 1.3 ビルドシステム調査
- [ ] Metro bundler vs Vite の違いと移行手順
- [ ] TypeScript設定の互換性確認
- [ ] ESLint/Prettier設定の移行可能性

### フェーズ2: 新プロジェクト構築 (2-3日)

#### 2.1 Expoプロジェクト初期化
```bash
npx create-expo-app --template
```

#### 2.2 依存関係の移行
| Capacitor | Expo 代替 | 移行作業 |
|-----------|-----------|----------|
| `@capacitor-community/sqlite` | `expo-sqlite` | SQL文の互換性確認 |
| `@capacitor/preferences` | `expo-secure-store` | API変更対応 |
| `@capacitor/local-notifications` | `expo-notifications` | 通知設定の再実装 |

#### 2.3 開発環境設定
- [ ] TypeScript 5.7 設定の移行
- [ ] ESLint/Prettier設定の適用
- [ ] Zustand状態管理の統合

### フェーズ3: コア機能移植 (5-7日)

#### 3.1 データベース層の移行
**優先度**: 最高 🔴

現在の`DatabaseManager.ts`を`expo-sqlite`に移行:

```typescript
// Before (Capacitor)
import { CapacitorSQLite } from '@capacitor-community/sqlite';

// After (Expo)
import * as SQLite from 'expo-sqlite';
```

**移行課題**:
- 接続管理の仕組みの違い
- トランザクション API の違い
- データインポート/エクスポート機能の再実装

#### 3.2 ストレージ層の移行
**優先度**: 中 🟡

```typescript
// Before (Capacitor)
import { Preferences } from '@capacitor/preferences';

// After (Expo)
import * as SecureStore from 'expo-secure-store';
```

#### 3.3 通知機能の移行
**優先度**: 中 🟡

```typescript
// Before (Capacitor)
import { LocalNotifications } from '@capacitor/local-notifications';

// After (Expo)
import * as Notifications from 'expo-notifications';
```

### フェーズ4: UI/UX層の移行 (3-4日)

#### 4.1 React → React Native 移行
- [ ] Webベースのコンポーネント → React Native コンポーネント
- [ ] CSS → StyleSheet API
- [ ] `react-window` → React Native FlatList

#### 4.2 レスポンシブ対応
- [ ] Web向けレイアウト → モバイル向けレイアウト
- [ ] タッチ操作の最適化

### フェーズ5: テスト・検証 (2-3日)

#### 5.1 機能テスト
- [ ] データベース操作の動作確認
- [ ] ワークアウト記録機能の検証
- [ ] 通知機能の検証

#### 5.2 パフォーマンステスト
- [ ] SQLite クエリ性能の比較
- [ ] アプリ起動時間の測定
- [ ] メモリ使用量の確認

## 技術的課題と対策

### 🔴 高リスク課題

#### 1. SQLite API の非互換性
**問題**: Capacitor と Expo の SQLite API は大幅に異なる
**対策**: 
- データベース抽象化レイヤーの実装
- 段階的移行でリスク軽減

#### 2. ビルドシステムの違い
**問題**: Vite → Metro bundler への移行
**対策**:
- Metro設定のカスタマイズ
- 既存のTypeScript設定の調整

### 🟡 中リスク課題

#### 3. 通知機能の実装差異
**問題**: API仕様の違い
**対策**: 通知インターフェースの統一化

#### 4. ネイティブビルドの複雑化
**問題**: Expo Go の制限
**対策**: 必要に応じて Expo Dev Build への移行

### 🟢 低リスク課題

#### 5. UI コンポーネントの移行
**問題**: Web → Mobile の UI 調整
**対策**: React Native UI ライブラリの活用

## 移行後のメリット・デメリット

### ✅ メリット

1. **開発効率の向上**
   - Expo Go による高速な開発サイクル
   - OTA (Over-The-Air) アップデート
   - 豊富な開発ツール群

2. **コミュニティとエコシステム**
   - 活発なコミュニティサポート
   - 充実したドキュメント
   - 定期的なアップデート

3. **プラットフォーム統合**
   - iOS/Android の統一された開発体験
   - クロスプラットフォームの一貫性

### ❌ デメリット

1. **学習コスト**
   - React Native の習得が必要
   - Metro bundler への慣れが必要

2. **機能制限**
   - Expo Go での利用可能な機能制限
   - カスタムネイティブコードの制約

3. **移行コスト**
   - 2-3週間の開発期間
   - データベース層の全面的な書き直し

## 推奨事項

### 移行を推奨する場合
- **長期的なモバイル開発** を計画している
- **React Native の学習** に投資できる
- **OTA アップデート** が重要な要件

### 移行を推奨しない場合
- **短期的なリリース** が優先
- **現在のCapacitor環境** で満足している
- **Web版の開発** も並行して必要

## 次のステップ

1. **技術検証**: フェーズ1の調査を実施
2. **意思決定**: 移行可否の最終判断
3. **段階的移行**: 低リスクな機能から開始
4. **継続的検証**: 各フェーズでの動作確認

---

**作成日**: 2025-12-14  
**対象プロジェクト**: fitronix workout tracker  
**推定期間**: 2-3週間  
**リスクレベル**: 中〜高