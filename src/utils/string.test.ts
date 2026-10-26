import { describe, expect, it } from "vitest";

import type { BackgroundSlot, BackgroundSlotNumber } from "@/types";

import { stringResolveBackgroundUrl, stringResolveDefaultTargetMonth, stringResolveStoryDensity } from "./string";

/** フォールバックURL */
const FALLBACK_URL = "https://example.com/fallback.jpg";

/** テスト用のスロットを生成する */
const createSlot = (slotNumber: BackgroundSlotNumber): BackgroundSlot => ({
  slotNumber,
  objectKey: `key-${slotNumber}`,
  imageUrl: `https://example.com/slot${slotNumber}.jpg`,
  updatedAt: null,
});

describe("stringResolveBackgroundUrl", () => {
  it("選択中のスロットが登録済みならその画像を返す", () => {
    expect(stringResolveBackgroundUrl([createSlot(1), createSlot(3)], 3, FALLBACK_URL)).toBe(createSlot(3).imageUrl);
  });

  it("未選択・削除済みの場合はスロット1へフォールバックする", () => {
    expect(stringResolveBackgroundUrl([createSlot(1), createSlot(3)], null, FALLBACK_URL)).toBe(createSlot(1).imageUrl);
    expect(stringResolveBackgroundUrl([createSlot(1), createSlot(3)], 2, FALLBACK_URL)).toBe(createSlot(1).imageUrl);
  });

  it("スロット1も未登録の場合は登録済みの先頭スロットを返す", () => {
    expect(stringResolveBackgroundUrl([createSlot(4)], null, FALLBACK_URL)).toBe(createSlot(4).imageUrl);
  });

  it("0枚の場合はフォールバックURLを返す", () => {
    expect(stringResolveBackgroundUrl([], 1, FALLBACK_URL)).toBe(FALLBACK_URL);
  });
});

describe("stringResolveDefaultTargetMonth", () => {
  it("今月のデータがあれば今月を返す", () => {
    expect(stringResolveDefaultTargetMonth(["2026-11", "2026-10", "2026-08"], "2026-10-25")).toBe("2026-10");
  });

  it("今月がなければ今月以降で最も近い月を返す", () => {
    expect(stringResolveDefaultTargetMonth(["2027-01", "2026-12", "2026-08"], "2026-10-25")).toBe("2026-12");
  });

  it("今月以降がなければ最新の月、データなしは空文字を返す", () => {
    expect(stringResolveDefaultTargetMonth(["2026-08", "2026-05"], "2026-10-25")).toBe("2026-08");
    expect(stringResolveDefaultTargetMonth([], "2026-10-25")).toBe("");
  });
});

describe("stringResolveStoryDensity", () => {
  it.each([
    [0, "lg"],
    [6, "lg"],
    [7, "md"],
    [12, "md"],
    [13, "sm"],
    [31, "sm"],
  ])("%i件 → %s", (itemCount, expected) => {
    expect(stringResolveStoryDensity(itemCount)).toBe(expected);
  });
});
