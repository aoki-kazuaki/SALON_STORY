"use client";

import { useEffect } from "react";

import CBanner from "@/components/molecules/CBanner";
import HomeActionPanel from "@/components/organisms/Home/HomeActionPanel";
import HomeNavigation from "@/components/organisms/Home/HomeNavigation";
import HomeLayout from "@/components/template/HomeLayout";
import { authClient } from "@/lib/authClient";
import { useFlashStore } from "@/stores/flashStore";

/** ダッシュボード */
const HomePage = () => {
  const { data: session } = authClient.useSession();
  const flashMessage = useFlashStore((state) => state.message);
  const clearFlashMessage = useFlashStore((state) => state.clearMessage);

  // 一時バナーは画面を離れたら消去する
  useEffect(() => clearFlashMessage, [clearFlashMessage]);

  /** 完了バナーを表示するかどうかの判定フラグ */
  const hasFlashMessage: boolean = !(flashMessage === "");
  const displayName = session?.user.name ?? "";
  /** 表示名を取得済みかどうかの判定フラグ (セッション読み込み中は名前なしで表示) */
  const hasDisplayName: boolean = !(displayName === "");
  const greetingPrefix = hasDisplayName ? `${displayName} さん、` : "";

  return (
    <HomeLayout
      banner={hasFlashMessage && <CBanner message={flashMessage} onClose={clearFlashMessage} />}
      greeting={
        <div>
          <h1 className="text-2xl font-bold">ダッシュボード</h1>
          <p className="text-muted-foreground mt-1 text-sm">{greetingPrefix}今日の空き枠を告知しましょう。</p>
        </div>
      }
      actions={<HomeActionPanel />}
      navigation={<HomeNavigation />}
    />
  );
};

export default HomePage;
