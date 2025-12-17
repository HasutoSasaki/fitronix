/**
 * Performance Tests for SQLite Database Queries
 * 
 * これらのテストは、SQLiteデータベースのクエリパフォーマンスを検証します。
 * 大量のワークアウトデータを使用してgetSessionsByDateRangeメソッドの実行時間を測定し、
 * 2秒以下の応答時間を確保します。
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { IWorkoutSessionStorage } from '../../src/contracts/storage';
import { BodyPart } from '../../src/types/models';
import { generateUUID } from '../../src/utils/storage';

// Import implementation
import { WorkoutSessionStorage } from '../../src/services/database/storage';

/**
 * 100個のワークアウトセッションを作成
 * 各セッション：2-3のエクササイズ、各エクササイズ：2-4セット
 * データ期間：6ヶ月間に分散
 */
const createPerformanceTestData = async (storage: IWorkoutSessionStorage) => {
  const sessions = [];
  const startDate = new Date('2024-06-01T10:00:00.000Z');
  const endDate = new Date('2024-12-01T10:00:00.000Z');
  const dateRange = endDate.getTime() - startDate.getTime();

  // 一般的なエクササイズ名とボディパート
  const exercises = [
    { name: 'ベンチプレス', bodyPart: BodyPart.CHEST },
    { name: 'スクワット', bodyPart: BodyPart.LEGS },
    { name: 'デッドリフト', bodyPart: BodyPart.BACK },
    { name: 'ショルダープレス', bodyPart: BodyPart.SHOULDERS },
    { name: 'バーベルカール', bodyPart: BodyPart.ARMS },
    { name: 'プランク', bodyPart: BodyPart.ABS },
    { name: 'ラットプルダウン', bodyPart: BodyPart.BACK },
    { name: 'レッグプレス', bodyPart: BodyPart.LEGS },
    { name: 'ダンベルフライ', bodyPart: BodyPart.CHEST },
    { name: 'サイドレイズ', bodyPart: BodyPart.SHOULDERS },
  ];

  for (let i = 0; i < 100; i++) {
    // ランダムな日付を生成（6ヶ月間に分散）
    const randomTime = startDate.getTime() + Math.random() * dateRange;
    const sessionDate = new Date(randomTime).toISOString();

    // 2-3個のエクササイズをランダム選択
    const exerciseCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
    const selectedExercises = [];

    for (let j = 0; j < exerciseCount; j++) {
      const exerciseInfo = exercises[Math.floor(Math.random() * exercises.length)]!;
      const exerciseId = generateUUID();

      // 2-4セットを生成
      const setCount = 2 + Math.floor(Math.random() * 3); // 2, 3, or 4
      const sets = [];

      for (let k = 0; k < setCount; k++) {
        const setTime = new Date(randomTime + (j * 10 + k * 2) * 60000); // 各セット間に2分のインターバル
        sets.push({
          id: generateUUID(),
          exerciseId,
          weight: 40 + Math.floor(Math.random() * 80), // 40-120kg
          reps: 6 + Math.floor(Math.random() * 9), // 6-14回
          completedAt: setTime.toISOString(),
          order: k,
        });
      }

      selectedExercises.push({
        id: exerciseId,
        sessionId: '', // 後で設定
        exerciseName: exerciseInfo.name,
        bodyPart: exerciseInfo.bodyPart,
        sets,
        maxWeight: Math.max(...sets.map(s => s.weight)),
        order: j,
      });
    }

    // セッション時間を計算（最初のセットから最後のセットまで）
    const allSets = selectedExercises.flatMap(ex => ex.sets);
    const firstSetTime = Math.min(...allSets.map(s => new Date(s.completedAt).getTime()));
    const lastSetTime = Math.max(...allSets.map(s => new Date(s.completedAt).getTime()));
    const totalTimeSeconds = Math.floor((lastSetTime - firstSetTime) / 1000) + 300; // +5分のクールダウン

    const session = await storage.createSession({
      date: sessionDate,
      totalTime: totalTimeSeconds,
      exercises: selectedExercises,
    });

    sessions.push(session);
  }

  return sessions;
};

