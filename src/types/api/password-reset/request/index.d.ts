/** api/password-reset/request : PWリセット申請 (未ログインで利用、管理者承認後にリセットURLを送付) */

/** POST リクエストボディ */
export type ReqBodyPasswordResetRequest = {
  /** 登録済みメールアドレス */
  email: string;
};

/** POST レスポンス (アカウントの存在有無を推測されないよう、常に同じ内容を返却) */
export type ResPostPasswordResetRequest = {
  /** 受付完了メッセージ */
  message: string;
};
