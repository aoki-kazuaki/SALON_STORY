import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  UNIT_TEST_BACKGROUND_URL,
  UNIT_TEST_BADGE_ITEMS,
  UNIT_TEST_LEGEND_TEXT,
  UNIT_TEST_LEGEND_TITLE,
} from "@/constants/unitTest";
import type { StoryBadgeItem } from "@/types";

import StoryCanvas from ".";

/** テスト共通の Props */
const BASE_PROPS = {
  backgroundImageUrl: UNIT_TEST_BACKGROUND_URL,
  items: UNIT_TEST_BADGE_ITEMS,
  legendTitle: UNIT_TEST_LEGEND_TITLE,
  legendText: UNIT_TEST_LEGEND_TEXT,
};

/** 指定件数のバッジを生成する */
const createItems = (count: number): StoryBadgeItem[] =>
  Array.from({ length: count }, (_, index) => ({
    dateKey: `2026-10-${String(index + 1).padStart(2, "0")}`,
    label: `10/${index + 1}`,
    descriptionLines: ["10:00", "13:15"],
    markText: "月",
    variant: "current",
  }));

describe("StoryCanvas", () => {
  it("9:16 のキャンバスとして描画し、見出しは表示しない", () => {
    render(<StoryCanvas {...BASE_PROPS} />);
    expect(screen.getByTestId("story-canvas")).toHaveClass("aspect-[9/16]");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("バッジを件数分、渡された順に日付・メモの各行付きで表示する", () => {
    render(<StoryCanvas {...BASE_PROPS} />);
    const listItems = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(listItems).toHaveLength(UNIT_TEST_BADGE_ITEMS.length);
    expect(listItems.map((item) => item.textContent)).toEqual(
      UNIT_TEST_BADGE_ITEMS.map((item) => `${item.markText}${item.label}${item.descriptionLines.join("")}`),
    );
  });

  it.each([
    [6, "lg", "columns-1"],
    [7, "md", "columns-2"],
    [13, "sm", "columns-2"],
  ])("%i件の場合は表示密度 %s (%s) で表示する", (count, density, columnsClass) => {
    render(<StoryCanvas {...BASE_PROPS} items={createItems(count)} />);
    expect(screen.getByTestId("story-canvas")).toHaveAttribute("data-density", density);
    expect(screen.getByRole("list")).toHaveClass(columnsClass);
  });

  it("バッジが0件の場合は空のリストを表示する", () => {
    render(<StoryCanvas {...BASE_PROPS} items={[]} />);
    expect(within(screen.getByRole("list")).queryAllByRole("listitem")).toHaveLength(0);
  });

  it("凡例カードを表示する", () => {
    render(<StoryCanvas {...BASE_PROPS} />);
    expect(screen.getByText(UNIT_TEST_LEGEND_TITLE)).toBeInTheDocument();
  });

  it("凡例本文が空 (空白・改行のみを含む) の場合は凡例カードごと表示しない", () => {
    render(<StoryCanvas {...BASE_PROPS} legendText={" \n "} />);
    expect(screen.queryByText(UNIT_TEST_LEGEND_TITLE)).not.toBeInTheDocument();
  });

  it("内容が高さに収まる場合は縮小せず、はみ出し通知もしない", () => {
    const handleOverflowChange = vi.fn();
    render(<StoryCanvas {...BASE_PROPS} onOverflowChange={handleOverflowChange} />);
    expect(screen.getByTestId("story-canvas-fit-area").style.getPropertyValue("--fit-scale")).toBe("1");
    expect(handleOverflowChange).not.toHaveBeenCalled();
  });

  describe("内容が高さを超える場合", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("縮小の下限でも収まらなければ、下限まで縮小してはみ出しを通知する", () => {
      vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(500);
      vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(300);
      const handleOverflowChange = vi.fn();
      render(<StoryCanvas {...BASE_PROPS} onOverflowChange={handleOverflowChange} />);
      expect(screen.getByTestId("story-canvas-fit-area").style.getPropertyValue("--fit-scale")).toBe("0.55");
      expect(handleOverflowChange).toHaveBeenCalledWith(true);
    });
  });

  it("背景画像URLを背景に設定する", () => {
    render(<StoryCanvas {...BASE_PROPS} />);
    expect(screen.getByTestId("story-canvas-background").style.backgroundImage).toContain(UNIT_TEST_BACKGROUND_URL);
  });

  it("背景画像URLが空文字の場合は背景画像レイヤーを描画しない", () => {
    render(<StoryCanvas {...BASE_PROPS} backgroundImageUrl="" />);
    expect(screen.queryByTestId("story-canvas-background")).not.toBeInTheDocument();
  });
});
