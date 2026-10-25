"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import LoginForm from "@/components/organisms/Login/LoginForm";
import AuthLayout from "@/components/template/AuthLayout";

/** ログイン画面 */
const LoginPage = () => {
  const searchParams = useSearchParams();

  return (
    <AuthLayout
      title="ログイン"
      description="ログインIDとパスワードを入力してください。"
      footer={
        <>
          <Link href="/register" className="underline underline-offset-4">
            はじめての方は新規登録
          </Link>
          <Link href="/forgot-password" className="text-muted-foreground underline underline-offset-4">
            パスワードを忘れた方
          </Link>
        </>
      }
    >
      <LoginForm redirectPath={searchParams.get("redirect") ?? ""} />
    </AuthLayout>
  );
};

export default LoginPage;
