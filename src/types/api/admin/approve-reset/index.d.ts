/** api/admin/approve-reset : PWリセット申請の承認 (リセットURLをメール送付)・却下 */

/** POST リクエストボディ */
export type ReqBodyAdminApproveReset = {
  /** 対象申請ID */
  requestId: string;
  /** true: 承認 / false: 却下 */
  approve: boolean;
};

/** POST レスポンス */
export type ResPostAdminApproveReset = {
  /** 対象申請ID */
  requestId: string;
};
