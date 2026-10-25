/** api/password-reset/detail : PWリセットトークンに紐づくメールアドレスの取得 (再設定画面の非活性表示用) */

/** GET リクエストパラメータ */
export type ReqParamsPasswordResetDetail = {
  /** リセットURLに含まれるトークン */
  token: string;
};

/** GET レスポンス */
export type ResGetPasswordResetDetail = {
  /** トークンに紐づくメールアドレス (無効・期限切れの場合は "") */
  email: string;
  /** トークンが有効かどうか */
  isValid: boolean;
};
