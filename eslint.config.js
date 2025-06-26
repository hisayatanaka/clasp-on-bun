// ESLint設定ファイル - TypeScript + Google Apps Script環境用
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Google Apps Script グローバル変数
        SpreadsheetApp: 'readonly',
        Logger: 'readonly',
        PropertiesService: 'readonly',
        Utilities: 'readonly',
        DriveApp: 'readonly',
        GmailApp: 'readonly',
        MailApp: 'readonly',
        Session: 'readonly',
        HtmlService: 'readonly',
        ScriptApp: 'readonly',
        // Node.js/Browser globals
        globalThis: 'writable',
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Prettierルール
      'prettier/prettier': 'error',

      // 一般的なESLintルール
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': 'off', // TypeScriptで処理
      'no-undef': 'off', // TypeScriptで処理

      // TypeScript基本ルール
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // コメント関連（CLAUDE.mdの方針に従い積極的なコメントを推奨）
      'spaced-comment': ['error', 'always'],
    },
  },
  {
    // 設定ファイルは除外
    files: ['eslint.config.js', '*.config.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    // テストファイルでのanyを許容
    files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // 無視するパターン
    ignores: [
      'dist/',
      'node_modules/',
      'coverage/',
      'test-results/',
      '*.min.js',
      '.clasp.json',
      '.clasprc.json',
    ],
  },
  prettierConfig,
];
