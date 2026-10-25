import type { Metadata } from "next";

import SettingsPage from "@/components/pages/Settings";

export const metadata: Metadata = { title: "ユーザー設定" };

export default function Page() {
  return <SettingsPage />;
}
