# clasp-on-bun

## Setup

### モジュールインストール
`bun install`

### Google Apps Script API を ON に
https://script.google.com/home/usersettings

## claspの実行

### 1. clasp login w/SSO
- `bunx clasp login`
    - アカウントが紐づく

### 2. ビルド
- `bun run build`
    - 実態: `bun build ./src/main.ts --outdir ./dist`
- `srs` のTSファイルがbundlerにより `dist` にトランスパイルされる

### 3. Push
- `bun run push`
    - 実態: `bun run typecheck && bun run build && bunx clasp push -f`
- 型チェックとビルド実行
- AppsScriptへトランスパイル済みスクリプトのアップロード
- これによりブラウザ側ツールで確認できるスクリプトも置き換わる
- ただし差分アップロード等は行わず、まるっと全体が置き換わるので注意

### 4. Spreadsheetへのマクロのインポート
- **マクロのインポートはブラウザから手動での対応が必要**
- claspからインポートを可能にするコマンドは存在しない
    - `appsscript.json` マニフェストファイルで `macros` を定義すれば、似たような事はできるらしい、、、が

---

### claspのDeploy/Versionの必要性に関して
Spreadsheetの操作に限定するのであれば、Pushのみを用いて常にヘッドデプロイメントのみを更新し、バージョン管理はGithubで行う、という方法で大きな問題はない。
以下、併用におけるメリット、デメリットをまとめておく。

### Deployの必要性

- Spreadsheet操作のみが目的で、**小規模かつリスクの低い開発であれば**、ヘッドデプロイメントとPush中心の運用も**機能的には可能だが、バージョン管理やロールバックの観点からは限定的**
- Deployは、**目的別に複数の公開設定（デプロイメント）を持つことを可能にし、各デプロイメントが参照するコードのバージョンを管理・切り替える**機能
- 問題発生時、特定のデプロイメントが参照するバージョンを過去の安定バージョンに戻すことでリカバリーが可能
- Webアプリ/API/ライブラリ/アドオンなど、**外部に機能を公開・提供する場合には不可欠**

### Versionの必要性

- コードとマニフェストの**静的なスナップショット**で、Gitのコミットやタグに類似
- Deploy操作（特に新しいリリース時）では、多くの場合**新しいVersionが作成**され、それがDeploymentに紐付けられる
- GitHubでソース管理を行っていても、**Apps Scriptの実行環境における「公式なリリースポイント」や「安定版の記録」としてApps Script側のVersionも依然として有用**。 特に公開機能を持つ場合は、どのコードが実際にデプロイされているかの基準となる。完全に不要と考えるのはリスクがある

## claspのセットアップ

### .claspignore の設定
- ファイルが存在しなければデフォルト設定が反映されるっぽい
- が、一応作っておいておく（内容はデフォルトのもの）

### .clasp.json の設定
- scriptId
    - 紐づけるスクリプトのID（ブラウザでスクリプト開いてURLから取得）
    - `bunx clasp open-script` でブラウザで開けるようになる
- rootDir
    - ビルド先のディレクトリ
- projectID
    - GCPプロジェクトとの紐づけ
        - AI系使えたり、ロギングが拡充したりと、メリットがあれば
    - スクリプトの設定画面からブロジェクト番号を登録できる
        - が、OAuth同意画面を構成しておく必要がある（流れに従えばOK）
    - 今回は `cto-dev` プロジェクトをアサインしてみた
    - project-id-853188425177
- scriptExtensions
    - Apps Script プロジェクト内のローカルスクリプトファイルのファイル拡張子を指定
- htmlExtensions
    - Apps Script プロジェクト内のローカルHTML ファイルのファイル拡張子を指定
- filePushOrder
    - 最初にプッシュするファイルを指定
    - これは実行順序に依存するスクリプトに便利
    - 他のすべてのファイルは、このファイルリストの後に、名前順にプッシュされる
        - ファイルパスは.clasp.jsonを含むディレクトリからの相対パスであることに注意
        - rootDirも設定されている場合そのパスも含める必要がある
- skipSubdirectories
    - .claspignore ファイルが存在しない場合、サブディレクトリを無視（後方互換性維持）
    - Clasp にサブディレクトリを無視させる必要があり、.claspignore ファイルを作成したくない場合は、このオプションを true に設定する

## clasp/ Reference

### グローバルオプション
- `--user <name>`: 指定されたキーに保存されている資格情報を使用
    - 省略した場合は、defaultユーザーが使用される
- `--adc`: 環境のアプリケーションのデフォルト認証情報を使用
    - CIワークフローにおけるサービスアカウントのサポートを目的としている
- `--project <file>`: `.clasp.json` 以外のファイルからプロジェクト設定を読み取る
    - 複数のデプロイメントターゲットをサポートすることを目的としている
- `--auth <file>`: (非推奨) `.clasprc.json` 以外のファイルから資格情報を読み取る
    - --user複数の承認済みアカウントを管理するには、このオプションを使用
- `--ignore <file>`: `.claspignore` 以外のファイルから無視パターンを読み取る

