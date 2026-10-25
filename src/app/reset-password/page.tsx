import type { Metadata } from "next";
import { Suspense } from "react";

import ResetPasswordPage from "@/components/pages/ResetPassword";

export const metadata: Metadata = { title: "パスワードの再設定" };

export default function Page() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}
