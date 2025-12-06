# fitronix Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-05

## Active Technologies

- TypeScript 5.7, JavaScript ES2020+ (002-workout-tracker-sqlite-migration)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.7, JavaScript ES2020+: Follow standard conventions

## Git Commit Guidelines

**コミットメッセージは日本語で記述すること**

- 形式: `type(scope): 何をしたか`
- 本文: なぜそれをしたのかを簡潔に説明
- 詳細な結果やテスト結果は不要

例:
```
fix(storage): contract testの失敗を修正

- updateSessionでcreatedAtが上書きされる問題を修正
- テスト間でデータが残る問題を修正
```

## Recent Changes

- 002-workout-tracker-sqlite-migration: Added TypeScript 5.7, JavaScript ES2020+

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
