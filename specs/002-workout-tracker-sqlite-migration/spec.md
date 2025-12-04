# Feature Specification: SQLite Database Migration

**Feature Branch**: `002-workout-tracker-sqlite-migration`
**Created**: 2025-12-05
**Status**: Implemented
**Input**: Migrate from Capacitor Preferences (key-value storage) to @capacitor-community/sqlite (relational database) for improved data modeling, query performance, and scalability

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Data Persistence with Relational Integrity (Priority: P1)

開発者は、ワークアウトセッション、種目、セットの関係をリレーショナルデータベースで表現し、外部キー制約によりデータ整合性を保証できる。また、セッション削除時に関連する種目とセットが自動的にカスケード削除される。

**Why this priority**: データ整合性はアプリの信頼性の基盤。Preferences (key-value) では複雑なデータ関係を表現できず、孤立したデータが発生するリスクがあった。

**Independent Test**: ワークアウトセッションを作成→種目と複数セットを追加→セッションを削除→関連する種目とセットが全て削除されることを確認

**Acceptance Scenarios**:

1. **Given** ワークアウトセッションに3つの種目と各5セットが存在、**When** セッションを削除、**Then** 関連する全ての種目(3)とセット(15)がデータベースから自動削除される
2. **Given** 種目に5つのセットが紐づいている、**When** 種目を削除、**Then** 関連する全てのセット(5)がカスケード削除される
3. **Given** 新規セッションを作成、**When** データベース接続エラー発生、**Then** トランザクションがロールバックされ、不完全なデータが残らない

---

### User Story 2 - Efficient Querying and Indexing (Priority: P1)

開発者は、日付範囲でのワークアウト履歴検索、種目名での検索、部位別のフィルタリングをインデックスを活用した高速クエリで実行できる。Preferences の全データスキャンと比較して、パフォーマンスが大幅に向上する。

**Why this priority**: ユーザーが履歴を頻繁に閲覧する際、データ量が増えても快適な体験を維持するため。100件以上のセッションでも2秒以内に表示できる必要がある。

**Independent Test**: 100件のワークアウトセッションを作成→日付範囲で検索→2秒以内に結果が返ることを確認

**Acceptance Scenarios**:

1. **Given** 100件のワークアウトセッションが存在、**When** 過去1ヶ月のセッションを日付降順で取得、**Then** インデックス `idx_workout_sessions_date` を使用し、2秒以内に結果が返る
2. **Given** 種目「ベンチプレス」の履歴が50回存在、**When** 種目名「ベンチプレス」で検索、**Then** インデックス `idx_workout_exercises_exerciseName` を使用し、1秒以内に全履歴が返る
3. **Given** ライブラリに100種目が登録済み、**When** 部位「胸」でフィルタリング、**Then** インデックス `idx_exercises_bodyPart` を使用し、1秒以内に該当種目が返る

---

### User Story 3 - Schema Versioning and Migration (Priority: P2)

開発者は、スキーマバージョン管理により、将来的なデータベース構造の変更を安全に適用できる。`schema_version` テーブルで現在のバージョンを追跡し、マイグレーションスクリプトの実行状態を管理できる。

**Why this priority**: アプリの継続的な改善に必須。新機能追加時にスキーマ変更が必要になるが、既存ユーザーのデータを保護しながら移行できる。

**Independent Test**: 初期スキーマ(v1)を適用→バージョン確認→将来のマイグレーション(v2)を適用→データ損失なく移行完了を確認

**Acceptance Scenarios**:

1. **Given** 初回起動でデータベースが存在しない、**When** アプリを起動、**Then** スキーマv1が適用され、`schema_version` テーブルに `version=1` が記録される
2. **Given** スキーマv1が適用済み、**When** `getSchemaVersion()` を実行、**Then** 正しく `1` が返る
3. **Given** 将来的にスキーマv2が必要、**When** マイグレーションスクリプトを実行、**Then** 既存データを保持しつつ新しいテーブル/カラムが追加され、`schema_version` に `version=2` が記録される

---

### User Story 4 - Data Export and Import (Priority: P3)

