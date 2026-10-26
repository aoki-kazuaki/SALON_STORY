# コマンド集

[← 設計資料一覧](../README.md)

開発時に使うコマンドの一覧です。特に記載がなければ、プロジェクトのルートディレクトリで実行します。

## 1. はじめての起動 (環境構築)

前提: Node.js 24 以上、Docker Desktop が起動していること

```bash
npm install            # 依存パッケージのインストール (Prisma Client も自動生成される)
cp .env.example .env   # 環境変数ファイルを作成 (BETTER_AUTH_SECRET は任意の長いランダム文字列に変更)
npm run setup          # PostgreSQL・MinIO を起動し、DB テーブルを作成 (マイグレーション適用)
npm run dev            # 開発サーバーを起動 → http://localhost:3000
```

E2E テストを実行する場合は、初回のみ Chromium をダウンロードします。

```bash
npx playwright install chromium
```

## 2. 毎日の開発

| やりたいこと | コマンド | 補足 |
| --- | --- | --- |
| DB・ストレージを起動 | `npm run db:up` | Docker の PostgreSQL (5433)・MinIO (9000) を起動 |
| 開発サーバーを起動 | `npm run dev` | http://localhost:3000 |
| DB・ストレージを停止 | `npm run db:down` | データは保持される |

## 3. 品質チェック (CI と同じ内容をローカルで)

PR を出す前に実行しておくと、CI で落ちることを防げます。

| チェック | コマンド | 内容 |
| --- | --- | --- |
| ESLint | `npm run lint` | コードの静的解析 |
| Prettier | `npm run format:check` | 整形ルールの確認 (`npm run format` で自動整形) |
| 型チェック | `npm run typecheck` | TypeScript の型エラーの検出 |
| 単体テスト | `npm test` | Vitest |
| 単体テスト + カバレッジ | `npm run test:coverage` | 90% 未満で失敗。レポートは `coverage/index.html` |
| 本番ビルド | `npm run build` | |
| 脆弱性チェック | `npm audit --audit-level=high` | 深刻度 High 以上で失敗 |
| ライセンスチェック | `npm run license:check` | 許可リスト外のライセンスで失敗 ([詳細](ci.md#ライセンスチェック)) |

まとめて実行する場合:

```bash
npm run lint && npm run format:check && npm run typecheck && npm run test:coverage && npm run build
```

## 4. テスト

| やりたいこと | コマンド | 補足 |
| --- | --- | --- |
| 単体テストを実行 | `npm test` | |
| 単体テストを監視モードで実行 | `npm run test:watch` | ファイル保存のたびに再実行 |
| 特定のファイルだけ実行 | `npx vitest run src/utils/date.test.ts` | |
| カバレッジを表示 | `npm run test:coverage` | |
| E2E テストを実行 | `npm run test:e2e` | 専用 Docker を自動で起動・破棄 (約4分) |
| E2E をブラウザ画面付きで実行 | `npm run test:e2e:headed` | 操作を0.5秒ずつ遅らせて表示。速さは `E2E_SLOW_MO` (ミリ秒) で変更 |
| E2E をステップ実行 | `npm run test:e2e -- --ui` / `npm run test:e2e -- --debug` | 途中のテストだけ選ぶと失敗する (前のシナリオが前提のため) |
| E2E のレポートを開く | `npm run test:e2e:report` | スクリーンショットは `e2e/screenshots/` |
| E2E のビルドを省略 | `E2E_SKIP_BUILD=true npm run test:e2e` | テストコードだけ変更したとき (PowerShell は `$env:E2E_SKIP_BUILD="true"; npm run test:e2e`) |
| Storybook を起動 | `npm run storybook` | http://localhost:6006 |

## 5. データベース (Prisma)

| やりたいこと | コマンド | 補足 |
| --- | --- | --- |
| DB の中身をブラウザで確認 | `npm run db:studio` | Prisma Studio |
| テーブル定義を変更した後 | `npm run db:migrate` | `prisma/schema.prisma` の変更からマイグレーションを作成・適用。名前を聞かれるので内容が分かる英語名を入力 |
| Prisma Client を再生成 | `npm run db:generate` | 型が古いときなど |
| マイグレーションを適用のみ | `npx prisma migrate deploy` | 本番と同じ適用方法 (新規作成はしない) |
| DB を初期化 (全データ削除) | `npx prisma migrate reset` | ⚠ ローカル DB のデータがすべて消える |
| ユーザーのパスワードを再設定 | `npm run user:reset-password -- <ログインIDまたはメール>` | ローカル DB 専用。パスワードを省略すると乱数を生成して表示 |

テーブル定義を変更したら、[テーブル定義書](../db/README.md) も更新してください。

## 6. Docker

| やりたいこと | コマンド | 補足 |
| --- | --- | --- |
| コンテナの状態を確認 | `docker compose ps` | |
| ログを確認 | `docker compose logs -f postgres` | `minio` も同様 |
| DB に SQL で接続 | `docker compose exec postgres psql -U salon -d salon_story` | カラム名はダブルクォートで囲む (例: `SELECT "userId" FROM schedule_memo;`) |
| データごと削除して作り直す | `docker compose down -v` → `npm run setup` | ⚠ ローカルの DB・画像がすべて消える |
| E2E 用の Docker を手動で破棄 | `docker compose -f docker-compose.e2e.yml down -v` | E2E が途中で止まって残った場合 |

| サービス | URL / 接続先 | ID / パスワード |
| --- | --- | --- |
| アプリ (開発サーバー) | http://localhost:3000 | 新規登録したアカウント |
| PostgreSQL | `localhost:5433` / DB 名 `salon_story` | `salon` / `salon` |
| MinIO (S3 互換) | http://localhost:9000 | `minioadmin` / `minioadmin` |
| MinIO 管理画面 | http://localhost:9001 | `minioadmin` / `minioadmin` |
| Prisma Studio | http://localhost:5555 | - |
| Storybook | http://localhost:6006 | - |
| E2E 用アプリ | http://localhost:3100 (PostgreSQL 5434 / MinIO 9010) | テスト実行中のみ |

## 7. Git / ブランチ運用

`main` と `develop` は保護されており、直接 push できません ([詳細](ci.md#ブランチ保護ルール))。

```bash
git switch develop && git pull          # develop を最新にする
git switch -c feature/〇〇               # 作業ブランチを作る
# ...実装・コミット...
git push -u origin feature/〇〇          # push して GitHub で develop 宛ての PR を作成
```

- コミット時に Husky + lint-staged が、ステージした `.ts` / `.tsx` に Prettier と ESLint (`--fix`)、`.css` に Prettier を自動実行します。
- PR の CI (品質チェック・脆弱性チェック) がすべて成功するとマージできます。
- リリースは `develop` → `main` の PR で行います。

## 8. 本番 (Vercel)

| やりたいこと | コマンド | 補足 |
| --- | --- | --- |
| 本番用ビルド (Vercel が実行) | `npm run vercel-build` | マイグレーション適用 → ビルド。`DIRECT_DATABASE_URL` が必要 |
| 本番ビルドをローカルで起動 | `npm run build && npm start` | |

本番の環境変数は `.env.example` の「本番」コメントを参照してください。
