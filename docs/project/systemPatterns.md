# システムパターンとアーキテクチャ

## システムアーキテクチャ
### 全体構成
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ローカル開発   │    │   ビルド・配信   │    │  実行環境      │
│                │    │                │    │                │
│  TypeScript     │───▶│  Bun + clasp    │───▶│ Google Sheets   │
│  VSCode        │    │  Transpile      │    │ Google Apps     │
│  Git           │    │  Deploy         │    │ Script         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### レイヤー設計
1. **プレゼンテーション層**: Google Sheetsのカスタムメニュー
2. **ビジネスロジック層**: 各機能モジュール（`src/`）
3. **データアクセス層**: GAS APIを通じたSpreadsheet操作
4. **インフラ層**: Google Apps Script実行環境

## 主要な技術的決定
### 1. 関数型プログラミングアプローチ
- **決定**: classを使わず、関数ベースの実装
- **理由**: 
  - 副作用の最小化
  - テストの容易性
  - コードの可読性向上
  - 並行処理の安全性

### 2. モジュール分割戦略（実装版）
```typescript
// エントリーポイント（main.ts）- 直接グローバル関数定義
import { sayHelloWorldLogic } from './helloWorldModule';

/**
 * Google Apps Scriptのスプレッドシート開時に実行される関数
 * カスタムメニューを作成し、Hello World実行項目を追加する
 */
function onOpen(): void {
  SpreadsheetApp.getUi()
    .createMenu('カスタムマクロ')
    .addItem('Hello World実行', 'sayHelloWorldToSheetFromTS')
    .addToUi();
}

// Google Apps Scriptのグローバルスコープに直接設定
(globalThis as any).onOpen = onOpen;
(globalThis as any).sayHelloWorldToSheetFromTS = sayHelloWorldLogic;
```

### 3. 型安全エラーハンドリングパターン
```typescript
// unknown型を使用した型安全なエラーハンドリング
export function sayHelloWorldLogic(): void {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheets()[0];
    if (sheet) {
      sheet.getRange('A1').setValue('Hello, World.');
      SpreadsheetApp.getUi().alert(
        '成功',
        'A1セルに "Hello, World." と書き込みました。',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : '不明なエラーが発生しました';
    Logger.log(`Error in sayHelloWorldLogic: ${errorMessage}`);
    SpreadsheetApp.getUi().alert(
      'エラー',
      `エラーが発生しました: ${errorMessage}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}
```

### 4. テスタビリティパターン
```typescript
// テスト可能な設計: エクスポート関数 + グローバル登録分離
// main.ts
export function onOpen(): void { /* 実装 */ }           // テスト可能
export function initializeGASGlobalFunctions(): void { /* グローバル登録 */ } // テスト可能

// テストファイル（main.test.ts）
import { onOpen, initializeGASGlobalFunctions } from './main';

describe('main.ts', () => {
  it('onOpen関数が正しくメニューを作成する', () => {
    onOpen(); // 直接テスト可能
    expect(mockUi.createMenu).toHaveBeenCalledWith('カスタムマクロ');
  });
});
```

## 適用済みデザインパターン

### 1. テスト駆動開発（TDD）パターン
```typescript
// 1. テスト先行記述（main.test.ts）
describe('onOpen関数のテスト', () => {
  it('onOpen関数実行時に正しいメニューが作成される', () => {
    onOpen();
    expect(mockUi.createMenu).toHaveBeenCalledWith('カスタムマクロ');
  });
});

