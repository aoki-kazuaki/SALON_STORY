import type { Metadata } from "next";

import RegisterPage from "@/components/pages/Register";

export const metadata: Metadata = { title: "新規登録" };

export default function Page() {
  return <RegisterPage />;
}
