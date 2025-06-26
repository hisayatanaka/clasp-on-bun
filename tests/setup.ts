// Vitestセットアップファイル - Google Apps Script APIモック
import { vi } from 'vitest';

// Google Apps Script グローバルオブジェクトのモック
(global as any).SpreadsheetApp = {
  getActiveSpreadsheet: vi.fn(),
  getUi: vi.fn(),
  ButtonSet: {
    OK: 'OK',
    OK_CANCEL: 'OK_CANCEL',
    YES_NO: 'YES_NO',
    YES_NO_CANCEL: 'YES_NO_CANCEL',
  },
};

(global as any).Logger = {
  log: vi.fn(),
};

(global as any).PropertiesService = {
  getScriptProperties: vi.fn(),
  getUserProperties: vi.fn(),
  getDocumentProperties: vi.fn(),
};

// SpreadsheetAppのメソッドチェーンモック
const createMockSheet = () => ({
  getRange: vi.fn().mockReturnThis(),
  setValue: vi.fn().mockReturnThis(),
  getValue: vi.fn(),
  getValues: vi.fn(),
  getLastRow: vi.fn(),
  getLastColumn: vi.fn(),
  getName: vi.fn().mockReturnValue('Sheet1'),
});

const createMockSpreadsheet = () => ({
  getSheets: vi.fn().mockReturnValue([createMockSheet()]),
  getActiveSheet: vi.fn().mockReturnValue(createMockSheet()),
  getName: vi.fn().mockReturnValue('TestSpreadsheet'),
  getId: vi.fn().mockReturnValue('test-spreadsheet-id'),
});

const createMockUi = () => ({
  alert: vi.fn(),
  prompt: vi.fn(),
  createMenu: vi.fn().mockReturnThis(),
  addItem: vi.fn().mockReturnThis(),
  addToUi: vi.fn().mockReturnThis(),
  ButtonSet: (global as any).SpreadsheetApp.ButtonSet,
});

// デフォルトモックの設定
vi.mocked((global as any).SpreadsheetApp.getActiveSpreadsheet).mockReturnValue(
  createMockSpreadsheet() as any
);
vi.mocked((global as any).SpreadsheetApp.getUi).mockReturnValue(
  createMockUi() as any
);

// テスト用ヘルパー関数をエクスポート
export const createMockGASEnvironment = () => ({
  mockSheet: createMockSheet(),
  mockSpreadsheet: createMockSpreadsheet(),
  mockUi: createMockUi(),
});

// コンソールログのモック（テスト時に静音化）
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
