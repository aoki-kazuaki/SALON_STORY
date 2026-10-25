/** api/admin/approve-user : 新規登録ユーザーの承認・却下 */

/** POST リクエストボディ */
export type ReqBodyAdminApproveUser = {
  /** 対象ユーザーID */
  userId: string;
  /** true: 承認 / false: 却下 */
  approve: boolean;
};

/** POST レスポンス */
export type ResPostAdminApproveUser = {
  /** 対象ユーザーID */
  userId: string;
};
