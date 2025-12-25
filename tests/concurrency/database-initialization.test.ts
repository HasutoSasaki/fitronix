/**
 * Concurrency Tests for Database Initialization
 * Test: データベース接続の並行初期化における安全性確保
 *
 * このテストファイルは以下を検証する:
 * 1. 複数の並行初期化試行がレースコンディションを起こさないこと
 * 2. Singletonパターンが並行アクセス下で正しく機能すること
 * 3. 並行初期化後にすべての接続が正常に機能すること
 * 4. データ操作の一貫性が保たれること
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { type SQLiteDBConnection } from '@capacitor-community/sqlite';
import DatabaseManager from '../../src/services/database/DatabaseManager';
import { WorkoutSessionStorage } from '../../src/services/database/WorkoutSessionStorage';

describe('Database Initialization Concurrency Safety', () => {
  // テスト用のインメモリデータベース名を使用
  const TEST_DB_NAME = ':memory:';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let storage: WorkoutSessionStorage;

  beforeEach(async () => {
    // DatabaseManagerインスタンスをリセット
    await DatabaseManager.close();

    // テストごとに新しいストレージインスタンスを作成
    storage = new WorkoutSessionStorage();
  });

  afterEach(async () => {
    try {
      await DatabaseManager.close();
    } catch (error) {
      console.error(error);
    }
  });

  describe('並行初期化の基本テスト', () => {
    it('複数の並行初期化リクエストが同じインスタンスを返すこと', async () => {
      // 10個の並行初期化を実行
      const initPromises = Array.from({ length: 10 }, () =>
        DatabaseManager.initialize(TEST_DB_NAME)
      );

      // すべての初期化が完了するのを待つ
      await Promise.all(initPromises);

      // データベース接続を取得
      const connections = await Promise.all(
        Array.from({ length: 10 }, () => DatabaseManager.getConnection())
      );

      // すべての接続が同じインスタンスであることを確認
      const firstConnection = connections[0];
      connections.forEach((connection) => {
        expect(connection).toBe(firstConnection);
      });

      // 基本的なクエリが実行できることを確認（モック環境では空の結果を返す）
      const result = await firstConnection.query('SELECT 1 as test');
      expect(result.values).toEqual([]);
    });

    it('初期化中に接続リクエストがあっても正常に処理されること', async () => {
      // 初期化と接続リクエストを並行実行
      const promises = [
        DatabaseManager.initialize(TEST_DB_NAME),
        DatabaseManager.getConnection(),
        DatabaseManager.getConnection(),
        DatabaseManager.initialize(TEST_DB_NAME),
        DatabaseManager.getConnection(),
      ];

      const results = await Promise.all(promises);

      // 初期化は成功し、接続は取得できること
      expect(results[0]).toBeUndefined(); // initialize returns void
      expect(results[1]).toBeDefined(); // connection
      expect(results[2]).toBeDefined(); // connection
      expect(results[3]).toBeUndefined(); // initialize returns void
      expect(results[4]).toBeDefined(); // connection

      // すべての接続が同じインスタンスであることを確認
      const connections = results
        .slice(1, 2)
        .concat(results.slice(2, 3))
        .concat(results.slice(4));
      const firstConnection = connections[0];
      connections.forEach((connection) => {
        if (connection) {
          expect(connection).toBe(firstConnection);
        }
      });
    });
  });

  describe('高負荷並行アクセステスト', () => {
    it('50個の並行初期化と接続リクエストが安全に処理されること', async () => {
      const promises = [];

      // 25個の初期化リクエスト
      for (let i = 0; i < 25; i++) {
        promises.push(DatabaseManager.initialize(TEST_DB_NAME));
      }

      // 25個の接続リクエスト
      for (let i = 0; i < 25; i++) {
        promises.push(DatabaseManager.getConnection());
      }

      const results = await Promise.all(promises);

      // 初期化リクエストは成功
      for (let i = 0; i < 25; i++) {
        expect(results[i]).toBeUndefined();
      }

      // 接続リクエストは有効な接続を返す
      for (let i = 25; i < 50; i++) {
        expect(results[i]).toBeDefined();
        expect(typeof (results[i] as any).query).toBe('function');
      }
    });

    it('迅速な連続初期化が安全に処理されること', async () => {
      // 100回の迅速な連続初期化
      const promises = Array.from({ length: 100 }, () =>
        DatabaseManager.initialize(TEST_DB_NAME)
      );

      // すべての初期化が正常に完了することを確認
      await Promise.all(promises);

      // 各初期化が正常に完了し、接続が取得できることを確認
      const connection = await DatabaseManager.getConnection();
      expect(connection).toBeDefined();
      expect(typeof connection.query).toBe('function');
    });
  });

  describe('データ操作の並行安全性テスト', () => {
    it('並行初期化後にストレージインスタンスが正常に動作すること', async () => {
      // 並行初期化
      await Promise.all([
        DatabaseManager.initialize(TEST_DB_NAME),
        DatabaseManager.initialize(TEST_DB_NAME),
        DatabaseManager.initialize(TEST_DB_NAME),
      ]);

      // 複数のストレージインスタンスを作成
      const storage1 = new WorkoutSessionStorage();
      const storage2 = new WorkoutSessionStorage();
      const storage3 = new WorkoutSessionStorage();

      // 並行して接続を取得（ストレージインスタンスの初期化チェック）
      const connectionPromises = await Promise.all([
        storage1['getDb'](),
        storage2['getDb'](),
        storage3['getDb'](),
      ]);

      // すべてのストレージインスタンスが同じ接続を取得すること
      expect(connectionPromises[0]).toBe(connectionPromises[1]);
      expect(connectionPromises[1]).toBe(connectionPromises[2]);

      // 基本的なクエリ操作が並行実行できることを確認
      const queryResults = await Promise.all([
        connectionPromises[0].query('SELECT 1'),
        connectionPromises[1].query('SELECT 2'),
        connectionPromises[2].query('SELECT 3'),
      ]);

      queryResults.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.values).toEqual([]);
      });
    });

    it('並行接続リクエストが同じインスタンスを返すことを確認', async () => {
      // 初期化
      await DatabaseManager.initialize(TEST_DB_NAME);

      // 100個の並行接続リクエスト
      const connectionPromises = Array.from({ length: 100 }, () =>
        DatabaseManager.getConnection()
      );

      const connections = await Promise.all(connectionPromises);

      // すべての接続が同じインスタンスであることを確認
      const firstConnection = connections[0];
      connections.forEach((connection) => {
        expect(connection).toBe(firstConnection);
      });

      // 並行クエリ実行の安定性テスト
      const queryPromises = connections
        .slice(0, 50)
        .map((connection, index) =>
          connection.query(`SELECT ${index} as value`)
        );

      const queryResults = await Promise.all(queryPromises);
      queryResults.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.values).toEqual([]);
      });
    });
  });

  describe('エラーハンドリングと復旧テスト', () => {
    it('再初期化が正常に動作すること', async () => {
      // 初回の初期化
      await DatabaseManager.initialize(TEST_DB_NAME);

      // 接続をクローズ
      await DatabaseManager.close();

      // 再初期化
      await DatabaseManager.initialize(TEST_DB_NAME);
      const secondConnection = await DatabaseManager.getConnection();

      // 新しい接続が取得できることを確認
      expect(secondConnection).toBeDefined();
      expect(typeof secondConnection.query).toBe('function');

      // 基本的なクエリ操作が正常に動作することを確認
      const result = await secondConnection.query('SELECT 1 as recovery_test');
      expect(result.values).toEqual([]);
    });

    it('並行初期化が安全に処理されること', async () => {
      // 複数の初期化を並行実行（モック環境では全て成功）
      const promises = [
        DatabaseManager.initialize(TEST_DB_NAME), // 正常
        DatabaseManager.initialize(TEST_DB_NAME), // 正常
        DatabaseManager.initialize(TEST_DB_NAME), // 正常
        DatabaseManager.initialize(TEST_DB_NAME), // 正常
        DatabaseManager.getConnection(), // 正常
      ];

      const results = await Promise.allSettled(promises);

      // すべての初期化が成功
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
      expect(results[2].status).toBe('fulfilled');
      expect(results[3].status).toBe('fulfilled');
      expect(results[4].status).toBe('fulfilled');

      // 接続は正常に取得できる
      if (results[4].status === 'fulfilled') {
        const connection = results[4].value as SQLiteDBConnection;
        const result = await connection.query('SELECT 1 as stability_test');
        expect(result.values).toEqual([]);
      }
    });
  });

  describe('スキーマ整合性テスト', () => {
    it('並行初期化後にデータベース接続が一貫していること', async () => {
      // 複数の並行初期化
      await Promise.all([
        DatabaseManager.initialize(TEST_DB_NAME),
        DatabaseManager.initialize(TEST_DB_NAME),
        DatabaseManager.initialize(TEST_DB_NAME),
        DatabaseManager.initialize(TEST_DB_NAME),
        DatabaseManager.initialize(TEST_DB_NAME),
      ]);

      // 複数の接続を取得して同じインスタンスであることを確認
      const connections = await Promise.all([
        DatabaseManager.getConnection(),
        DatabaseManager.getConnection(),
        DatabaseManager.getConnection(),
        DatabaseManager.getConnection(),
        DatabaseManager.getConnection(),
      ]);

      // すべての接続が同じインスタンスであること
      const firstConnection = connections[0];
      connections.forEach((connection) => {
        expect(connection).toBe(firstConnection);
      });

      // 基本的なクエリ操作が正常に動作すること
      const result = await firstConnection.query(
        'SELECT name FROM sqlite_master'
      );
      expect(result.values).toEqual([]);
    });

    it('並行初期化後にデータベース接続の状態が正常であること', async () => {
      // 並行初期化
      await Promise.all(
        Array.from({ length: 10 }, () =>
          DatabaseManager.initialize(TEST_DB_NAME)
        )
      );

      // 接続の取得と基本操作の確認
      const connection = await DatabaseManager.getConnection();
      expect(connection).toBeDefined();
      expect(typeof connection.query).toBe('function');
      expect(typeof connection.run).toBe('function');
      expect(typeof connection.execute).toBe('function');

      // 基本的なクエリが実行できることを確認
      const queryResult = await connection.query('SELECT 1');
      expect(queryResult).toBeDefined();
      expect(queryResult.values).toEqual([]);

      // 基本的な実行コマンドが動作することを確認
      const runResult = await connection.run('SELECT 1', []);
      expect(runResult).toBeDefined();
    });
  });

  describe('パフォーマンスと安定性テスト', () => {
    it('大量の並行リクエストが合理的な時間内に完了すること', async () => {
      const startTime = Date.now();

      // 200個の並行リクエスト（初期化と接続の混合）
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(DatabaseManager.initialize(TEST_DB_NAME));
      }
      for (let i = 0; i < 100; i++) {
        promises.push(DatabaseManager.getConnection());
      }

      await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 10秒以内に完了すること（パフォーマンス要件）
      expect(duration).toBeLessThan(10000);

      // すべての接続が正常に動作することを確認
      const connection = await DatabaseManager.getConnection();
      const result = await connection.query('SELECT 1 as perf_test');
      expect(result.values).toEqual([]);
    });

    it('メモリリークが発生しないこと（基本チェック）', async () => {
      const initialMemory = process.memoryUsage();

      // 大量の並行操作
      for (let cycle = 0; cycle < 10; cycle++) {
        const promises = Array.from({ length: 50 }, () =>
          DatabaseManager.initialize(TEST_DB_NAME)
        );
        await Promise.all(promises);

        // 定期的にガベージコレクション実行（可能な場合）
        if (global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage();

      // メモリ使用量が大幅に増加していないことを確認
      // （厳密なリークテストではなく、基本的な安定性チェック）
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreasePercent =
        (memoryIncrease / initialMemory.heapUsed) * 100;

      // メモリ増加が初期値の200%以下であることを確認（緩い制限）
      expect(memoryIncreasePercent).toBeLessThan(200);
    });
  });
});
