# サロン空き状況ストーリーズジェネレーター

美容院の予約空き枠を登録し、Instagram ストーリーズ (9:16) 用の告知画像をプレビュー・全画面表示 (端末スクショ) できる Web アプリです。

## 必要なもの

- Node.js 24 以上
- Docker Desktop (PostgreSQL と MinIO をローカルで起動します)

## はじめての起動

```bash
npm install          # 依存パッケージのインストール (Prisma Client も自動生成)
cp .env.example .env # 環境変数ファイルを作成 (BETTER_AUTH_SECRET は任意の長いランダム文字列に変更)
npm run setup        # PostgreSQL・MinIO を起動し、DB テーブルを作成
npm run dev          # http://localhost:3000 で起動
```

2回目以降は Docker Desktop を起動したうえで `npm run db:up` → `npm run dev` で起動できます。

## 最初のアカウント

1. http://localhost:3000/register から新規登録します。
2. **最初に登録したユーザーは自動的に管理者**になります (承認者が必要なため)。
3. `.env` の `AUTH_SKIP_APPROVAL="true"` の間は、2人目以降も管理者承認なしで即ログインできます (ローカル専用)。
   本番環境では必ず `"false"` にしてください。承認待ちユーザーは管理者メニュー (ヘッダーの盾アイコン) から承認します。

## ローカル環境でのメール

`SMTP_HOST` が空の場合、メールは送信されず **管理者メニューの「ローカル送信メール」** とサーバーログに表示されます。
パスワード再設定 URL もここから開けます。

## ローカルでパスワードを忘れたとき

```bash
npm run user:reset-password -- <ログインIDまたはメールアドレス>             # ルールを満たす乱数PWを生成して表示
npm run user:reset-password -- <ログインIDまたはメールアドレス> NewPass123  # 任意のPWを指定
```

DB を直接書き換えるため、管理者承認やメール送信は経由しません (`DATABASE_URL` の DB が対象。本番 DB には使わないでください)。

## 本番デプロイ (無料枠中心の構成)

| 役割 | サービス | 備考 |
| --- | --- | --- |
| ホスティング | Vercel (Hobby) | Hobby プランは非商用利用のみ。実店舗で運用する場合は Pro が必要 |
| DB | Neon (Free) | Vercel Marketplace から作成すると環境変数が自動連携される |
| 画像 | AWS S3 | 背景画像は最大4枚 × 約1MB (アップロード時に自動圧縮) のため、無料枠終了後も月数円程度 |
| メール | Gmail SMTP | 2段階認証を有効にして「アプリ パスワード」を発行 |

1. Neon でプロジェクトを作成し、Pooled / Direct の接続URLを `DATABASE_URL` / `DIRECT_DATABASE_URL` に設定します。
2. S3 バケット (パブリックアクセスはブロックのまま) と、そのバケットへの `s3:PutObject` / `s3:GetObject` / `s3:DeleteObject` のみ許可した IAM ユーザーを作成し、アクセスキーを設定します (`S3_ENDPOINT` は空)。
3. `.env.example` の「本番」コメントに従い、Vercel の Environment Variables に全項目を設定します (`AUTH_SKIP_APPROVAL="false"`)。
4. Vercel にデプロイすると `vercel-build` スクリプトでマイグレーション (`prisma migrate deploy`) → ビルドが実行されます。
5. 本番で**最初に登録したユーザーが管理者**になり、承認依頼メールは管理者のメールアドレス宛てに届きます。

## 設計資料

API仕様書・テーブル定義書・コマンド集・CI の説明は [docs/](docs/README.md) にあります。

## 主なコマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm test` | 単体テスト (Vitest) |
| `npm run test:e2e` | E2E シナリオテスト (Playwright、専用 Docker を自動で起動。詳細は [e2e/README.md](e2e/README.md)) |
| `npm run storybook` | コンポーネントカタログ (http://localhost:6006) |
| `npm run lint` / `npm run typecheck` | ESLint / 型チェック |
| `npm run db:studio` | DB の中身をブラウザで確認 (Prisma Studio) |
| `npm run user:reset-password -- <ID>` | ローカルDBのユーザーのパスワードを再設定 |
| `npm run db:migrate` | `prisma/schema.prisma` 変更後のマイグレーション作成 |
| `npm run db:down` | PostgreSQL・MinIO を停止 (データは保持) |

MinIO の管理画面は http://localhost:9001 (ID / PW: `minioadmin`) です。

## 補足

- ホスト PC の PostgreSQL と衝突しないよう、Docker の PostgreSQL は **5433** 番ポートで公開しています。
- Docker Hub の `minio/minio` は配布終了のため、Chainguard 配布の MinIO イメージを利用しています。バケットは初回アップロード時に自動作成されます。
- コミット時は Husky + lint-staged により Prettier と ESLint が自動実行されます。
