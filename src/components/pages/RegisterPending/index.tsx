import { HourglassIcon } from "lucide-react";
import Link from "next/link";

import CButton from "@/components/atoms/CButton";
import AuthLayout from "@/components/template/AuthLayout";

/** 管理者承認待ち画面 */
const RegisterPendingPage = () => (
  <AuthLayout
    title="管理者の承認待ちです"
    description="ご登録ありがとうございます。"
    footer={
      <Link href="/login" className="underline underline-offset-4">
        ログイン画面へ戻る
      </Link>
    }
  >
    <div className="grid gap-4">
      <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
        <HourglassIcon className="mt-0.5 size-5 shrink-0" />
        <p>
          管理者へ承認依頼のメールを送信しました。
          <br />
          承認されると登録メールアドレスへお知らせが届きますので、その後ログインしてください。
        </p>
      </div>
      <CButton asChild variant="outline" size="lg">
        <Link href="/login">ログイン画面へ</Link>
      </CButton>
    </div>
  </AuthLayout>
);

export default RegisterPendingPage;
