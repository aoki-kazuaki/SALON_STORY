import type { Metadata } from "next";

import BackgroundsPage from "@/components/pages/Backgrounds";

export const metadata: Metadata = { title: "背景画像管理" };

export default function Page() {
  return <BackgroundsPage />;
}
