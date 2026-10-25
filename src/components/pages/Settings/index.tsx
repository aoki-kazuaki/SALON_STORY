"use client";

import { useRouter } from "next/navigation";

import CCard from "@/components/molecules/CCard";
import SettingsEmailForm from "@/components/organisms/Settings/SettingsEmailForm";
import SettingsPasswordForm from "@/components/organisms/Settings/SettingsPasswordForm";
import DashboardPageLayout from "@/components/template/DashboardPageLayout";
import { authClient } from "@/lib/authClient";
import { useFlashStore } from "@/stores/flashStore";

/** ユーザー設定 (メールアドレス・パスワード変更) */
const SettingsPage = () => {
  const router = useRouter();
  const { data: session, refetch } = authClient.useSession();
  const setFlashMessage = useFlashStore((state) => state.setMessage);

  /** 変更成功後、ダッシュボード上部に一時バナーを表示する */
  const handleSuccess = async (message: string) => {
    await refetch();
    setFlashMessage(message);
    router.push("/dashboard");
  };

  return (
    <DashboardPageLayout title="ユーザー設定" description="変更は確認後すぐに反映されます。">
      <CCard title="アカウント情報">
        <dl className="grid grid-cols-[6rem_1fr] gap-y-1 text-sm">
          <dt className="text-muted-foreground">ログインID</dt>
          <dd className="font-bold">{session?.user.username ?? ""}</dd>
          <dt className="text-muted-foreground">メール</dt>
          <dd className="break-all">{session?.user.email ?? ""}</dd>
        </dl>
      </CCard>
      <SettingsEmailForm currentEmail={session?.user.email ?? ""} onSuccess={handleSuccess} />
      <SettingsPasswordForm onSuccess={handleSuccess} />
    </DashboardPageLayout>
  );
};

export default SettingsPage;
