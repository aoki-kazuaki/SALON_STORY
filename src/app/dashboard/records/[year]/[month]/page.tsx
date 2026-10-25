import type { Metadata } from "next";
import { Suspense } from "react";

import RecordsMonthPage from "@/components/pages/RecordsMonth";

export const metadata: Metadata = { title: "月別一覧" };

export default function Page() {
  return (
    <Suspense fallback={<p className="text-muted-foreground text-sm">読み込み中…</p>}>
      <RecordsMonthPage />
    </Suspense>
  );
}
