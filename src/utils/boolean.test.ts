import { describe, expect, it } from "vitest";

import { UNIT_TEST_BASE_DATE_KEY, UNIT_TEST_INVALID_DATE } from "@/constants/unitTest";

import { boolIsFutureMonth, boolIsPastDate, boolIsValidYearMonth } from "./boolean";

describe("boolIsFutureMonth", () => {
  it.each([
    ["2026-10-01", false],
    ["2026-10-31", false],
    ["2026-09-30", false],
    ["2026-11-01", true],
    ["2027-01-15", true],
  ])("%s → %s", (dateKey, expected) => {
    expect(boolIsFutureMonth(dateKey, UNIT_TEST_BASE_DATE_KEY)).toBe(expected);
  });

  it("不正値は false を返す", () => {
    expect(boolIsFutureMonth(UNIT_TEST_INVALID_DATE, UNIT_TEST_BASE_DATE_KEY)).toBe(false);
    expect(boolIsFutureMonth("2026-11-01", UNIT_TEST_INVALID_DATE)).toBe(false);
  });
});

describe("boolIsValidYearMonth", () => {
  it.each([
    [2026, 10, true],
    [2026, 1, true],
    [2026, 12, true],
    [2026, 0, false],
    [2026, 13, false],
    [1999, 5, false],
    [2101, 5, false],
    [Number.NaN, 5, false],
    [2026, 1.5, false],
  ])("%s年%s月 → %s", (year, month, expected) => {
    expect(boolIsValidYearMonth(year, month)).toBe(expected);
  });
});

describe("boolIsPastDate", () => {
  it.each([
    ["2026-10-24", true],
    ["2026-10-25", false],
    ["2026-10-26", false],
  ])("%s → %s", (dateKey, expected) => {
    expect(boolIsPastDate(dateKey, UNIT_TEST_BASE_DATE_KEY)).toBe(expected);
  });

  it("不正値は false を返す", () => {
    expect(boolIsPastDate(UNIT_TEST_INVALID_DATE, UNIT_TEST_BASE_DATE_KEY)).toBe(false);
  });
});
