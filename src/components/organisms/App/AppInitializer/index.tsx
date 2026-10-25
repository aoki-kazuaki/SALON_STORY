"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { authClient } from "@/lib/authClient";

/**
 * ダッシュボード配下のマウント時共通処理 (描画なし)
 * - セッション切れ・無効 Cookie の場合はログイン画面へ
 * - 管理者メニューに一般ユーザーがアクセスした場合はダッシュボードへ
 */
const AppInitializer = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    /** 一般ユーザーが管理者メニューを開いたかどうかの判定フラグ */
    const isForbiddenAdminAccess: boolean = pathname.startsWith("/dashboard/admin") && !(session.user.role === "ADMIN");
    if (isForbiddenAdminAccess) router.replace("/dashboard");
  }, [isPending, session, pathname, router]);

  return null;
};

export default AppInitializer;
