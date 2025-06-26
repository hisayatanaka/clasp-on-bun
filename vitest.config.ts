// Vitest設定ファイル - Google Apps Script環境対応
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // テスト環境設定
    environment: 'jsdom',

    // テストファイルのパターン
    include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],

    // 除外パターン
    exclude: ['node_modules', 'dist', '.git', '*.config.*'],

    // グローバル設定
    globals: true,

    // セットアップファイル
    setupFiles: ['./tests/setup.ts'],

    // テストタイムアウト
    testTimeout: 10000,

    // カバレッジ設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    // レポーター設定
    reporters: ['verbose', 'html'],
    outputFile: {
      html: './test-results/index.html',
    },
  },

  // TypeScript設定の継承
  esbuild: {
    target: 'esnext',
  },
});
