import Link from "next/link";

import ForgotPasswordForm from "@/components/organisms/ForgotPassword/ForgotPasswordForm";
import AuthLayout from "@/components/template/AuthLayout";

/** パスワードリセット申請画面 */
const ForgotPasswordPage = () => (
  <AuthLayout
    title="パスワードをお忘れの方"
    description="管理者の承認後、登録メールアドレスに再設定用のURLをお送りします。"
    footer={
      <Link href="/login" className="underline underline-offset-4">
        ログイン画面へ戻る
      </Link>
    }
  >
    <ForgotPasswordForm />
  </AuthLayout>
);

export default ForgotPasswordPage;
