"use client";

import { ArrowLeftIcon, LogOutIcon, ShieldCheckIcon, UserCogIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import CButton from "@/components/atoms/CButton";
import CConfirmDialog from "@/components/molecules/CConfirmDialog";
import { useScrollHidden } from "@/hooks/useScrollHidden";
import { authClient } from "@/lib/authClient";
import { cn } from "@/lib/shadcn/utils";
import { arrayBuildBreadcrumbs } from "@/utils/array";

/**
 * ダッシュボード配下の固定ヘッダー
 * - 下スクロールで隠れ、上スクロールで出現
 * - 左: 戻る (下層のみ) ＋ ロゴ / 右: 管理者メニュー (管理者のみ)・ユーザー設定・ログアウト
 */
const AppHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isHidden = useScrollHidden();
  const { data: session } = authClient.useSession();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const breadcrumbs = arrayBuildBreadcrumbs(pathname);
  /** 下層ページ (戻るリンクを表示する) かどうかの判定フラグ */
  const isSubPage: boolean = breadcrumbs.length > 1;
  /** 戻るリンクの遷移先 (1つ上の階層) */
  const backHref: string = breadcrumbs.at(-2)?.href ?? "/dashboard";
  /** 管理者かどうかの判定フラグ */
  const isAdmin: boolean = session?.user.role === "ADMIN";
  const headerPositionClass = isHidden ? "-translate-y-full" : "translate-y-0";

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace("/login");
  };

  return (
    <header
      className={cn(
        "bg-background/90 fixed inset-x-0 top-0 z-40 border-b backdrop-blur transition-transform duration-300",
        headerPositionClass,
      )}
    >
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-1">
          {isSubPage && (
            <CButton asChild variant="ghost" size="sm">
              <Link href={backHref}>
                <ArrowLeftIcon />
                戻る
              </Link>
            </CButton>
          )}
          <Link href="/dashboard" className="px-1 text-sm font-bold tracking-[0.2em]">
            SALON STORY
          </Link>
        </div>
        <nav className="flex items-center gap-1">
          {isAdmin && (
            <CButton asChild variant="ghost" size="icon" aria-label="管理者メニュー">
              <Link href="/dashboard/admin">
                <ShieldCheckIcon />
              </Link>
            </CButton>
          )}
          <CButton asChild variant="ghost" size="icon" aria-label="ユーザー設定">
            <Link href="/dashboard/settings">
              <UserCogIcon />
            </Link>
          </CButton>
          <CButton variant="ghost" size="icon" aria-label="ログアウト" onClick={() => setIsLogoutDialogOpen(true)}>
            <LogOutIcon />
          </CButton>
        </nav>
      </div>
      <CConfirmDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        title="ログアウトしますか？"
        description="再度利用するにはログインが必要です。"
        confirmLabel="ログアウト"
        onConfirm={handleLogout}
      />
    </header>
  );
};

export default AppHeader;
