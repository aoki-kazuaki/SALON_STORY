/** api/user/email : ログインユーザーのメールアドレス変更 (即時反映) */

/** POST リクエストボディ */
export type ReqBodyUserEmail = {
  /** 新しいメールアドレス */
  email: string;
};

/** POST レスポンス */
export type ResPostUserEmail = {
  /** 変更後のメールアドレス */
  email: string;
};
