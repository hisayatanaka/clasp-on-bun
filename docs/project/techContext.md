# 技術コンテキスト

## 使用技術スタック

### ランタイム・ツールチェーン
- **Bun v1.2.13**: JavaScript/TypeScriptランタイム
  - 役割: 開発サーバー、パッケージマネージャー、高速ビルドツール
  - 特徴: TypeScript標準サポート、内蔵バンドラー、npm互換
  - 性能: ~2-3秒でのビルド、高速パッケージインストール

- **TypeScript ^5.8.3**: 静的型付けJavaScript
  - 設定: 厳格モード（strict: true）、ESNext対応、noEmit
  - 型チェック: Google Apps Script API完全対応
  - 利点: コンパイル時エラー検出、IntelliSense、リファクタリング支援

### 品質管理ツール
- **ESLint 9.0系**: コード品質・スタイル検査
  - 設定: Flat Config採用、TypeScript専用ルール
  - カバー範囲: 型安全性、コーディング規約、Google Apps Script環境
  - 統合: Prettier連携、テストファイル専用ルール

- **Prettier 3.0系**: 自動コードフォーマッター
  - 設定: 2スペースインデント、セミコロン必須、シングルクォート
  - 適用範囲: TypeScript、設定ファイル（ドキュメント除外）

### テストフレームワーク
- **Vitest 2.0系**: 高速テストランナー
  - 特徴: Jest互換API、ESM標準サポート、TypeScript内蔵
  - 環境: jsdom（ブラウザAPI模擬）
  - カバレッジ: v8プロバイダー、100%達成
  - UI: ブラウザベースダッシュボード (`bun run test:ui`)

- **テストモック**: Google Apps Script API完全モック
  - 対象: SpreadsheetApp、Logger、PropertiesService
  - 設計: 型安全、メソッドチェーン対応、テストヘルパー関数

### デプロイメント
- **clasp ^3.0.4-alpha**: Google Apps Script CLI
  - 機能: push/pull、バージョン管理、デプロイメント作成
  - 設定: `.clasp.json`（プロジェクト）、`.claspignore`（除外ファイル）
  - 制約: 全体置換デプロイ、手動マクロ登録

### 型定義・依存関係
- **@types/google-apps-script ^1.0.99**: GAS API型定義
- **@types/bun latest**: Bunランタイム型定義
- **@vitest/coverage-v8 ^2.0.0**: カバレッジ測定
- **jsdom ^25.0.0**: ブラウザ環境シミュレーション

## 開発セットアップ

### 前提条件
```bash
# 1. Bunインストール（macOS/Linux）
curl -fsSL https://bun.sh/install | bash

# 2. Google Apps Script API有効化
# https://script.google.com/home/usersettings でON

# 3. claspログイン（Google認証）
bunx clasp login
```

### 開発フロー（品質保証統合）
```bash
# 依存関係インストール
bun install

# 品質チェック統合コマンド
bun run check:all    # 型+Lint+フォーマット+テスト

# 個別実行
bun run typecheck    # TypeScript型チェック
bun run lint         # ESLintコード検査
bun run test:run     # テスト実行
bun run test:coverage # カバレッジ測定

# ビルド・デプロイ
bun run build        # TypeScript→JavaScript変換
bun run push         # 品質チェック→ビルド→GAS展開
```

## プロジェクト設定詳細

