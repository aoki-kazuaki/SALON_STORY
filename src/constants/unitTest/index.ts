// 単体テスト (Vitest) で共通利用する固定値・フィクスチャ定義
import type { StoryBadgeItem } from "@/types";

/** 相対日時テストの基準日時 (2026年10月25日 日曜 12:00:00) */
export const UNIT_TEST_BASE_DATE_TIME: string = "2026-10-25 12:00:00";

/** 基準日時に対応する日付キー */
export const UNIT_TEST_BASE_DATE_KEY: string = "2026-10-25";

/** 日付として解釈できない不正な文字列 */
export const UNIT_TEST_INVALID_DATE: string = "not-a-date";

/** カプセルバッジのテスト用ラベル */
export const UNIT_TEST_BADGE_LABEL: string = "10/25";

/** カプセルバッジのテスト用丸バッジ記号 */
export const UNIT_TEST_BADGE_MARK: string = "日";

/** 凡例カードのテスト用タイトル */
export const UNIT_TEST_LEGEND_TITLE: string = "ご予約について";

/** 凡例カードのテスト用本文 (改行を含む) */
export const UNIT_TEST_LEGEND_TEXT: string = "◎ 空きあり\n△ 残りわずか\nDMにてご予約ください";

/** ストーリーズキャンバスのテスト用背景画像URL */
export const UNIT_TEST_BACKGROUND_URL: string = "https://example.com/background.jpg";

/** ストーリーズキャンバスのテスト用バッジ一覧 (当月2件 + 次月1件) */
export const UNIT_TEST_BADGE_ITEMS: StoryBadgeItem[] = [
  {
    dateKey: "2026-10-28",
    label: "10/28",
    descriptionLines: ["13:00〜", "2名まで"],
    markText: "水",
    variant: "current",
  },
  { dateKey: "2026-10-30", label: "10/30", descriptionLines: ["終日OK"], markText: "金", variant: "current" },
  { dateKey: "2026-11-02", label: "11/2", descriptionLines: ["15:00〜"], markText: "月", variant: "future" },
];

/** カプセルバッジのテスト用メモの各行 (長い行を含む) */
export const UNIT_TEST_BADGE_DESCRIPTION_LINES: string[] = ["10:00", "13:15", "※カラーをご希望の方は要相談"];
