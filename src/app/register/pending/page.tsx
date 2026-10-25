import type { Metadata } from "next";

import RegisterPendingPage from "@/components/pages/RegisterPending";

export const metadata: Metadata = { title: "承認待ち" };

export default function Page() {
  return <RegisterPendingPage />;
}
