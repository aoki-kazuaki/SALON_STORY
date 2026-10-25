"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import ResetPasswordForm from "@/components/organisms/ResetPassword/ResetPasswordForm";
import AuthLayout from "@/components/template/AuthLayout";

/** パスワード再設定画面 (管理者承認後にメールで届く URL から遷移) */
const ResetPasswordPage = () => {
  const searchParams = useSearchParams();

  return (
    <AuthLayout
      title="パスワードの再設定"
      description="新しいパスワードを2回入力してください。"
      footer={
        <Link href="/login" className="underline underline-offset-4">
          ログイン画面へ戻る
        </Link>
      }
    >
      <ResetPasswordForm token={searchParams.get("token") ?? ""} />
    </AuthLayout>
  );
};

export default ResetPasswordPage;
