"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import LoginForm from "@/components/organisms/Login/LoginForm";
import AuthLayout from "@/components/template/AuthLayout";

/** ログイン画面 */
const LoginPage = () => {
  const searchParams = useSearchParams();

  /** 新規登録の直後 (自動ログインに失敗した場合) かどうかの判定フラグ */
  const isJustRegistered: boolean = searchParams.get("registered") === "1";

  return (
    <AuthLayout
      title="ログイン"
      description="ログインID (またはメールアドレス) とパスワードを入力してください。"
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
      {isJustRegistered && (
        <p role="status" className="mb-4 rounded-md bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
          登録が完了しました。登録したログインIDとパスワードでログインしてください。
        </p>
      )}
      <LoginForm redirectPath={searchParams.get("redirect") ?? ""} />
    </AuthLayout>
  );
};

export default LoginPage;
