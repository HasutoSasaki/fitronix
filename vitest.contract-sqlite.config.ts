import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Vitest configuration for SQLite contract tests
 * Tests that SQLite storage implementations satisfy the storage contracts
 */
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/setup.ts'],
    include: ['tests/contract/**/*.test.ts'],
    // SQLite-specific test environment variables
    env: {
      STORAGE_BACKEND: 'sqlite',
      DB_NAME: ':memory:',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.ts',
        '*.config.js',
        'dist/',
        'ios/',
        'android/',
      ],
    },
  },
});
