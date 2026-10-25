/** api/admin/pending : 管理者向け承認待ち一覧の取得 */
import type { MailOutboxItem, PendingPasswordReset, PendingUser } from "@/types";

/** GET リクエストパラメータ (指定項目なし) */
export type ReqParamsAdminPending = Record<string, never>;

/** GET レスポンス */
export type ResGetAdminPending = {
  /** 承認待ちの新規登録ユーザー (該当なしは []) */
  users: PendingUser[];
  /** 承認待ちのPWリセット申請 (該当なしは []) */
  passwordResets: PendingPasswordReset[];
  /** ローカル送信箱が有効か (SMTP 未設定のローカル環境のみ true) */
  isOutboxEnabled: boolean;
  /** ローカル送信箱のメール (SMTP 設定済みの環境では []) */
  outbox: MailOutboxItem[];
};
