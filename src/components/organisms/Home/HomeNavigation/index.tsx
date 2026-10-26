import { ChevronRightIcon, ImagesIcon, ListIcon, SparklesIcon, type LucideIcon } from "lucide-react";
import Link from "next/link";

/** 遷移導線1件分 */
type NavigationItem = {
  /** 遷移先 */
  href: string;
  /** 見出し */
  label: string;
  /** 説明 */
  description: string;
  /** アイコン */
  icon: LucideIcon;
};

/** ダッシュボードから遷移できる画面 */
const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    href: "/dashboard/editor",
    label: "ストーリーズエディタ",
    description: "空き枠を選んで 9:16 の告知画像をプレビュー",
    icon: SparklesIcon,
  },
  {
    href: "/dashboard/records",
    label: "登録データ一覧",
    description: "年月別にメモを確認・編集・クリア",
    icon: ListIcon,
  },
  {
    href: "/dashboard/backgrounds",
    label: "背景画像管理",
    description: "ストーリーズの背景を最大4枚まで登録",
    icon: ImagesIcon,
  },
];

/** 各画面への遷移導線カード */
const HomeNavigation = () => (
  <ul className="grid gap-3">
    {NAVIGATION_ITEMS.map((item) => (
      <li key={item.href}>
        <Link
          href={item.href}
          className="bg-card flex items-center gap-4 rounded-xl border p-4 shadow-sm transition hover:border-stone-400 hover:shadow"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white">
            <item.icon className="size-5" />
          </span>
          <span className="flex-1">
            <span className="block font-bold">{item.label}</span>
            <span className="text-muted-foreground block text-sm">{item.description}</span>
          </span>
          <ChevronRightIcon className="text-muted-foreground size-5" />
        </Link>
      </li>
    ))}
  </ul>
);

export default HomeNavigation;