ユーザーは、SQLiteデータベース全体をJSON形式でエクスポートし、バックアップとして保存できる。また、エクスポートしたJSONからデータベースを復元し、デバイス移行時やデータ損失時にワークアウト履歴を回復できる。

**Why this priority**: ユーザーの長期的なデータ保護とデバイス移行のサポート。MVP時点では必須ではないが、ユーザーの信頼性向上に貢献。

**Independent Test**: ワークアウトデータを作成→JSONエクスポート→データベースをクリア→JSONインポート→元のデータが完全に復元されることを確認

**Acceptance Scenarios**:

1. **Given** 10件のワークアウトセッションが存在、**When** `exportToJson()` を実行、**Then** 全セッション、種目、セット、ライブラリがJSON形式で出力される
2. **Given** エクスポートしたJSON文字列、**When** `importFromJson(jsonString)` を実行、**Then** データベースが完全に復元され、全てのリレーションが維持される
3. **Given** 不正なJSON形式のファイル、**When** インポートを試行、**Then** エラーメッセージ「Invalid JSON format」が表示され、既存データが破損しない

---

### Edge Cases

- **データベース初期化失敗**: アプリ起動時にSQLite接続に失敗した場合、エラーログを出力し、ユーザーに「データベース接続エラー」を通知。リトライ機能を提供
- **並行初期化**: 複数のコンポーネントが同時に `getConnection()` を呼び出した場合、`initializationPromise` により重複初期化を防止し、1度だけ初期化を実行
- **ストレージ容量不足**: デバイスのストレージが不足している場合、SQLiteの書き込みエラーをキャッチし、ユーザーに「ストレージ容量不足」を通知
- **トランザクションのロールバック**: データ書き込み中にエラーが発生した場合、トランザクションをロールバックし、不完全なデータがコミットされないことを保証
- **スキーマバージョンの不整合**: 既存データベースのバージョンが期待値と異なる場合、マイグレーションスクリプトを自動実行または警告を表示
- **カスケード削除の確認**: セッション削除時にユーザーに確認ダイアログを表示し、意図しないデータ損失を防止
- **JSON エクスポートサイズ制限**: 大量のデータ(1000件以上のセッション)をエクスポートする際、JSONサイズが大きくなりすぎる場合、分割エクスポートまたは圧縮を推奨
- **インデックスの効果測定**: 実際のクエリパフォーマンスを測定し、インデックスが正しく使用されているか `EXPLAIN QUERY PLAN` で検証

## Requirements *(mandatory)*

### Functional Requirements

#### Database Connection and Lifecycle

- **FR-001**: システムは `@capacitor-community/sqlite` を使用してSQLiteデータベース接続を確立できる
- **FR-002**: システムは `DatabaseManager` シングルトンインスタンスでデータベース接続を管理し、重複初期化を防止する
- **FR-003**: システムは `initialize(dbName?)` メソッドで明示的に初期化、または `getConnection()` 実行時に自動初期化できる
- **FR-004**: システムは並行初期化リクエストを `initializationPromise` で制御し、1度だけ初期化を実行する
- **FR-005**: システムは `close()` メソッドでデータベース接続を安全にクローズし、リソースを解放する

#### Schema Definition and Versioning

- **FR-006**: システムは `schema_version` テーブルでスキーマバージョンを追跡する
- **FR-007**: システムは `workout_sessions`, `workout_exercises`, `sets`, `exercises` の4つの主要テーブルを定義する
- **FR-008**: システムは外部キー制約 (`ON DELETE CASCADE`) により、親レコード削除時に子レコードを自動削除する
- **FR-009**: システムは以下のインデックスを作成し、クエリパフォーマンスを最適化する:
  - `idx_workout_sessions_date`: セッション日付降順
  - `idx_workout_exercises_sessionId`: セッションIDによる種目検索
  - `idx_workout_exercises_exerciseName`: 種目名による検索 (大文字小文字を区別しない)
  - `idx_sets_exerciseId`: 種目IDによるセット検索
  - `idx_exercises_bodyPart`: 部位による種目フィルタリング
  - `idx_exercises_lastUsed`: 最終使用日時降順
  - `idx_exercises_name`: 種目名検索 (大文字小文字を区別しない)
- **FR-010**: システムは `getSchemaVersion()` メソッドで現在のスキーマバージョンを取得できる

