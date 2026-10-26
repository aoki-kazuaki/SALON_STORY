import {
  AUTH_ERROR_CODE_NETWORK,
  AUTH_MESSAGE_SERVER_ERROR,
  AUTH_MESSAGES_BY_CODE,
  AUTH_MESSAGES_BY_STATUS,
} from "@/constants/auth";

/** BetterAuth クライアント呼び出しの失敗内容 (通信自体の失敗は status 0) */
export type AuthCallError = {
  /** エラーコード (BetterAuth・アプリ独自。不明な場合は "") */
  code: string;
  /** HTTP ステータス */
  status: number;
};

/** BetterAuth クライアントの戻り値のうち、エラー判定に利用する部分 */
type AuthCallResult = { error: { code?: string; status: number } | null };

/**
 * BetterAuth クライアントの呼び出しを実行し、失敗時のみエラー内容を返す
 * @param call BetterAuth クライアントの呼び出し (例: () => authClient.signIn.email(...))
 * @returns 成功時は null、失敗時はエラー内容 (通信自体の失敗も例外にせず status 0 として返す)
 */
export const authCall = async (call: () => Promise<AuthCallResult>): Promise<AuthCallError | null> => {
  try {
    const { error } = await call();
    if (!error) return null;
    return { code: error.code ?? "", status: error.status };
  } catch {
    return { code: AUTH_ERROR_CODE_NETWORK, status: 0 };
  }
};

/**
 * エラー内容を利用者向けの表示メッセージに変換する
 * - 優先順: フォーム固有のコード別文言 → 共通のコード別文言 → 通信失敗・回数制限 → サーバーエラー → フォーム既定文言
 * @param error エラー内容
 * @param fallback どれにも該当しない場合の文言 (フォームごとの「〜に失敗しました」等)
 * @param messagesByCode フォーム固有のコード別文言 (共通の文言より優先)
 * @returns 表示メッセージ
 */
export const authErrorMessage = (
  error: AuthCallError,
  fallback: string,
  messagesByCode: Record<string, string> = {},
): string => {
  const message = messagesByCode[error.code] ?? AUTH_MESSAGES_BY_CODE[error.code] ?? "";
  if (!(message === "")) return message;
  if (error.code === AUTH_ERROR_CODE_NETWORK) return AUTH_MESSAGES_BY_STATUS[0];
  const statusMessage = AUTH_MESSAGES_BY_STATUS[error.status] ?? "";
  if (!(statusMessage === "")) return statusMessage;
  if (error.status >= 500) return AUTH_MESSAGE_SERVER_ERROR;
  return fallback;
};
