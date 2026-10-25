import Link from "next/link";

import RegisterForm from "@/components/organisms/Register/RegisterForm";
import AuthLayout from "@/components/template/AuthLayout";

/** 新規登録画面 */
const RegisterPage = () => (
  <AuthLayout
    title="新規登録"
    description="登録後、管理者の承認を経てご利用いただけます。"
    footer={
      <Link href="/login" className="underline underline-offset-4">
        登録済みの方はログイン
      </Link>
    }
  >
    <RegisterForm />
  </AuthLayout>
);

export default RegisterPage;
