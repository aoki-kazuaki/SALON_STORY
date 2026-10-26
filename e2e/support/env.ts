// E2E テスト環境 (専用 Docker・専用ポート) の接続先・環境変数の定義

/** E2E 用アプリのポート (開発サーバーの 3000 と分離) */
export const E2E_APP_PORT: number = 3100;

/** E2E 用アプリのベースURL */
export const E2E_BASE_URL: string = `http://localhost:${E2E_APP_PORT}`;

/** E2E 用アプリを起動するときの環境変数 (ローカルの .env より優先される) */
export const E2E_SERVER_ENV: Record<string, string> = {
  /** E2E 専用 PostgreSQL (docker-compose.e2e.yml、ポート 5434) */
  DATABASE_URL: "postgresql://salon:salon@localhost:5434/salon_story_e2e?schema=public",
  /** マイグレーションも同じ DB に直接接続する */
  DIRECT_DATABASE_URL: "",
  /** セッション署名用の固定値 (テスト専用) */
  BETTER_AUTH_SECRET: "e2e-only-secret-e2e-only-secret-0000",
  /** メール内リンクのベースURL */
  BETTER_AUTH_URL: E2E_BASE_URL,
  /** 本番と同じく管理者承認を必須にする */
  AUTH_SKIP_APPROVAL: "false",
  /** E2E 専用 MinIO (ポート 9010) */
  S3_ENDPOINT: "http://localhost:9010",
  /** S3 リージョン */
  S3_REGION: "ap-northeast-1",
  /** バケット名 (初回アップロード時にアプリが自動作成) */
  S3_BUCKET: "salon-backgrounds-e2e",
  /** MinIO のアクセスキー */
  S3_ACCESS_KEY_ID: "minioadmin",
  /** MinIO のシークレットキー */
  S3_SECRET_ACCESS_KEY: "minioadmin",
  /** SMTP 未設定 = 管理者画面の「ローカル送信メール」で送信内容を確認する */
  SMTP_HOST: "",
  /** 開発サーバーの .next と衝突しないビルド出力先 */
  NEXT_DIST_DIR: ".next-e2e",
};
