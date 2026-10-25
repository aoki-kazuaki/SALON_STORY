import type { Metadata } from "next";

import RecordsPage from "@/components/pages/Records";

export const metadata: Metadata = { title: "登録データ一覧" };

export default function Page() {
  return <RecordsPage />;
}
