import type { BackgroundSlot, BackgroundSlotNumber, EditorRangeMode } from "@/types";

/**
 * 複数行テキストの1行目を返す (前後の空白は除去)
 * @param text 対象テキスト
 * @returns 1行目の文字列 (空文字の場合は "")
 */
export const stringFirstLine = (text: string): string => text.trim().split(/\r?\n/)[0].trim();

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

/**
 * ストーリーズキャンバスの見出しを生成する
 * @param rangeMode 期間・日付の選択方式
 * @param targetMonth 月指定時の対象年月 ("YYYY-MM")
 * @returns 見出し (月指定: "10月の空き状況" / 期間指定・未選択: "空き状況")
 */
export const stringBuildStoryTitle = (rangeMode: EditorRangeMode, targetMonth: string): string => {
  if (rangeMode === "period") return "空き状況";
  if (targetMonth === "") return "空き状況";
  return `${Number(targetMonth.slice(5, 7))}月の空き状況`;
};
