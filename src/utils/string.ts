import type { BackgroundSlot, BackgroundSlotNumber, StoryDensity } from "@/types";

/**
 * エディタで使用する背景画像URLを決定する
 * - 選択中スロットが登録済み: そのスロット
 * - 未選択・削除済み: スロット1 → 登録済みの先頭スロットの順にフォールバック
 * - 0枚: 外部サロン風画像 (fallbackUrl)
 * @param slots 登録済みスロット一覧
 * @param selectedSlotNumber 選択中のスロット番号 (未選択は null)
 * @param fallbackUrl 0枚時のフォールバックURL
 * @returns 背景画像URL
 */
export const stringResolveBackgroundUrl = (
  slots: BackgroundSlot[],
  selectedSlotNumber: BackgroundSlotNumber | null,
  fallbackUrl: string,
): string => {
  const selected = slots.find((slot) => slot.slotNumber === selectedSlotNumber);
  if (selected) return selected.imageUrl;
  const firstSlot = slots.find((slot) => slot.slotNumber === 1);
  if (firstSlot) return firstSlot.imageUrl;
  if (slots.length === 0) return fallbackUrl;
  return slots[0].imageUrl;
};

/**
 * エディタの月指定で初期選択する年月を決定する
 * - 今月のデータがあれば今月、なければ今月以降で最も近い月、それもなければ最新の月
 * @param monthKeys データが存在する年月 ("YYYY-MM") の一覧
 * @param todayKey 今日の日付キー
 * @returns 初期選択する年月 (データがない場合は "")
 */
export const stringResolveDefaultTargetMonth = (monthKeys: string[], todayKey: string): string => {
  const currentMonth = todayKey.slice(0, 7);
  if (monthKeys.includes(currentMonth)) return currentMonth;
  const upcomingMonths = monthKeys.filter((monthKey) => monthKey > currentMonth).sort();
  if (upcomingMonths.length > 0) return upcomingMonths[0];
  return [...monthKeys].sort().at(-1) ?? "";
};

/** 1列・大きめ表示にするバッジ件数の上限 */
const STORY_DENSITY_LARGE_MAX_COUNT = 6;

/** 2列・中サイズ表示にするバッジ件数の上限 (超えると2列・小サイズ) */
const STORY_DENSITY_MEDIUM_MAX_COUNT = 12;

/**
 * バッジ件数からストーリーズキャンバスの表示密度を決定する
 * @param itemCount 表示するバッジ件数
 * @returns 表示密度 (6件以下: "lg" / 12件以下: "md" / それ以上: "sm")
 */
export const stringResolveStoryDensity = (itemCount: number): StoryDensity => {
  if (itemCount <= STORY_DENSITY_LARGE_MAX_COUNT) return "lg";
  if (itemCount <= STORY_DENSITY_MEDIUM_MAX_COUNT) return "md";
  return "sm";
};
