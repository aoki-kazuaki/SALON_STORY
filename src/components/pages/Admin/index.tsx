"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import AdminApprovalList from "@/components/organisms/Admin/AdminApprovalList";
import AdminOutbox from "@/components/organisms/Admin/AdminOutbox";
import DashboardPageLayout from "@/components/template/DashboardPageLayout";
import { apiGet, apiPost } from "@/lib/api/client";
import type { MailOutboxItem, PendingPasswordReset, PendingUser } from "@/types";
import type { ResGetAdminPending } from "@/types/api/admin/pending";
import type { ResPostAdminApproveReset } from "@/types/api/admin/approve-reset";
import type { ResPostAdminApproveUser } from "@/types/api/admin/approve-user";
import { dateCurrentTimeStamp } from "@/utils/date";

/** 管理者メニュー (新規登録・PWリセット申請の承認) */
const AdminPage = () => {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [passwordResets, setPasswordResets] = useState<PendingPasswordReset[]>([]);
  const [outbox, setOutbox] = useState<MailOutboxItem[]>([]);
  const [isOutboxEnabled, setIsOutboxEnabled] = useState(false);
  const [baseDateTime, setBaseDateTime] = useState("");

  const fetchPending = useCallback(async () => {
    const result = await apiGet<ResGetAdminPending>("/api/admin/pending", {});
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    setUsers(result.data.users);
    setPasswordResets(result.data.passwordResets);
    setOutbox(result.data.outbox);
    setIsOutboxEnabled(result.data.isOutboxEnabled);
    setBaseDateTime(dateCurrentTimeStamp());
  }, []);

  useEffect(() => {
    // 初回表示時に承認待ち一覧を取得する
    const initialize = async () => fetchPending();
    initialize();
  }, [fetchPending]);

  const handleDecideUser = async (userId: string, approve: boolean) => {
    const result = await apiPost<ResPostAdminApproveUser>("/api/admin/approve-user", { userId, approve });
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success("新規登録の承認状態を更新しました");
    await fetchPending();
  };

  const handleDecideReset = async (requestId: string, approve: boolean) => {
    const result = await apiPost<ResPostAdminApproveReset>("/api/admin/approve-reset", { requestId, approve });
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success("パスワードリセット申請の承認状態を更新しました");
    await fetchPending();
  };

  return (
    <DashboardPageLayout title="管理者メニュー" description="新規登録とパスワードリセット申請の承認を行います。">
      <AdminApprovalList
        title="新規登録の承認待ち"
        description="承認するとログインできるようになり、本人へ通知メールが送信されます。"
        items={users}
        baseDateTime={baseDateTime}
        approveMessage="承認すると本人へ通知メールが送信されます。"
        onDecide={handleDecideUser}
      />
      <AdminApprovalList
        title="パスワードリセットの承認待ち"
        description="承認すると、本人へ再設定URL (有効期限1時間) がメールで送信されます。"
        items={passwordResets}
        baseDateTime={baseDateTime}
        approveMessage="承認すると本人へ再設定URLが送信されます。"
        onDecide={handleDecideReset}
      />
      {isOutboxEnabled && <AdminOutbox mails={outbox} baseDateTime={baseDateTime} />}
    </DashboardPageLayout>
  );
};

export default AdminPage;
