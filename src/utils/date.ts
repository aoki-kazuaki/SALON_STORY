import dayjs from "dayjs";

import type { DateKey } from "@/types";

/** 曜日インデックス (0: 日曜) に対応する日本語表記 */
const WEEKDAY_LABELS: string[] = ["日", "月", "火", "水", "木", "金", "土"];

/** 月 (1〜12) に対応する英語略称 */
const MONTH_ABBREVIATIONS: Record<number, string> = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

/** 月 (1〜12) に対応する季節絵文字 (冬: ❄️ / 春: 🌸 / 夏: 🌻 / 秋: 🍁) */
const MONTH_SEASON_EMOJIS: Record<number, string> = {
  1: "❄️",
  2: "❄️",
  3: "🌸",
  4: "🌸",
  5: "🌸",
  6: "🌻",
  7: "🌻",
  8: "🌻",
  9: "🍁",
  10: "🍁",
  11: "🍁",
  12: "❄️",
};

/**
 * 現在日時を "YYYY-MM-DD HH:mm:ss" 形式で返す
 * @returns 現在日時の文字列
 */
export const dateCurrentTimeStamp = (): string => dayjs().format("YYYY-MM-DD HH:mm:ss");

/**
 * 今日の日付キーを返す (`<input type="date">` の min 属性等に利用)
 * @returns "YYYY-MM-DD" 形式の今日の日付
 */
export const dateTodayKey = (): DateKey => dayjs().format("YYYY-MM-DD");

/**
 * 日時文字列を日付キーに変換する
 * @param value 日時文字列 (ISO 8601 / "YYYY-MM-DD HH:mm:ss" 等)
 * @returns "YYYY-MM-DD" 形式の日付キー (空文字・不正値の場合は "")
 */
export const dateFormatKey = (value: string): DateKey => {
  if (value === "") return "";
  const parsed = dayjs(value);
  if (!parsed.isValid()) return "";
  return parsed.format("YYYY-MM-DD");
};

/**
 * 基準日時から見た相対表記に変換する (最終更新日時の表示用)
 * - 1分未満 (未来日時を含む): "たった今"
 * - 1時間未満: "N分前" / 24時間未満: "N時間前" / 7日未満: "N日前"
 * - それ以上: "YYYY/MM/DD HH:mm"
 * @param targetDateTime 対象日時
 * @param baseDateTime 基準日時 (通常は dateCurrentTimeStamp() の値)
 * @returns 相対表記の文字列 (空文字・不正値の場合は "")
 */
export const dateFormatRelative = (targetDateTime: string, baseDateTime: string): string => {
  if (targetDateTime === "") return "";
  const target = dayjs(targetDateTime);
  const base = dayjs(baseDateTime);
  if (!target.isValid()) return "";
  if (!base.isValid()) return "";

  const diffMinutes = base.diff(target, "minute");
  if (diffMinutes < 1) return "たった今";
  if (diffMinutes < 60) return `${diffMinutes}分前`;

  const diffHours = base.diff(target, "hour");
  if (diffHours < 24) return `${diffHours}時間前`;

  const diffDays = base.diff(target, "day");
  if (diffDays < 7) return `${diffDays}日前`;

  return target.format("YYYY/MM/DD HH:mm");
};

/**
 * 日付キーをカプセルバッジ用の表示ラベルに変換する
 * @param dateKey "YYYY-MM-DD" 形式の日付キー
 * @returns "M/D(曜)" 形式のラベル (例: "10/25(日)"、空文字・不正値の場合は "")
 */
export const dateFormatBadgeLabel = (dateKey: DateKey): string => {
  if (dateKey === "") return "";
  const parsed = dayjs(dateKey);
  if (!parsed.isValid()) return "";
  return `${parsed.format("M/D")}(${WEEKDAY_LABELS[parsed.day()]})`;
};

/**
 * 日付キーを "M/D" 形式に変換する
 * @param dateKey "YYYY-MM-DD" 形式の日付キー
 * @returns "M/D" 形式の文字列 (例: "10/25"、空文字・不正値の場合は "")
 */
export const dateFormatMonthDay = (dateKey: DateKey): string => {
  if (dateKey === "") return "";
  const parsed = dayjs(dateKey);
  if (!parsed.isValid()) return "";
  return parsed.format("M/D");
};

/**
 * 日付キーを曜日1文字に変換する
 * @param dateKey "YYYY-MM-DD" 形式の日付キー
 * @returns 曜日 (例: "日"、空文字・不正値の場合は "")
 */
export const dateFormatWeekday = (dateKey: DateKey): string => {
  if (dateKey === "") return "";
  const parsed = dayjs(dateKey);
  if (!parsed.isValid()) return "";
  return WEEKDAY_LABELS[parsed.day()];
};

/**
 * 日付キーに日数を加算する
 * @param dateKey "YYYY-MM-DD" 形式の日付キー
 * @param days 加算する日数 (負数で減算)
 * @returns 加算後の日付キー (空文字・不正値の場合は "")
 */
export const dateAddDays = (dateKey: DateKey, days: number): DateKey => {
  if (dateKey === "") return "";
  const parsed = dayjs(dateKey);
  if (!parsed.isValid()) return "";
  return parsed.add(days, "day").format("YYYY-MM-DD");
};

/**
 * メモ入力ダイアログの初期日付を決定する (直前入力日が今日以降ならそれを、未入力・過去日なら今日を返す)
 * @param lastInputDateKey 直前に入力した日付 (未入力は "")
 * @param todayKey 今日の日付キー
 * @returns 初期表示する日付キー
 */
export const dateResolveMemoInputDefault = (lastInputDateKey: DateKey, todayKey: DateKey): DateKey => {
  if (lastInputDateKey === "") return todayKey;
  if (!dayjs(lastInputDateKey).isValid()) return todayKey;
  if (lastInputDateKey < todayKey) return todayKey;
  return lastInputDateKey;
};

/**
 * 新規メモを登録できる最終日を返す (基準日の月から指定か月先の月末)
 * @param baseDateKey 基準日 (通常は今日)
 * @param futureMonthCount 何か月先まで登録可能とするか
 * @returns "YYYY-MM-DD" 形式の最終日 (例: 基準日 2026-10-25・3か月 → "2027-01-31"、空文字・不正値の場合は "")
 */
export const dateMaxRegistrableKey = (baseDateKey: DateKey, futureMonthCount: number): DateKey => {
  if (baseDateKey === "") return "";
  const base = dayjs(baseDateKey);
  if (!base.isValid()) return "";
  return base.startOf("month").add(futureMonthCount, "month").endOf("month").format("YYYY-MM-DD");
};

/**
 * 月を英語略称＋季節絵文字の表示ラベルに変換する (登録データ一覧の月リスト用)
 * @param month 月 (1〜12)
 * @returns "Oct 🍁" 形式のラベル (範囲外の場合は "")
 */
export const dateFormatMonthLabel = (month: number): string => {
  const abbreviation = MONTH_ABBREVIATIONS[month];
  if (!abbreviation) return "";
  return `${abbreviation} ${MONTH_SEASON_EMOJIS[month]}`;
};

/**
 * 日時を一定間隔の区切り (UNIX 時刻 0 起点) に切り捨てる
 * - 署名付きURLの署名日時をそろえ、同じ区間内では同一URLを返す (ブラウザキャッシュを効かせる) 用途
 * @param now 基準日時
 * @param windowSeconds 区切りの間隔 (秒)
 * @returns 区間の開始日時
 */
export const dateFloorToWindow = (now: Date, windowSeconds: number): Date => {
  const windowMs = windowSeconds * 1000;
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
};