describe('Performance: Query Performance', () => {
  let storage: IWorkoutSessionStorage;

  // パフォーマンステストのしきい値（ミリ秒）
  const PERFORMANCE_THRESHOLD_MS = 2000;

  beforeEach(async () => {
    // SQLite用にDatabaseManagerを初期化
    const DatabaseManager = (await import('../../src/services/database/DatabaseManager')).default;
    await DatabaseManager.initialize(':memory:');
    await DatabaseManager.clearAllData();
    
    storage = new WorkoutSessionStorage();
  });

  describe('大量データでのgetSessionsByDateRange性能テスト', () => {
    it('1週間の範囲クエリが2秒以下で完了すること', async () => {
      // テストデータを作成
      await createPerformanceTestData(storage);

      // テスト対象の日付範囲（1週間）
      const startDate = '2024-09-15T00:00:00.000Z';
      const endDate = '2024-09-21T23:59:59.999Z';

      // パフォーマンス測定
      const startTime = performance.now();
      const results = await storage.getSessionsByDateRange(startDate, endDate);
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      // アサーション
      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(results).toBeInstanceOf(Array);
      
      // 結果の妥当性をチェック
      for (const session of results) {
        const sessionTime = new Date(session.date).getTime();
        const startTime = new Date(startDate).getTime();
        const endTime = new Date(endDate).getTime();
        expect(sessionTime).toBeGreaterThanOrEqual(startTime);
        expect(sessionTime).toBeLessThanOrEqual(endTime);
      }

      console.log(`1週間範囲クエリ実行時間: ${executionTime.toFixed(2)}ms (結果: ${results.length}セッション)`);
    }, 10000);

    it('1ヶ月の範囲クエリが2秒以下で完了すること', async () => {
      // テストデータを作成
      await createPerformanceTestData(storage);

      // テスト対象の日付範囲（1ヶ月）
      const startDate = '2024-09-01T00:00:00.000Z';
      const endDate = '2024-09-30T23:59:59.999Z';

      // パフォーマンス測定
      const startTime = performance.now();
      const results = await storage.getSessionsByDateRange(startDate, endDate);
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      // アサーション
      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(results).toBeInstanceOf(Array);
      
      // 結果の妥当性をチェック
      for (const session of results) {
        const sessionTime = new Date(session.date).getTime();
        const startTime = new Date(startDate).getTime();
        const endTime = new Date(endDate).getTime();
        expect(sessionTime).toBeGreaterThanOrEqual(startTime);
        expect(sessionTime).toBeLessThanOrEqual(endTime);
      }

      console.log(`1ヶ月範囲クエリ実行時間: ${executionTime.toFixed(2)}ms (結果: ${results.length}セッション)`);
    }, 10000);

    it('3ヶ月の範囲クエリが2秒以下で完了すること', async () => {
      // テストデータを作成
      await createPerformanceTestData(storage);

      // テスト対象の日付範囲（3ヶ月）
      const startDate = '2024-09-01T00:00:00.000Z';
      const endDate = '2024-11-30T23:59:59.999Z';

      // パフォーマンス測定
      const startTime = performance.now();
      const results = await storage.getSessionsByDateRange(startDate, endDate);
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      // アサーション
      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(results).toBeInstanceOf(Array);
      
      // 結果の妥当性をチェック
      for (const session of results) {
        const sessionTime = new Date(session.date).getTime();
        const startTime = new Date(startDate).getTime();
        const endTime = new Date(endDate).getTime();
        expect(sessionTime).toBeGreaterThanOrEqual(startTime);
        expect(sessionTime).toBeLessThanOrEqual(endTime);
      }

      console.log(`3ヶ月範囲クエリ実行時間: ${executionTime.toFixed(2)}ms (結果: ${results.length}セッション)`);
    }, 10000);
  });

  describe('エッジケースでの性能テスト', () => {
    it('空の結果セットでも高速に応答すること', async () => {
      // テストデータを作成（異なる期間）
      await createPerformanceTestData(storage);

      // データが存在しない期間のクエリ
      const startDate = '2023-01-01T00:00:00.000Z';
      const endDate = '2023-01-31T23:59:59.999Z';

      const startTime = performance.now();
      const results = await storage.getSessionsByDateRange(startDate, endDate);
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      // アサーション
      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(results).toHaveLength(0);

      console.log(`空結果クエリ実行時間: ${executionTime.toFixed(2)}ms`);
    });

    it('単日クエリが高速に応答すること', async () => {
      // テストデータを作成
      const sessions = await createPerformanceTestData(storage);
      
      // 作成されたセッションの中から1つの日付を選択
      const targetSession = sessions[Math.floor(Math.random() * sessions.length)]!;
      const targetDate = new Date(targetSession.date);
      
      // 同じ日の開始と終了時刻
      const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).toISOString();
      const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999).toISOString();

      const startTime = performance.now();
      const results = await storage.getSessionsByDateRange(startDate, endDate);
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      // アサーション
      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThanOrEqual(0);

      console.log(`単日クエリ実行時間: ${executionTime.toFixed(2)}ms (結果: ${results.length}セッション)`);
    });

    it('非常に短い時間範囲でも高速に応答すること', async () => {
      // テストデータを作成
      await createPerformanceTestData(storage);

      // 1時間の範囲
      const baseTime = new Date('2024-09-15T12:00:00.000Z');
      const startDate = baseTime.toISOString();
      const endDate = new Date(baseTime.getTime() + 60 * 60 * 1000).toISOString(); // +1時間

      const startTime = performance.now();
      const results = await storage.getSessionsByDateRange(startDate, endDate);
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      // アサーション
      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(results).toBeInstanceOf(Array);

      console.log(`短時間範囲クエリ実行時間: ${executionTime.toFixed(2)}ms (結果: ${results.length}セッション)`);
    });

    it('全期間クエリが2秒以下で完了すること', async () => {
      // テストデータを作成
      await createPerformanceTestData(storage);

      // 全期間をカバー
      const startDate = '2024-01-01T00:00:00.000Z';
      const endDate = '2024-12-31T23:59:59.999Z';

      const startTime = performance.now();
      const results = await storage.getSessionsByDateRange(startDate, endDate);
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      // アサーション
      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBe(100); // 作成した全セッションが取得されること

      // 結果がdate降順でソートされていることを確認
      for (let i = 1; i < results.length; i++) {
        const prevTime = new Date(results[i - 1]!.date).getTime();
        const currTime = new Date(results[i]!.date).getTime();
        expect(prevTime).toBeGreaterThanOrEqual(currTime);
      }

      console.log(`全期間クエリ実行時間: ${executionTime.toFixed(2)}ms (結果: ${results.length}セッション)`);
    }, 10000);
  });

  describe('複数回実行での一貫性テスト', () => {
    it('同じクエリを複数回実行しても一貫して高速であること', async () => {
      // テストデータを作成
      await createPerformanceTestData(storage);

      const startDate = '2024-09-01T00:00:00.000Z';
      const endDate = '2024-09-30T23:59:59.999Z';

      const executionTimes = [];
      const results = [];

      // 5回同じクエリを実行
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        const result = await storage.getSessionsByDateRange(startDate, endDate);
        const endTime = performance.now();

        executionTimes.push(endTime - startTime);
        results.push(result);
      }

      // すべての実行が閾値以下であること
      for (const time of executionTimes) {
        expect(time).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      }

      // すべての結果が同一であること
      for (let i = 1; i < results.length; i++) {
        expect(results[i]!.length).toBe(results[0]!.length);
        expect(results[i]!.map(s => s.id).sort()).toEqual(results[0]!.map(s => s.id).sort());
      }

      const avgTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
      const maxTime = Math.max(...executionTimes);
      const minTime = Math.min(...executionTimes);

      console.log(`複数回実行結果 - 平均: ${avgTime.toFixed(2)}ms, 最大: ${maxTime.toFixed(2)}ms, 最小: ${minTime.toFixed(2)}ms`);
    }, 15000);
  });
});