#### Data Integrity and Constraints

- **FR-011**: システムは `sets` テーブルで重量 (`weight >= 0`) とレップ数 (`reps >= 1`) の制約を定義する
- **FR-012**: システムは UUID v4 形式で全てのエンティティIDを生成する
- **FR-013**: システムは ISO 8601 形式で全ての日時フィールドを保存する
- **FR-014**: システムは `createdAt` と `updatedAt` タイムスタンプを自動管理する

#### Data Export and Import

- **FR-015**: システムは `exportToJson()` メソッドでデータベース全体をJSON形式でエクスポートできる
- **FR-016**: システムは `importFromJson(jsonString)` メソッドでJSONからデータベースを復元できる
- **FR-017**: システムは不正なJSON形式のインポートを検出し、エラーメッセージを返す

#### Testing and Development Support

- **FR-018**: システムは `:memory:` データベース名でインメモリデータベースを作成し、テスト実行を高速化できる
- **FR-019**: システムは `clearAllData()` メソッドで全てのテーブルデータを削除し、テスト環境をリセットできる

### Key Entities

- **WorkoutSession**: 1回のトレーニングセッションを表す。属性: id (UUID), date (ISO 8601), totalTime (秒), createdAt, updatedAt。リレーション: 1対多で `WorkoutExercise` を持つ
- **WorkoutExercise**: セッション内の個別種目を表す。属性: id (UUID), sessionId (外部キー), exerciseId (ライブラリ参照、オプション), exerciseName (非正規化), bodyPart, maxWeight (計算値), order。リレーション: 1対多で `Set` を持つ
- **Set**: 1セットの記録を表す。属性: id (UUID), exerciseId (外部キー), weight (>= 0), reps (>= 1), completedAt (ISO 8601), order
- **Exercise**: トレーニングライブラリの種目定義。属性: id (UUID), name, bodyPart, videoUrl (オプション), createdAt, lastUsed
- **SchemaVersion**: スキーマバージョン管理。属性: version (整数、主キー), appliedAt (適用日時)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: データベース初期化が初回起動時に1秒以内に完了し、ユーザーが待たされない
- **SC-002**: 100件のワークアウトセッションが存在する状態で、日付範囲検索が2秒以内に結果を返す
- **SC-003**: 種目名検索 (例: "ベンチプレス") が、50件の履歴が存在する場合でも1秒以内に完了する
- **SC-004**: ワークアウトセッション削除時、関連する全ての種目とセットが確実にカスケード削除され、孤立データが0件である
- **SC-005**: データベースエクスポート/インポートが100件のセッション (約1000レコード) に対して5秒以内に完了する
- **SC-006**: 並行初期化リクエスト (5つ同時) が発生しても、データベースは1度だけ初期化され、エラーが発生しない
- **SC-007**: スキーマバージョン取得が100ミリ秒以内に完了し、バージョン確認がアプリ起動のボトルネックにならない
- **SC-008**: データ書き込みエラー発生時、トランザクションが確実にロールバックされ、データベース整合性が100%維持される
- **SC-009**: 全てのクエリでインデックスが活用され、`EXPLAIN QUERY PLAN` で "USING INDEX" が確認できる
- **SC-010**: コントラクトテスト (T024-T027) が100%パスし、ストレージレイヤーの契約が満たされている

### Assumptions

- **A-001**: ユーザーはCapacitor 7対応のiOSまたはAndroid端末を使用している
- **A-002**: @capacitor-community/sqlite プラグインが正しくインストールされ、ネイティブビルドが成功している
- **A-003**: デバイスのストレージに十分な空き容量 (最低100MB) がある
- **A-004**: SQLiteデータベースファイルは端末のアプリケーション専用ストレージに保存され、他のアプリからアクセスできない
- **A-005**: ユーザーはワークアウトデータを長期間 (1年以上) 保持したいと考えている
- **A-006**: 将来的にスキーマ変更 (新しいテーブルやカラム追加) が必要になる可能性が高い
- **A-007**: データベースのバックアップとリストア機能は、デバイス移行やデータ損失対策として重要
- **A-008**: パフォーマンス要件は、最大1000件のセッション (約10000レコード) を想定している
