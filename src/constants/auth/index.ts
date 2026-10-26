// 認証・セッションに関する定数定義

/** セッション有効期限 (30日間、秒) */
export const AUTH_SESSION_EXPIRES_IN_SECONDS: number = 60 * 60 * 24 * 30;

/** セッション有効期限を延長する間隔 (1日、秒) */
export const AUTH_SESSION_UPDATE_AGE_SECONDS: number = 60 * 60 * 24;

/** パスワードの最小文字数 */
export const AUTH_PASSWORD_MIN_LENGTH: number = 8;

/** パスワードの最大文字数 (BetterAuth の既定値) */
export const AUTH_PASSWORD_MAX_LENGTH: number = 128;

/** ログインIDの最小文字数 (BetterAuth username プラグインの既定値) */
export const AUTH_USERNAME_MIN_LENGTH: number = 3;

/** ログインIDの最大文字数 (BetterAuth username プラグインの既定値) */
export const AUTH_USERNAME_MAX_LENGTH: number = 30;

/** 承認待ちユーザーのログイン時に返却されるエラーコード */
export const AUTH_ERROR_CODE_APPROVAL_PENDING: string = "APPROVAL_PENDING";

/** パスワードの文字種ルール (英小文字・英大文字・数字をそれぞれ1文字以上含む) */
export const AUTH_PASSWORD_PATTERN: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

/** パスワードの入力条件の説明文 (フォームの補足説明・エラーメッセージで共通利用) */
export const AUTH_PASSWORD_RULE_TEXT: string = `英大文字・英小文字・数字をそれぞれ含む${AUTH_PASSWORD_MIN_LENGTH}文字以上`;

/** パスワードがルールを満たさない場合にサーバー側で返却するエラーコード */
export const AUTH_ERROR_CODE_WEAK_PASSWORD: string = "WEAK_PASSWORD";

/** ID/メールアドレス・パスワードが一致しない場合の表示メッセージ (どちらが誤りかは利用者の存在確認に悪用されるため区別しない) */
export const AUTH_MESSAGE_INVALID_CREDENTIALS: string =
  "ログインID (メールアドレス) またはパスワードが正しくありません";

/** BetterAuth の通信自体が失敗した場合に付与するエラーコード (アプリ独自) */
export const AUTH_ERROR_CODE_NETWORK: string = "NETWORK_ERROR";

/** BetterAuth のエラーコードごとの表示メッセージ (全フォーム共通。フォーム固有の文言は各フォームで上書きする) */
export const AUTH_MESSAGES_BY_CODE: Record<string, string> = {
  INVALID_USERNAME_OR_PASSWORD: AUTH_MESSAGE_INVALID_CREDENTIALS,
  INVALID_EMAIL_OR_PASSWORD: AUTH_MESSAGE_INVALID_CREDENTIALS,
  WEAK_PASSWORD: `パスワードは${AUTH_PASSWORD_RULE_TEXT}で入力してください`,
  PASSWORD_TOO_SHORT: `パスワードは${AUTH_PASSWORD_RULE_TEXT}で入力してください`,
  PASSWORD_TOO_LONG: `パスワードは${AUTH_PASSWORD_MAX_LENGTH}文字以内で入力してください`,
  USERNAME_IS_ALREADY_TAKEN: "このログインIDは既に使用されています。別のログインIDを入力してください",
  USERNAME_TOO_SHORT: `ログインIDは${AUTH_USERNAME_MIN_LENGTH}文字以上で入力してください`,
  USERNAME_TOO_LONG: `ログインIDは${AUTH_USERNAME_MAX_LENGTH}文字以内で入力してください`,
  INVALID_USERNAME: "ログインIDは半角英数字・アンダースコア・ドットのみ使用できます",
  INVALID_EMAIL: "メールアドレスの形式が正しくありません",
  INVALID_TOKEN: "再設定URLの有効期限が切れているか、既に使用されています。お手数ですが再度リセットを申請してください",
};

/** HTTP ステータスごとの表示メッセージ (エラーコードで判別できなかった場合に利用) */
export const AUTH_MESSAGES_BY_STATUS: Record<number, string> = {
  0: "通信に失敗しました。電波状況を確認して、再度お試しください",
  429: "短時間に操作が繰り返されたため、一時的に制限しています。しばらく待ってから再度お試しください",
};

/** サーバー側の予期しないエラー (5xx) の表示メッセージ */
export const AUTH_MESSAGE_SERVER_ERROR: string = "サーバーでエラーが発生しました。時間をおいて再度お試しください";
