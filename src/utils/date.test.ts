import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UNIT_TEST_BASE_DATE_KEY, UNIT_TEST_BASE_DATE_TIME, UNIT_TEST_INVALID_DATE } from "@/constants/unitTest";

import {
  dateAddDays,
  dateCurrentTimeStamp,
  dateFloorToWindow,
  dateFormatBadgeLabel,
  dateFormatKey,
  dateFormatMonthDay,
  dateFormatMonthLabel,
  dateFormatRelative,
  dateFormatWeekday,
  dateMaxRegistrableKey,
  dateResolveMemoInputDefault,
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

describe("dateFormatMonthDay / dateFormatWeekday / dateAddDays", () => {
  it("M/D 形式・曜日・日数加算を返す", () => {
    expect(dateFormatMonthDay("2026-11-02")).toBe("11/2");
    expect(dateFormatWeekday(UNIT_TEST_BASE_DATE_KEY)).toBe("日");
    expect(dateAddDays("2026-10-30", 3)).toBe("2026-11-02");
    expect(dateAddDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("空文字・不正値は空文字を返す", () => {
    expect(dateFormatMonthDay("")).toBe("");
    expect(dateFormatWeekday(UNIT_TEST_INVALID_DATE)).toBe("");
    expect(dateAddDays("", 1)).toBe("");
  });
});

describe("dateResolveMemoInputDefault", () => {
  it.each([
    ["", UNIT_TEST_BASE_DATE_KEY],
    ["2026-10-24", UNIT_TEST_BASE_DATE_KEY],
    ["2026-10-25", "2026-10-25"],
    ["2026-11-03", "2026-11-03"],
    [UNIT_TEST_INVALID_DATE, UNIT_TEST_BASE_DATE_KEY],
  ])("直前入力日 %s → %s", (lastInputDateKey, expected) => {
    expect(dateResolveMemoInputDefault(lastInputDateKey, UNIT_TEST_BASE_DATE_KEY)).toBe(expected);
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

describe("dateFloorToWindow", () => {
  /** 3日 (秒) */
  const THREE_DAYS_SECONDS = 60 * 60 * 24 * 3;

  it("同じ区間内の日時は同じ区間開始日時になる", () => {
    const start = dateFloorToWindow(new Date("2026-10-25T00:00:00Z"), THREE_DAYS_SECONDS);
    const later = dateFloorToWindow(new Date(start.getTime() + 1000 * (THREE_DAYS_SECONDS - 1)), THREE_DAYS_SECONDS);
    expect(later.getTime()).toBe(start.getTime());
  });

  it("区間の境界を越えると次の区間開始日時になる", () => {
    const start = dateFloorToWindow(new Date("2026-10-25T00:00:00Z"), THREE_DAYS_SECONDS);
    const next = dateFloorToWindow(new Date(start.getTime() + 1000 * THREE_DAYS_SECONDS), THREE_DAYS_SECONDS);
    expect(next.getTime() - start.getTime()).toBe(1000 * THREE_DAYS_SECONDS);
  });

  it("区間開始日時は基準日時以前で、区間の長さ未満しか離れない", () => {
    const now = new Date("2026-10-26T13:45:12Z");
    const start = dateFloorToWindow(now, THREE_DAYS_SECONDS);
    expect(start.getTime()).toBeLessThanOrEqual(now.getTime());
    expect(now.getTime() - start.getTime()).toBeLessThan(1000 * THREE_DAYS_SECONDS);
  });
});

describe("dateMaxRegistrableKey", () => {
  it.each([
    [UNIT_TEST_BASE_DATE_KEY, 3, "2027-01-31"],
    ["2026-10-01", 3, "2027-01-31"],
    ["2026-11-30", 3, "2027-02-28"],
    ["2027-10-31", 4, "2028-02-29"],
    [UNIT_TEST_BASE_DATE_KEY, 0, "2026-10-31"],
  ])("基準日 %s・%iか月 → %s", (baseDateKey, futureMonthCount, expected) => {
    expect(dateMaxRegistrableKey(baseDateKey, futureMonthCount)).toBe(expected);
  });

  it("空文字・不正値は空文字を返す", () => {
    expect(dateMaxRegistrableKey("", 3)).toBe("");
    expect(dateMaxRegistrableKey(UNIT_TEST_INVALID_DATE, 3)).toBe("");
  });
});
