import dayjs from "dayjs";

import type {
  BreadcrumbItem,
  DateKey,
  ScheduleMemo,
  ScheduleYearSummary,
  StoryBadgeItem,
  StoryBadgeVariant,
} from "@/types";
import { boolIsFutureMonth } from "@/utils/boolean";
import { dateFormatMonthDay, dateFormatWeekday } from "@/utils/date";

/** パス階層ごとのパンくず表示ラベル */
const BREADCRUMB_SEGMENT_LABELS: Record<string, string> = {
  dashboard: "ダッシュボード",
  records: "登録データ一覧",
  backgrounds: "背景画像管理",
  editor: "ストーリーズエディタ",
  settings: "ユーザー設定",
  admin: "管理者メニュー",
};

/**
 * 日付キー一覧から、データが存在する年・月の集計を生成する
 * @param dateKeys 入力済みメモの日付キー一覧
 * @returns 年降順・月降順 (12月→1月) の集計 (該当なしは [])
 */
export const arrayBuildScheduleYearSummaries = (dateKeys: DateKey[]): ScheduleYearSummary[] => {
  const counts = new Map<number, Map<number, number>>();
  dateKeys.forEach((dateKey) => {
    const year = Number(dateKey.slice(0, 4));
    const month = Number(dateKey.slice(5, 7));
    const monthCounts = counts.get(year) ?? new Map<number, number>();
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1);
    counts.set(year, monthCounts);
  });

  return [...counts.entries()]
    .sort(([yearA], [yearB]) => yearB - yearA)
    .map(([year, monthCounts]) => ({
      year,
      months: [...monthCounts.entries()]
        .sort(([monthA], [monthB]) => monthB - monthA)
        .map(([month, count]) => ({ month, count })),
    }));
};

/**
 * 指定月の全日分のメモ一覧を生成する (未入力日は空のメモで補完)
 * @param year 西暦年
 * @param month 月 (1〜12)
 * @param memos 当月の入力済みメモ
 * @returns 1日〜末日のメモ一覧
 */
export const arrayBuildMonthDays = (year: number, month: number, memos: ScheduleMemo[]): ScheduleMemo[] => {
  const monthStart = dayjs(new Date(year, month - 1, 1));
  const memoByDate = new Map(memos.map((memo) => [memo.dateKey, memo]));
  return Array.from({ length: monthStart.daysInMonth() }, (_, index) => {
    const dateKey = monthStart.add(index, "day").format("YYYY-MM-DD");
    return memoByDate.get(dateKey) ?? { id: "", dateKey, content: "", updatedAt: null };
  });
};

/**
 * パス名からパンくずリストを生成する (月別一覧の "年/月" は1階層にまとめる)
 * @param pathname 現在のパス (例: "/dashboard/records/2026/10")
 * @returns パンくずリスト (該当なしは [])
 */
export const arrayBuildBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split("/").filter((segment) => !(segment === ""));
  const items: BreadcrumbItem[] = [];
  segments.forEach((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label = BREADCRUMB_SEGMENT_LABELS[segment];
    if (label) {
      items.push({ label, href });
      return;
    }
    /** 月別一覧 (records/年/月) の月階層かどうかの判定フラグ */
    const isRecordsMonthSegment: boolean =
      segments[index - 2] === "records" && /^\d{4}$/.test(segments[index - 1] ?? "") && /^\d{1,2}$/.test(segment);
    if (!isRecordsMonthSegment) return;
    items.push({ label: `${segments[index - 1]}年${Number(segment)}月`, href });
  });
  return items;
};

/**
 * 年・月の集計から、エディタの月指定セレクトの選択肢を生成する
 * @param years データが存在する年 (降順)
 * @returns 選択肢 (value: "YYYY-MM" / label: "YYYY年M月 (N件)")、データなしは []
 */
export const arrayBuildMonthOptions = (years: ScheduleYearSummary[]): { value: string; label: string }[] =>
  years.flatMap((yearSummary) =>
    yearSummary.months.map((monthSummary) => ({
      value: `${yearSummary.year}-${String(monthSummary.month).padStart(2, "0")}`,
      label: `${yearSummary.year}年${monthSummary.month}月 (${monthSummary.count}件)`,
    })),
  );

/**
 * 複数行テキストを行ごとに分割する (各行の前後の空白と空行は除去)
 * @param text 対象テキスト (改行コードは LF / CRLF どちらも可)
 * @returns 行の一覧 (空文字・空白のみの場合は [])
 */
export const arraySplitLines = (text: string): string[] =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => !(line === ""));

/** 翌月以降かどうかに対応するバッジのバリアント */
const BADGE_VARIANT_BY_FUTURE: Record<"true" | "false", StoryBadgeVariant> = {
  true: "future",
  false: "current",
};

/**
 * 入力済みメモからストーリーズキャンバス用のバッジ一覧を生成する
 * @param memos 抽出期間内のメモ (日付昇順)
 * @param excludedDateKeys チェックOFFで除外した日付キー
 * @param todayKey 今日の日付キー (当月/翌月以降の配色判定に利用)
 * @returns バッジ一覧 (丸バッジ: 曜日 / ピル: "M/D" ＋ メモの各行 (前後の空白・空行は除去))
 */
export const arrayBuildStoryBadgeItems = (
  memos: ScheduleMemo[],
  excludedDateKeys: Set<DateKey>,
  todayKey: DateKey,
): StoryBadgeItem[] =>
  memos
    .filter((memo) => !(memo.content.trim() === ""))
    .filter((memo) => !excludedDateKeys.has(memo.dateKey))
    .map((memo) => ({
      dateKey: memo.dateKey,
      label: dateFormatMonthDay(memo.dateKey),
      descriptionLines: arraySplitLines(memo.content),
      markText: dateFormatWeekday(memo.dateKey),
      variant: BADGE_VARIANT_BY_FUTURE[String(boolIsFutureMonth(memo.dateKey, todayKey)) as "true" | "false"],
    }));
