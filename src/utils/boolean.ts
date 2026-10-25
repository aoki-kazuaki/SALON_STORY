import dayjs from "dayjs";

import type { DateKey } from "@/types";

/**
 * 対象日が基準日の翌月以降かどうかを判定する (カプセルバッジの配色切り替え用)
 * @param dateKey 対象日 ("YYYY-MM-DD")
 * @param baseDateKey 基準日 (通常は今日)
 * @returns 翌月以降なら true (同月・過去月・不正値は false)
 */
export const boolIsFutureMonth = (dateKey: DateKey, baseDateKey: DateKey): boolean => {
  const target = dayjs(dateKey);
  const base = dayjs(baseDateKey);
  if (!target.isValid()) return false;
  if (!base.isValid()) return false;
  return target.startOf("month").isAfter(base.startOf("month"));
};

/**
 * URL パラメータ等から得た年・月が有効かどうかを判定する
 * @param year 西暦年
 * @param month 月
 * @returns 2000〜2100年かつ1〜12月の整数なら true
 */
export const boolIsValidYearMonth = (year: number, month: number): boolean => {
  if (!Number.isInteger(year)) return false;
  if (!Number.isInteger(month)) return false;
  if (year < 2000) return false;
  if (year > 2100) return false;
  return month >= 1 && month <= 12;
};

/**
 * 対象日が基準日より前 (過去日) かどうかを判定する
 * @param dateKey 対象日 ("YYYY-MM-DD")
 * @param baseDateKey 基準日 (通常は今日)
 * @returns 過去日なら true (当日・未来日・不正値は false)
 */
export const boolIsPastDate = (dateKey: DateKey, baseDateKey: DateKey): boolean => {
  const target = dayjs(dateKey);
  const base = dayjs(baseDateKey);
  if (!target.isValid()) return false;
  if (!base.isValid()) return false;
  return target.isBefore(base, "day");
};
