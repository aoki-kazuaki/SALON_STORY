import { describe, expect, it } from "vitest";

import { UNIT_TEST_BASE_DATE_KEY } from "@/constants/unitTest";
import type { ScheduleMemo } from "@/types";

import {
  arrayBuildBreadcrumbs,
  arrayBuildMonthDays,
  arrayBuildMonthOptions,
  arrayBuildScheduleYearSummaries,
  arrayBuildStoryBadgeItems,
  arraySplitLines,
} from "./array";

/** テスト用のメモを生成する */
const createMemo = (dateKey: string, content: string): ScheduleMemo => ({
  id: `id-${dateKey}`,
  dateKey,
  content,
  updatedAt: "2026-10-01T00:00:00.000Z",
});

describe("arrayBuildScheduleYearSummaries", () => {
  it("年降順・月降順で件数を集計する", () => {
    const result = arrayBuildScheduleYearSummaries(["2025-03-01", "2026-01-05", "2026-10-25", "2026-10-26"]);
    expect(result).toEqual([
      {
        year: 2026,
        months: [
          { month: 10, count: 2 },
          { month: 1, count: 1 },
        ],
      },
      { year: 2025, months: [{ month: 3, count: 1 }] },
    ]);
  });

  it("データがない場合は空配列を返す", () => {
    expect(arrayBuildScheduleYearSummaries([])).toEqual([]);
  });
});

describe("arrayBuildMonthDays", () => {
  it("当月の全日分を生成し、未入力日は空のメモで補完する", () => {
    const result = arrayBuildMonthDays(2026, 2, [createMemo("2026-02-10", "13:00〜")]);
    expect(result).toHaveLength(28);
    expect(result[0]).toEqual({ id: "", dateKey: "2026-02-01", content: "", updatedAt: null });
    expect(result[9].content).toBe("13:00〜");
  });
});

describe("arrayBuildBreadcrumbs", () => {
  it("ダッシュボード配下の階層をラベルに変換する", () => {
    expect(arrayBuildBreadcrumbs("/dashboard/backgrounds")).toEqual([
      { label: "ダッシュボード", href: "/dashboard" },
      { label: "背景画像管理", href: "/dashboard/backgrounds" },
    ]);
  });

  it("月別一覧の年/月は1階層にまとめる", () => {
    expect(arrayBuildBreadcrumbs("/dashboard/records/2026/10")).toEqual([
      { label: "ダッシュボード", href: "/dashboard" },
      { label: "登録データ一覧", href: "/dashboard/records" },
      { label: "2026年10月", href: "/dashboard/records/2026/10" },
    ]);
  });

  it("該当がない場合は空配列を返す", () => {
    expect(arrayBuildBreadcrumbs("/")).toEqual([]);
  });
});

describe("arrayBuildMonthOptions", () => {
  it("年月の集計をセレクトの選択肢に変換する", () => {
    const years = [
      { year: 2026, months: [{ month: 10, count: 3 }] },
      { year: 2025, months: [{ month: 2, count: 1 }] },
    ];
    expect(arrayBuildMonthOptions(years)).toEqual([
      { value: "2026-10", label: "2026年10月 (3件)" },
      { value: "2025-02", label: "2025年2月 (1件)" },
    ]);
  });
});

describe("arraySplitLines", () => {
  it("行ごとに分割し、前後の空白と空行を除去する", () => {
    expect(arraySplitLines(" 10:00 \r\n\n13:15\n  \n14:00\n")).toEqual(["10:00", "13:15", "14:00"]);
  });

  it("空文字・空白のみの場合は空配列を返す", () => {
    expect(arraySplitLines("")).toEqual([]);
    expect(arraySplitLines(" \n ")).toEqual([]);
  });
});

describe("arrayBuildStoryBadgeItems", () => {
  const memos = [
    createMemo("2026-10-26", "13:00〜\n2名まで"),
    createMemo("2026-10-27", ""),
    createMemo("2026-10-28", "15:00〜"),
    createMemo("2026-11-02", "終日OK"),
  ];

  it("本文が空のメモと除外日を除き、曜日・日付・メモの各行でバッジを生成する", () => {
    const result = arrayBuildStoryBadgeItems(memos, new Set(["2026-10-28"]), UNIT_TEST_BASE_DATE_KEY);
    expect(result).toEqual([
      {
        dateKey: "2026-10-26",
        label: "10/26",
        descriptionLines: ["13:00〜", "2名まで"],
        markText: "月",
        variant: "current",
      },
      { dateKey: "2026-11-02", label: "11/2", descriptionLines: ["終日OK"], markText: "月", variant: "future" },
    ]);
  });

  it("各行の前後の空白と空行を除去する", () => {
    const result = arrayBuildStoryBadgeItems(
      [createMemo("2026-10-26", " 10:00 \r\n\n 13:15\n")],
      new Set(),
      UNIT_TEST_BASE_DATE_KEY,
    );
    expect(result[0].descriptionLines).toEqual(["10:00", "13:15"]);
  });

  it("対象がない場合は空配列を返す", () => {
    expect(arrayBuildStoryBadgeItems([], new Set(), UNIT_TEST_BASE_DATE_KEY)).toEqual([]);
  });
});
