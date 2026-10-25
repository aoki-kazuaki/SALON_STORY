import { redirect } from "next/navigation";

/** トップはダッシュボードへ (未ログインの場合は proxy によりログイン画面へ) */
export default function RootPage() {
  redirect("/dashboard");
}
