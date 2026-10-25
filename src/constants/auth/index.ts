// 認証・セッションに関する定数定義

/** セッション有効期限 (30日間、秒) */
export const AUTH_SESSION_EXPIRES_IN_SECONDS: number = 60 * 60 * 24 * 30;

/** セッション有効期限を延長する間隔 (1日、秒) */
export const AUTH_SESSION_UPDATE_AGE_SECONDS: number = 60 * 60 * 24;

/** パスワードの最小文字数 */
export const AUTH_PASSWORD_MIN_LENGTH: number = 8;

/** ログインIDの最小文字数 (BetterAuth username プラグインの既定値) */
export const AUTH_USERNAME_MIN_LENGTH: number = 3;

/** 承認待ちユーザーのログイン時に返却されるエラーコード */
export const AUTH_ERROR_CODE_APPROVAL_PENDING: string = "APPROVAL_PENDING";
