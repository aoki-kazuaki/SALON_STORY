import type { Metadata } from "next";

import EditorPage from "@/components/pages/Editor";

export const metadata: Metadata = { title: "ストーリーズエディタ" };

export default function Page() {
  return <EditorPage />;
}
