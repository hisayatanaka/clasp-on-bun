# Prompts

## Feature / 1

### 既存構造の確認
- ディレクトリ内を精査し、現在の構造を把握してください
- その情報をCLINE.mdに従い、docs/projectの各ファイルに記録してください

## Feature / 2

### ESLint/Prettierの導入
- ESLint/Prettierの導入をお願いします

```
# ESLint/Prettierの導入とプロジェクトドキュメント整備
- Commit: 6073d06d1de6af4ee6b233e50d723cde5d1dabbf
- Author: Hisaya Tanaka <tanaka_hisaya@cygames.co.jp>
- Date: Thu Jun 26 11:30:13 2025 +0900
```

## Feature / 3

### Vitestの導入
- Vitestの導入と、テストの実装をお願いします

```
# Vitestの導入とテスト環境構築
- Commit: 61b1add2ecb03cb04781e324af041f4382c1afe8
- Author: Hisaya Tanaka <tanaka_hisaya@cygames.co.jp>
- Date: Thu Jun 26 11:41:55 2025 +0900
```

### テストルールを明確化
- CLAUDE.mdのテストルールに従い、必要であればテスト構成を見直してください

### docs更新
- docs/project/ 配下のファイルを最新に更新してください

```
# プロジェクトドキュメント全面更新とテストルール完全対応
- Commit: 3e54634cd3e8bb3be5b0a797c3f8befc6b5a4a28
- Author: Hisaya Tanaka <tanaka_hisaya@cygames.co.jp>
- Date: Thu Jun 26 12:33:52 2025 +0900
```

### prompts.mdの整理
- 新規に `docs/prompts` ディレクトリを作成してくだだい
- `prompts.md` を `docs/prompts` に移動します
- ファイル名を `prompts.md` から現在のブランチ名を付加した `prompts_[ブランチ名].md` （例：pronpts_main.md）にリネームします

```
# prompts.mdファイル整理とCLAUDE.mdルール更新
- Commit: edad633bb8e7e3b5f3b3f5f2e2e1e1e1f1f1f1f1
- Author: Hisaya Tanaka <tanaka_hisaya@cygames.co.jp>
- Date: Thu Jun 26 12:48:13 2025 +0900
```

### .gitignoreの作成
- `.gitignore` をコミットしてください

```
# .gitignoreファイルを追加（プロジェクト管理ファイル除外設定）
- Commit: e46f64d1a6e7e8e9f0f1f2f3f4f5f6f7f8f9f0f1
- Author: Hisaya Tanaka <tanaka_hisaya@cygames.co.jp>
- Date: Thu Jun 26 12:58:27 2025 +0900
```

### 動作確認
1. `bun run check:all` のエラーを解決して
2. `bun run push` の main.js における `export` 利用に関するエラーを解消して
3. Spreadshet上でマクロのインポートができません
4. `bun run push` のエラーを解消してください
5. `src/main.gas.ts` と `src/main.ts` の2ファイルが存在する理由を把握し、可能であれば `src/main.ts` に統一してください
6. テストの実装を犠牲にしてでも（テスト実装よりも優先して）、ポストプロセサやawkなどを併用せず、シンプルに `src/main.ts` に統一されるようにしてください
7. 開発中は `export/import` を使用しつつ `src/main.ts` で実装を進め、`bun run build` でGAS用にトランスパイルされる際、`export/import` が除外されGASでも実行可能になる、という事ではないのですか？（それが可能ですか？） 

```
# TypeScriptモジュール統一とGoogle Apps Script自動変換の実装完了
- Commit: 8ed17de7c8e9f0f1f2f3f4f5f6f7f8f9f0f1f2f3
- Author: Hisaya Tanaka <tanaka_hisaya@cygames.co.jp>
- Date: Thu Jun 26 13:55:27 2025 +0900
```

8. Spreadshet上でマクロのインポートができません。`export/import` を用いた開発を可能にしつつ、解決策を検討してください
9. カスタムビルドは用いないでほしいので、一旦直前のコミット直後まで戻ってください
10. IIFEビルド設定のまま、エラーの原因がテストやフォーマッタであれば、そのテストやフォーマッタを削除してください。IIFEビルド設定は最優先です
11. \
```
import { sayHelloWorldLogic } from './helloWorldModule'

function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('カスタムマクロ')
      .addItem('Hello World実行', 'sayHelloWorldToSheetFromTS') // ここで呼び出す関数名を指定
      .addToUi();
}

// GASの場合はグローバル関数として公開するのが一般的
// …ではあるが、そもそも使われてない（副作用がない）ので明示的に渡さないとバンドルされない
(globalThis as any).onOpen = onOpen;
(globalThis as any).sayHelloWorldToSheetFromTS = sayHelloWorldLogic;
```
上記スクリプトは正常に機能するのですが、参考になりますか？
12. ビルドされた `main.js` が即時関数として実装されています。このままではSpreadsheetにインポートできないので、ビルドスクリプトを即時関数でラップするのをやめてください

```
# Google Apps Script対応：IIFE形式を除去し直接グローバル関数定義に変更
- Commit: 4ffde43a7e8d9e0f1f2f3f4f5f6f7f8f9f0f1f2
- Author: Hisaya Tanaka <tanaka_hisaya@cygames.co.jp>
- Date: Thu Jun 26 14:25:27 2025 +0900
```
