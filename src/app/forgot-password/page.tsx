import type { Metadata } from "next";

import ForgotPasswordPage from "@/components/pages/ForgotPassword";

export const metadata: Metadata = { title: "パスワードをお忘れの方" };

export default function Page() {
  return <ForgotPasswordPage />;
}