### ログインオプション
- `--no-localhost`: ローカル サーバーを実行せず、代わりに手動でコードを入力
- `--creds <file>`: clasp runで使用されているカスタム認証情報を使用
    - `.clasprc.json` ファイルを現在の作業ディレクトリに保存
- `--redirect-port <port>`: ログインプロセス中にローカルリダイレクトサーバーのカスタムポートを指定
    - 特定のポートが必要な環境で役立つ
- 例
    - `bunx clasp login`
    - `bunx clasp login --no-localhost`
    - `bunx clasp login --user test-user --creds client_secret.json`
    - `bunx clasp login --redirect-port 37473`

## clasp/ コマンド

### 新規ファイル作成
- `bunx clasp create-script`
    - `--type [standalone/docs/sheets etc...]`:デフォルトは `standalone` で、指定すると添付される新しいアドオンが作成される
        - **--parentIdが指定されている場合、この値は無視される**
    - `--title <title>`: プロジェクトのタイトル
    - `--rootDir <dir>`: claspがプロジェクトファイルを保存するローカルディレクトリ
        - `.clasp.json` で指定されている場合は（恐らく）不要
    - `--parentId <id>`: プロジェクトの親 ID
        - 作成されたスクリプトプロジェクトがバインドされる親ファイルのドライブID
        - 通常はGoogleドキュメント、Googleスプレッドシート、Googleフォーム、またはGoogleスライドのファイルのID
        - 設定されていない場合は、スタンドアロンのスクリプトプロジェクトが作成される
        - すなわち `https://docs.google.com/presentation/d/{id}/edit`
- サンプル
    - `bunx clasp create-script --title "My Script" --parentId "1D_Gxyv*****************************NXO7o" --rootDir ./dist`

### 既存ファイルのクローン
- `bunx clasp clone-script [scriptId/scriptURL]`
    - `scriptId | scriptURL`:複製するスクリプトIDまたはスクリプトURL
    - `--versionNumber <number>`: 複製するスクリプトのバージョン
    - `--rootDir <dir>`: claspがプロジェクトファイルを保存するローカルディレクトリ
        - 指定されていない場合は、現在のディレクトリがデフォルトになる
- サンプル
    - `bunx clasp clone-script "15ImUCpyi1Jsd8yF8Z6wey_7cw793CymWTLxOqwMka3P1CzE5hQun6qiC"`
    - `bunx clasp clone-script "https://script.google.com/d/15ImUCpyi1Jsd8yF8Z6wey_7cw793CymWTLxOqwMka3P1CzE5hQun6qiC/edit"`
    - `bunx clasp clone-script "15ImUCpyi1Jsd8yF8Z6wey_7cw793CymWTLxOqwMka3P1CzE5hQun6qiC" --rootDir ./src`

### Pull
- 提供されたスクリプト ID または保存されたスクリプト ID からプロジェクトを取得
- Apps Script プロジェクトでローカル ファイルを更新します
- サンプル
    - `bunx clasp pull`
    - `bunx clasp pull --versionNumber 23`
- オプション
    - `--versionNumber <number>`: 取得するプロジェクトのバージョン番号

### Push
- すべてのローカル ファイルを script.google.com に強制的に書き込
    - Google scriptsAPIは現在、アトミック操作やファイル単位の操作をサポートしていません
    - そのため、**このpushコマンドは常にオンラインプロジェクトのコンテンツ全体をプッシュ対象のファイルに置き換えます**
- サンプル
    - `bunx clasp push`
    - `bunx clasp push -f`
    - `bunx clasp push --watch`
- オプション
    - `-f --force`: リモート マニフェストを強制的に上書きします。
    - `-w --watch`: ローカルファイルの変更を監視します。数秒ごとにファイルをプッシュします。

### Status
- Push時にサーバーに書き込まれるファイルを一覧表示
- サンプル
    - `bunx clasp show-file-status`
    - `bunx clasp show-file-status --json`
- オプション
    `--json`: ステータスを JSON 形式で表示します。

### Open
- 現在のディレクトリのclaspプロジェクトと関連リソースを開く
- サンプル
    - `bunx clasp open-script`
    - `bunx clasp open-web-app`
    - `bunx clasp open-container`
    - `bunx clasp open-credentials-setup`

### Deployments
- スクリプトのデプロイメントを一覧表示
- サンプル
    - `bunx clasp list-deployments`

### Deploy
- バージョンを作成し、スクリプトをデプロイ
    - デプロイIDとデプロイのバージョンが返される
    - ウェブアプリの場合、各デプロイメントには固有のURLが割り当てられる
    - 既存のデプロイメントを更新または再デプロイするには、デプロイメントIDを指定する
- サンプル
    - `bunx clasp create-deployment`（新しいデプロイメントと新しいバージョンを作成）
    - `bunx clasp create-deployment --versionNumber 4`（新しいデプロイメントを作成）
    - `bunx clasp create-deployment --description "Updates sidebar logo."`（説明付きで展開）
    - `bunx clasp create-deployment --deploymentId abcd1234`（再デプロイして新しいバージョンを作成）
    - `bunx clasp create-deployment -V 7 -d "Updates sidebar logo." -i abdc1234`
