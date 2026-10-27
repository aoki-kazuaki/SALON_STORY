import { describe, expect, it } from "vitest";

import { UNIT_TEST_BASE_DATE_KEY, UNIT_TEST_INVALID_DATE } from "@/constants/unitTest";

import {
  boolIsCurrentMonth,
  boolIsEmailIdentifier,
  boolIsFutureMonth,
  boolIsPastDate,
  boolIsValidYearMonth,
  boolIsWithinRegistrableMonth,
} from "./boolean";

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

describe("boolIsEmailIdentifier", () => {
  it.each([
    ["owner@example.com", true],
    ["salon_owner", false],
    ["salon.owner", false],
    ["", false],
  ])("%j → %s", (identifier, expected) => {
    expect(boolIsEmailIdentifier(identifier)).toBe(expected);
  });
});

describe("boolIsCurrentMonth", () => {
  it.each([
    [2026, 10, true],
    [2026, 11, false],
    [2025, 10, false],
  ])("%s年%s月 → %s", (year, month, expected) => {
    expect(boolIsCurrentMonth(year, month, UNIT_TEST_BASE_DATE_KEY)).toBe(expected);
  });

  it("基準日が空文字・不正値は false を返す", () => {
    expect(boolIsCurrentMonth(2026, 10, "")).toBe(false);
    expect(boolIsCurrentMonth(2026, 10, UNIT_TEST_INVALID_DATE)).toBe(false);
  });
});

describe("boolIsWithinRegistrableMonth", () => {
  it.each([
    [2025, 1, true],
    [2026, 10, true],
    [2027, 1, true],
    [2027, 2, false],
    [2028, 10, false],
  ])("%s年%s月 → %s (3か月先まで)", (year, month, expected) => {
    expect(boolIsWithinRegistrableMonth(year, month, UNIT_TEST_BASE_DATE_KEY, 3)).toBe(expected);
  });

  it("基準日・年月が不正な場合は false を返す", () => {
    expect(boolIsWithinRegistrableMonth(2026, 10, "", 3)).toBe(false);
    expect(boolIsWithinRegistrableMonth(2026, 13, UNIT_TEST_BASE_DATE_KEY, 3)).toBe(false);
  });
});
