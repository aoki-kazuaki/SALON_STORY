import type { Metadata } from "next";

import HomePage from "@/components/pages/Home";

export const metadata: Metadata = { title: "ダッシュボード" };

export default function Page() {
  return <HomePage />;
}
