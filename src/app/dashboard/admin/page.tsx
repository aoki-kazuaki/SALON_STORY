import type { Metadata } from "next";

import AdminPage from "@/components/pages/Admin";

export const metadata: Metadata = { title: "管理者メニュー" };

export default function Page() {
  return <AdminPage />;
}
