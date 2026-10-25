import { describe, expect, it } from "vitest";

import { UNIT_TEST_BASE_DATE_KEY } from "@/constants/unitTest";

import { objectBuildEditorRange, objectBuildMonthRange } from "./object";

/** 選択状態の基本値 */
const BASE_SELECTION = {
  rangeMode: "month" as const,
  targetMonth: "2026-10",
  includePastDates: false,
  periodStartDate: null,
  periodDays: 14,
};

describe("objectBuildMonthRange", () => {
  it("1日〜末日 (うるう年を考慮) を返す", () => {
    expect(objectBuildMonthRange(2028, 2)).toEqual({ startDate: "2028-02-01", endDate: "2028-02-29" });
    expect(objectBuildMonthRange(2026, 12)).toEqual({ startDate: "2026-12-01", endDate: "2026-12-31" });
  });
});

describe("objectBuildEditorRange", () => {
  it("月指定 (過去日を含めない) は今日〜月末", () => {
    expect(objectBuildEditorRange(BASE_SELECTION, UNIT_TEST_BASE_DATE_KEY)).toEqual({
      startDate: "2026-10-25",
      endDate: "2026-10-31",
    });
  });

  it("月指定 (過去日を含める) は1日〜月末", () => {
    expect(objectBuildEditorRange({ ...BASE_SELECTION, includePastDates: true }, UNIT_TEST_BASE_DATE_KEY)).toEqual({
      startDate: "2026-10-01",
      endDate: "2026-10-31",
    });
  });

  it("月指定で未来月の場合は1日〜月末", () => {
    expect(objectBuildEditorRange({ ...BASE_SELECTION, targetMonth: "2027-02" }, UNIT_TEST_BASE_DATE_KEY)).toEqual({
      startDate: "2027-02-01",
      endDate: "2027-02-28",
    });
  });

  it("月未選択の場合は空文字", () => {
    expect(objectBuildEditorRange({ ...BASE_SELECTION, targetMonth: "" }, UNIT_TEST_BASE_DATE_KEY)).toEqual({
      startDate: "",
      endDate: "",
    });
  });

  it("期間指定は開始日から日数分 (開始日未選択は今日から)", () => {
    expect(
      objectBuildEditorRange(
        { ...BASE_SELECTION, rangeMode: "period", periodStartDate: "2026-10-30", periodDays: 7 },
        UNIT_TEST_BASE_DATE_KEY,
      ),
    ).toEqual({ startDate: "2026-10-30", endDate: "2026-11-05" });
    expect(objectBuildEditorRange({ ...BASE_SELECTION, rangeMode: "period" }, UNIT_TEST_BASE_DATE_KEY)).toEqual({
      startDate: "2026-10-25",
      endDate: "2026-11-07",
    });
  });
});
