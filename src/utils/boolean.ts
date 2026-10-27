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
 * 年・月が基準日と同じ月 (今月) かどうかを判定する (登録データ一覧・月別一覧のカレント表示用)
 * @param year 西暦年
 * @param month 月 (1〜12)
 * @param baseDateKey 基準日 (通常は今日)
 * @returns 同じ年月なら true (不正値は false)
 */
export const boolIsCurrentMonth = (year: number, month: number, baseDateKey: DateKey): boolean => {
  const base = dayjs(baseDateKey);
  if (!base.isValid()) return false;
  return base.year() === year && base.month() + 1 === month;
};

/**
 * 年・月が基準日の月から指定か月先までに収まるかどうかを判定する (月別一覧の「次の月」の活性判定用)
 * @param year 西暦年
 * @param month 月 (1〜12)
 * @param baseDateKey 基準日 (通常は今日)
 * @param futureMonthCount 何か月先まで選択可能とするか
 * @returns 指定か月先の月以前なら true (過去月も true、不正値は false)
 */
export const boolIsWithinRegistrableMonth = (
  year: number,
  month: number,
  baseDateKey: DateKey,
  futureMonthCount: number,
): boolean => {
  const base = dayjs(baseDateKey);
  if (!base.isValid()) return false;
  if (!boolIsValidYearMonth(year, month)) return false;
  const limitMonth = base.startOf("month").add(futureMonthCount, "month");
  return !dayjs(new Date(year, month - 1, 1)).isAfter(limitMonth);
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

/**
 * ログイン入力値がメールアドレスかどうかを判定する (ログインIDは "@" を含められないため "@" の有無で判別)
 * @param identifier ログインIDまたはメールアドレス
 * @returns "@" を含む場合は true
 */
export const boolIsEmailIdentifier = (identifier: string): boolean => identifier.includes("@");
