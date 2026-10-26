// 背景画像のフォールバック先と、Storybook 用のストーリーズキャンバスのサンプルデータ定義
import type { StoryBadgeItem } from "@/types";

/** 背景画像が0枚の場合のフォールバック先となる外部サロン風画像 (Unsplash、9:16 にクロップ) */
export const FALLBACK_BACKGROUND_IMAGE_URL: string =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1080&q=80&fit=crop&ar=9:16";

/** サンプル表示用のバッジ一覧 (少件数: 1列・大きめ表示になる件数) */
export const SAMPLE_BADGE_ITEMS_FEW: StoryBadgeItem[] = [
  {
    dateKey: "2026-10-27",
    label: "10/27",
    descriptionLines: ["10:00〜 / 13:30〜"],
    markText: "火",
    variant: "current",
  },
  {
    dateKey: "2026-10-28",
    label: "10/28",
    descriptionLines: ["16:00〜 カットのみ", "※カラーは要相談"],
    markText: "水",
    variant: "current",
  },
  { dateKey: "2026-10-31", label: "10/31", descriptionLines: ["終日OK"], markText: "土", variant: "current" },
  { dateKey: "2026-11-02", label: "11/2", descriptionLines: ["11:00〜 / 14:00〜"], markText: "月", variant: "future" },
];

/** サンプル表示用のバッジ一覧 (多件数: 2列表示になる件数) */
export const SAMPLE_BADGE_ITEMS_MANY: StoryBadgeItem[] = [
  { dateKey: "2026-10-26", label: "10/26", descriptionLines: ["13:00〜"], markText: "月", variant: "current" },
  {
    dateKey: "2026-10-27",
    label: "10/27",
    descriptionLines: ["10:00〜", "15:30〜"],
    markText: "火",
    variant: "current",
  },
  { dateKey: "2026-10-28", label: "10/28", descriptionLines: ["16:00〜"], markText: "水", variant: "current" },
  { dateKey: "2026-10-30", label: "10/30", descriptionLines: ["終日OK"], markText: "金", variant: "current" },
  { dateKey: "2026-10-31", label: "10/31", descriptionLines: ["11:00〜"], markText: "土", variant: "current" },
  { dateKey: "2026-11-02", label: "11/2", descriptionLines: ["14:00〜"], markText: "月", variant: "future" },
  { dateKey: "2026-11-04", label: "11/4", descriptionLines: ["10:30〜"], markText: "水", variant: "future" },
  { dateKey: "2026-11-05", label: "11/5", descriptionLines: ["17:00〜"], markText: "木", variant: "future" },
  { dateKey: "2026-11-06", label: "11/6", descriptionLines: ["12:00〜", "18:00〜"], markText: "金", variant: "future" },
  { dateKey: "2026-11-07", label: "11/7", descriptionLines: ["終日OK"], markText: "土", variant: "future" },
];

/** ストーリーズキャンバスのサンプル Props 一式 */
export const SAMPLE_STORY_CANVAS = {
  /** 背景画像URL */
  backgroundImageUrl: FALLBACK_BACKGROUND_IMAGE_URL,
  /** バッジ一覧 */
  items: SAMPLE_BADGE_ITEMS_FEW,
  /** 凡例カード見出し */
  legendTitle: "ご予約について",
  /** 凡例カード本文 */
  legendText: "白：今月　／　黒：来月\nご予約はプロフィールのリンク、またはDMからどうぞ。",
};
