import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UNIT_TEST_BASE_DATE_KEY, UNIT_TEST_BASE_DATE_TIME, UNIT_TEST_INVALID_DATE } from "@/constants/unitTest";

import {
  dateCurrentTimeStamp,
  dateFormatBadgeLabel,
  dateFormatKey,
  dateFormatMonthLabel,
  dateFormatRelative,
  dateTodayKey,
} from "./date";

describe("dateCurrentTimeStamp / dateTodayKey", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 25, 12, 0, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("現在日時を YYYY-MM-DD HH:mm:ss 形式で返す", () => {
    expect(dateCurrentTimeStamp()).toBe(UNIT_TEST_BASE_DATE_TIME);
  });

  it("今日の日付キーを返す", () => {
    expect(dateTodayKey()).toBe(UNIT_TEST_BASE_DATE_KEY);
  });
});

describe("dateFormatKey", () => {
  it("日時文字列を日付キーに変換する", () => {
    expect(dateFormatKey(UNIT_TEST_BASE_DATE_TIME)).toBe(UNIT_TEST_BASE_DATE_KEY);
  });

  it("空文字・不正値は空文字を返す", () => {
    expect(dateFormatKey("")).toBe("");
    expect(dateFormatKey(UNIT_TEST_INVALID_DATE)).toBe("");
  });
});

describe("dateFormatRelative", () => {
  it.each([
    ["2026-10-25 11:59:30", "たった今"],
    ["2026-10-25 12:05:00", "たった今"],
    ["2026-10-25 11:55:00", "5分前"],
    ["2026-10-25 11:00:01", "59分前"],
    ["2026-10-25 09:00:00", "3時間前"],
    ["2026-10-24 12:00:01", "23時間前"],
    ["2026-10-22 12:00:00", "3日前"],
    ["2026-10-18 12:00:00", "2026/10/18 12:00"],
  ])("%s → %s", (target, expected) => {
    expect(dateFormatRelative(target, UNIT_TEST_BASE_DATE_TIME)).toBe(expected);
  });

  it("空文字・不正値は空文字を返す", () => {
    expect(dateFormatRelative("", UNIT_TEST_BASE_DATE_TIME)).toBe("");
    expect(dateFormatRelative(UNIT_TEST_INVALID_DATE, UNIT_TEST_BASE_DATE_TIME)).toBe("");
    expect(dateFormatRelative(UNIT_TEST_BASE_DATE_TIME, UNIT_TEST_INVALID_DATE)).toBe("");
  });
});

describe("dateFormatBadgeLabel", () => {
  it("M/D(曜) 形式のラベルを返す", () => {
    expect(dateFormatBadgeLabel(UNIT_TEST_BASE_DATE_KEY)).toBe("10/25(日)");
    expect(dateFormatBadgeLabel("2026-11-02")).toBe("11/2(月)");
  });

  it("空文字・不正値は空文字を返す", () => {
    expect(dateFormatBadgeLabel("")).toBe("");
    expect(dateFormatBadgeLabel(UNIT_TEST_INVALID_DATE)).toBe("");
  });
});

describe("dateFormatMonthLabel", () => {
  it.each([
    [1, "Jan ❄️"],
    [4, "Apr 🌸"],
    [7, "Jul 🌻"],
    [10, "Oct 🍁"],
    [12, "Dec ❄️"],
  ])("%i月 → %s", (month, expected) => {
    expect(dateFormatMonthLabel(month)).toBe(expected);
  });

  it("範囲外の月は空文字を返す", () => {
    expect(dateFormatMonthLabel(0)).toBe("");
    expect(dateFormatMonthLabel(13)).toBe("");
  });
});