- オプション
    - `-V <version> --versionNumber <version>`: デプロイするプロジェクトのバージョン
    - `-d <description> --description <description>`: デプロイメントの説明
    - `-i <id> --deploymentId <id>`: 再デプロイするデプロイメントID

### Redeploy
- 既存のデプロイメントを更新（`create-deployment -i id`と同じ）
- サンプル
    - `bunx clasp update-deployment abcd1234`（再デプロイして新しいバージョンを作成）
- オプション
    - `-V <version> --versionNumber <version>`: デプロイするプロジェクトのバージョン
    - `-d <description> --description <description>`: デプロイメントの説明

### Undeploy
- スクリプトのデプロイメントをアンデプロイ
- サンプル
    - `bunx clasp delete-deployment`(展開を要求、または 1 つだけの場合は削除)
    - `bunx clasp delete-deployment "123"`
    - `bunx clasp delete-deployment --all`
- オプション
    - `[deploymentId]`: オプションのデプロイメント ID。
    - `-a --all`: すべてのデプロイメントをアンデプロイします。

### Version -> Gitで管理すれば不要
- スクリプトの変更不可能なバージョンを作成
- サンプル
    - `bunx clasp create-version`
    - `bunx clasp create-version "Bump the version."`
- オプション
    - `description: description` スクリプト バージョンの説明。

### Versions
- スクリプトのバージョンを一覧表示します。
- サンプル
    - `bunx clasp list-versions`

### List
- 最新の Apps Script プロジェクトを一覧表示します。
- サンプル
    - `bunx clasp list-scripts: プリントhelloworld1 – xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx ...`

## clasp/ 高度なコマンド

### Log
- 最新のStackDriver ログを出力します
    - これらは`console.log`からのログであり、`Logger.log`からのログではありません
- サンプル
    - `bunx clasp logs`
    - `bunx clasp logs --json`
    - `bunx clasp logs --watch`
    - `bunx clasp logs --simplified`
- オプション
    `--json`: ログをjson形式で出力します。
    `--watch`: 5 秒ごとに最新のログを取得します。
    `--simplified`: ログからタイムスタンプを削除します。

### Run
- ローカルの開発環境からリモートのGoogle Apps Scriptプロジェクトにデプロイされている関数を実行
- 主なメリット
    - Apps Scriptエディタを開かずに、ローカルのターミナルから動作確認やテストができる
    - コードをプッシュした後に自動テストとして特定の関数を実行する
    - スクリプト実行の自動化
- サンプル
    - `bunx clasp run-function 'sendEmail'`
    - `bunx clasp run-function 'addOptions' -p '["string", 123, {"test": "for"}, true]'`
- オプション
    `<functionName>`: 実行するスクリプト内の関数の名前。
    `--nondev`: true の場合、関数を非 devMode で実行します。
    `-p <paramString> --params <paramString>`: 関数に渡すパラメータのJSON文字列配列

## clasp/ Other Google APIs

### List APIs
- 高度なサービスとして有効にできる Google API を一覧表示します。
- サンプル
    - `bunx clasp list-apis`

### Enable/Disable APIs
- Google Cloud プロジェクトで API を有効または無効にします
    - これらの API は、GmailApp などのサービスや BigQuery などの高度なサービスを通じて使用る
    - API名は `bunx clasp apis list` を使用して見つけることができる
- サンプル
    - `bunx clasp enable-api drive`
    - `bunx disable-api drive`

### Open APIs Console
- API アクセスを表示および管理できる Google Cloud Console を開く
- サンプル
    - `bunx clasp open-api-console`

### Help
- ヘルプ機能を表示します。
- サンプル
    - `bunx clasp`
    - `bunx clasp help`

---

## Bun導入のメリット
- モジュールのインストールが高速
- TypeScriptにデフォルト対応（追加の設定やトランスパイラが不要）
    - 不要：typescript @types/google-apps-script
- バンドラーも標準装備（複数のtsファイルを一つにパッケージング）
    - 不要：rollup関連
- 処理速度においては公式が言うほど早くはない（ほぼ同等）
- エッジコンピューティングにおいて優位性がありそう

## 参考
- bun install
    - https://bun.sh/docs/installation

- bun TypeScript関連
    - https://bun.sh/docs/typescript
- clasp install
    - https://github.com/google/clasp?tab=readme-ov-file
- BunでGoogle Apps Script(GAS)開発
    - https://zenn.dev/ncukondo/articles/aa8625a2de1632
- clasp導入で既存のGAS開発を効率化！手順とメリットを徹底解説
    - https://sqripts.com/2025/03/13/104667/
- Node.js と Deno と Bun のどれを使えばいいのか
    - https://qiita.com/access3151fq/items/2466126b612fad1c084a
- Bunについて
    - https://qiita.com/takahashi-yoji/items/9e08d14a90a8f29b3c81
