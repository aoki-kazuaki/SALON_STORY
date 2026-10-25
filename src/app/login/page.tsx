import type { Metadata } from "next";
import { Suspense } from "react";

import LoginPage from "@/components/pages/Login";

export const metadata: Metadata = { title: "ログイン" };

export default function Page() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
