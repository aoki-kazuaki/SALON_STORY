// 背景画像のフォールバック先と、プレビュー・Storybook 用のストーリーズキャンバスのサンプルデータ定義
import type { StoryBadgeItem } from "@/types";

/** 背景画像が0枚の場合のフォールバック先となる外部サロン風画像 (Unsplash、9:16 にクロップ) */
export const FALLBACK_BACKGROUND_IMAGE_URL: string =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1080&q=80&fit=crop&ar=9:16";

/** サンプル表示用のバッジ一覧 (2026年10月分 + 11月分) */
const SAMPLE_BADGE_ITEMS: StoryBadgeItem[] = [
  { dateKey: "2026-10-26", label: "10/26(月)", markText: "◎", variant: "current" },
  { dateKey: "2026-10-27", label: "10/27(火)", markText: "△", variant: "current" },
  { dateKey: "2026-10-28", label: "10/28(水)", markText: "◎", variant: "current" },
  { dateKey: "2026-10-30", label: "10/30(金)", markText: "残1", variant: "current" },
  { dateKey: "2026-10-31", label: "10/31(土)", markText: "△", variant: "current" },
  { dateKey: "2026-11-02", label: "11/2(月)", markText: "◎", variant: "future" },
  { dateKey: "2026-11-04", label: "11/4(水)", markText: "◎", variant: "future" },
  { dateKey: "2026-11-05", label: "11/5(木)", markText: "△", variant: "future" },
  { dateKey: "2026-11-06", label: "11/6(金)", markText: "残1", variant: "future" },
  { dateKey: "2026-11-07", label: "11/7(土)", markText: "◎", variant: "future" },
];

/** ストーリーズキャンバスのサンプル Props 一式 */
export const SAMPLE_STORY_CANVAS = {
  /** 背景画像URL */
  backgroundImageUrl: FALLBACK_BACKGROUND_IMAGE_URL,
  /** 小見出し */
  subTitle: "AVAILABLE",
  /** 見出し */
  title: "空き状況",
  /** バッジ一覧 */
  items: SAMPLE_BADGE_ITEMS,
  /** 凡例カード見出し */
  legendTitle: "ご予約について",
  /** 凡例カード本文 */
  legendText:
    "◎ 空きあり　△ 残りわずか　残1 残り1枠\n白：今月　／　黒：来月\nご予約はプロフィールのリンク、またはDMからどうぞ。",
};
