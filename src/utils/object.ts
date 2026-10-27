import dayjs from "dayjs";

import type { DateKey, EditorSelection } from "@/types";
import { dateAddDays } from "@/utils/date";

/** エディタの抽出期間 (開始日・終了日を含む) */
export type EditorRange = {
  /** 開始日 (未確定は "") */
  startDate: DateKey;
  /** 終了日 (未確定は "") */
  endDate: DateKey;
};

/** 年月 */
export type YearMonth = {
  /** 西暦年 */
  year: number;
  /** 月 (1〜12) */
  month: number;
};

/**
 * 年月を指定か月ずらす (月別一覧の前の月・次の月の算出用)
 * @param year 西暦年
 * @param month 月 (1〜12)
 * @param diff ずらす月数 (負数で過去方向)
 * @returns ずらした後の年月 (例: 2026年12月 + 1 → 2027年1月)
 */
export const objectShiftYearMonth = (year: number, month: number, diff: number): YearMonth => {
  const shifted = dayjs(new Date(year, month - 1, 1)).add(diff, "month");
  return { year: shifted.year(), month: shifted.month() + 1 };
};

/**
 * 指定月の1日〜末日の期間を算出する
 * @param year 西暦年
 * @param month 月 (1〜12)
 * @returns 1日〜末日の期間
 */
export const objectBuildMonthRange = (year: number, month: number): EditorRange => {
  const monthStart = dayjs(new Date(year, month - 1, 1));
  return { startDate: monthStart.format("YYYY-MM-DD"), endDate: monthStart.endOf("month").format("YYYY-MM-DD") };
};

/**
 * エディタの選択状態から空き枠の抽出期間を算出する
 * - 月指定: 対象月の1日〜末日 (過去日を含めない場合、開始日は今日以降に切り上げ)
 * - 期間指定: 開始日 (未選択は今日) から日数分
 * @param selection エディタの選択状態
 * @param todayKey 今日の日付キー
 * @returns 抽出期間 (月未選択の場合は開始日・終了日とも "")
 */
export const objectBuildEditorRange = (
  selection: Pick<EditorSelection, "rangeMode" | "targetMonth" | "includePastDates" | "periodStartDate" | "periodDays">,
  todayKey: DateKey,
): EditorRange => {
  if (selection.rangeMode === "period") {
    const startDate = selection.periodStartDate ?? todayKey;
    return { startDate, endDate: dateAddDays(startDate, selection.periodDays - 1) };
  }
  if (selection.targetMonth === "") return { startDate: "", endDate: "" };

  const monthStart = dayjs(`${selection.targetMonth}-01`);
  const firstDate = monthStart.format("YYYY-MM-DD");
  const endDate = monthStart.endOf("month").format("YYYY-MM-DD");
  if (selection.includePastDates) return { startDate: firstDate, endDate };
  if (firstDate > todayKey) return { startDate: firstDate, endDate };
  return { startDate: todayKey, endDate };
};