### tsconfig.json（厳格設定）
```json
{
  "include": ["**/*.ts"],
  "compilerOptions": {
    "lib": ["ESNext"],
    "target": "ESNext",
    "module": "ESNext", 
    "types": ["google-apps-script"],
    "strict": true,
    "noEmit": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### package.json 主要スクリプト
```json
{
  "scripts": {
    "check:all": "bun run check && bun run test:run",
    "push": "bun run check:all && bun run build && bunx clasp push -f",
    "test:ui": "bunx vitest --ui",
    "test:coverage": "bunx vitest run --coverage"
  }
}
```

### vitest.config.ts（テスト環境）
- **環境**: jsdom（Google Apps Script APIモック）
- **カバレッジ**: 100%閾値設定、HTML/lcovレポート
- **セットアップ**: `tests/setup.ts`でGASモック初期化

## 技術的制約と対応策

### Google Apps Script制約
| 制約項目 | 制限値 | 対応策 |
|---------|--------|--------|
| **実行時間** | 6分/実行 | バッチ処理分割、プログレス管理 |
| **実行回数** | 20,000回/日 | 効率的API呼び出し、キャッシュ活用 |
| **メモリ** | 制限あり | 大量データ処理の分割実行 |
| **ネットワーク** | 外部API制限 | UrlFetchApp使用、レート制限対応 |

### 開発環境制約
- **GAS実行環境**: ES5相当（Bunバンドルで解決）
- **import/export**: GASネイティブ未対応（バンドラーで解決）
- **Node.js API**: 使用不可（GAS専用API使用）
- **デバッグ**: ローカル不可（テスト環境で代替）

### clasp制約と回避策
- **差分デプロイ**: 未対応 → Git履歴で変更管理
- **マクロ登録**: 手動必須 → ドキュメント化で運用カバー
- **型チェック**: clasp側未対応 → ローカル型チェック強化

## 依存関係戦略

### 現在の構成（最小・最適化）
```json
{
  "devDependencies": {
    "typescript": "型チェック・IntelliSense",
    "@types/google-apps-script": "GAS API型定義",
    "@google/clasp": "デプロイツール",
    "vitest": "テストフレームワーク", 
    "eslint": "コード品質管理",
    "prettier": "コードフォーマット"
  },
  "dependencies": {} // ランタイム依存ゼロ
}
```

### 拡張候補ライブラリ（Phase 3-4対象）
- **ユーティリティ**: Lodash（GAS互換版）、date-fns（軽量）
- **バリデーション**: Zod（型安全スキーマ）
- **HTTP**: 型安全UrlFetchAppラッパー
- **ログ**: 構造化ログライブラリ
- **型定義**: カスタムGAS型拡張（types/ディレクトリ活用）

## セキュリティ・コンプライアンス

### 認証情報管理
```bash
# Git管理除外（必須）
echo ".clasprc.json" >> .gitignore

# 環境変数（GAS）
PropertiesService.getScriptProperties().setProperty('API_KEY', 'value')

# 機密情報検出
git-secrets --scan  # コミット前チェック
```

### コード保護方針
- **機密情報**: ハードコーディング全面禁止
- **ログ出力**: 認証情報・個人情報除外
- **エラーメッセージ**: 内部構造情報の漏洩防止
- **型安全性**: unknown型使用、any型最小限

### 監査・品質保証
- **自動チェック**: push前品質ゲート必須通過
- **テストカバレッジ**: 100%維持、新機能追加時更新
- **依存関係監査**: セキュリティ脆弱性定期チェック
- **コードレビュー**: 型安全性・セキュリティ観点

## パフォーマンス指標・目標

### 現在の性能
| 指標 | 現在値 | 目標値 | 状態 |
|------|--------|--------|------|
| **テスト実行** | ~616ms | <300ms | 🟡 改善余地 |
| **ビルド時間** | ~2-3秒 | <2秒 | 🟢 良好 |
| **型チェック** | ~1秒 | <1秒 | 🟢 良好 |
| **バンドルサイズ** | 0.97KB | <2KB | 🟢 軽量 |
| **カバレッジ計算** | ~200ms | <100ms | 🟡 改善余地 |
| **品質チェック統合** | 型+Lint+テスト一括 | - | 🟢 自動化完了 |

### 最適化方針
- **テスト並列化**: 複数ファイル同時実行
- **型チェック最適化**: 増分チェック活用
- **バンドル最適化**: tree-shaking、圧縮設定
- **モック軽量化**: 必要最小限のAPI模擬