// 2. 実装（main.ts） 
export function onOpen(): void {
  SpreadsheetApp.getUi()
    .createMenu('カスタムマクロ')
    .addItem('Hello World実行', 'sayHelloWorldToSheetFromTS')
    .addToUi();
}
```

### 2. モックオブジェクトパターン
```typescript
// tests/setup.ts - Google Apps Script APIの完全モック
export const createMockGASEnvironment = () => ({
  mockSheet: createMockSheet(),
  mockSpreadsheet: createMockSpreadsheet(),
  mockUi: createMockUi(),
});
```

### 3. ファクトリパターン（テスト環境）
```typescript
// 再利用可能なモックファクトリ
const createMockSheet = () => ({
  getRange: vi.fn().mockReturnThis(),
  setValue: vi.fn().mockReturnThis(),
  getValue: vi.fn(),
  getName: vi.fn().mockReturnValue('Sheet1'),
});
```

### 4. 戦略パターン（エラーハンドリング）
```typescript
// 型に応じたエラーハンドリング戦略
const handleError = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return '不明なエラーが発生しました';
};
```

## 現在のアーキテクチャ構成

### 依存関係グラフ（実装済み）
```
┌─────────────────┐    ┌─────────────────┐
│    main.ts      │    │helloWorldModule │
│  ✅ 実装済み     │───▶│  ✅ 実装済み     │
│  ⚠️ any型警告2箇所│    │  ✅ テスト済み   │
└─────────────────┘    └─────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐    ┌─────────────────┐
│  (テスト削除済み) │    │helloWorld...test│
│  軽量化優先設計   │    │  8テストケース   │
│                │    │  100%カバレッジ  │
└─────────────────┘    └─────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  tests/setup.ts │
         │  GAS APIモック   │
         │  ✅ 実装済み     │
         └─────────────────┘
```

### 型安全性確保パターン
```typescript
// 厳格な型チェック設定適用済み
interface StrictTypePolicy {
  unknown_over_any: true;      // any型最小限、unknown型優先
  strict_null_checks: true;    // null/undefined厳格チェック
  no_implicit_any: true;       // 暗黙的any禁止
  exact_optional_property_types: true; // オプショナル型厳密化
}
```

## 品質保証統合パターン

### 自動品質ゲートパターン
```bash
# 統合品質チェック（bun run check:all）
TypeScript型チェック → ESLintコード検査 → Prettierフォーマット → Vitest テスト
     ↓                    ↓                    ↓                  ↓
   ✅PASS               ✅PASS              ✅PASS            ✅100%カバレッジ
                                              ↓
                                        ビルド・デプロイ実行
```

### テストパターン体系
```typescript
// 1. 正常系テスト（Happy Path）
it('スプレッドシートのA1セルに"Hello, World."を正常に書き込む', () => {
  sayHelloWorldLogic();
  expect(mockSheet.setValue).toHaveBeenCalledWith('Hello, World.');
});

// 2. 異常系テスト（Error Cases）
it('スプレッドシートが取得できない場合のエラーハンドリング', () => {
  vi.mocked(SpreadsheetApp.getActiveSpreadsheet).mockImplementation(() => {
    throw new Error('Spreadsheet not found');
  });
  sayHelloWorldLogic();
  expect(Logger.log).toHaveBeenCalledWith('Error in sayHelloWorldLogic: Spreadsheet not found');
});

// 3. 境界値テスト（Edge Cases）
it('nullシートの場合はアラートを表示しない', () => {
  vi.mocked(mockSpreadsheet.getSheets).mockReturnValue([null]);
  sayHelloWorldLogic();
  expect(mockUi.alert).not.toHaveBeenCalled();
});

// 4. 統合テスト（Integration Tests）
it('正常フローの統合テスト', () => {
  sayHelloWorldLogic();
  expect(SpreadsheetApp.getActiveSpreadsheet).toHaveBeenCalled();
  expect(mockSheet.setValue).toHaveBeenCalledWith('Hello, World.');
  expect(mockUi.alert).toHaveBeenCalledWith('成功', '...', ButtonSet.OK);
});
```

## 拡張性・保守性パターン

### 新機能追加時の標準フロー
```typescript
// 1. TDD: テストファイル作成（例: newFeature.test.ts）
describe('newFeature', () => {
  it('should implement new functionality', () => {
    // テスト先行記述
  });
});

// 2. 実装: 機能ファイル作成（例: newFeature.ts）
export function newFeature(): void {
  // 実装
}

// 3. 統合: main.tsに登録
import { newFeature } from './newFeature';
(globalThis as unknown as Record<string, unknown>).newFeature = newFeature;

// 4. 品質確認: 100%カバレッジ維持
bun run check:all  // 自動品質ゲート通過必須
```

### 技術負債防止パターン
- ✅ **テストファースト**: 実装前にテスト記述
- ✅ **型安全性**: 厳格TypeScript設定
- ✅ **自動品質チェック**: push前必須ゲート
- ✅ **継続的リファクタリング**: テストによる安全保証
- ✅ **ドキュメント駆動**: コード変更時の即座更新