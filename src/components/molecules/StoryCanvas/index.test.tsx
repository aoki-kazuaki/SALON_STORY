import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  UNIT_TEST_BACKGROUND_URL,
  UNIT_TEST_BADGE_ITEMS,
  UNIT_TEST_LEGEND_TEXT,
  UNIT_TEST_LEGEND_TITLE,
} from "@/constants/unitTest";

import StoryCanvas from ".";

/** テスト共通の Props */
const BASE_PROPS = {
  backgroundImageUrl: UNIT_TEST_BACKGROUND_URL,
  subTitle: "AVAILABLE",
  title: "10月の空き状況",
  items: UNIT_TEST_BADGE_ITEMS,
  legendTitle: UNIT_TEST_LEGEND_TITLE,
  legendText: UNIT_TEST_LEGEND_TEXT,
};

describe("StoryCanvas", () => {
  it("9:16 のキャンバスとして描画する", () => {
    render(<StoryCanvas {...BASE_PROPS} />);
    expect(screen.getByTestId("story-canvas")).toHaveClass("aspect-[9/16]");
  });

  it("見出しと小見出しを表示する", () => {
    render(<StoryCanvas {...BASE_PROPS} />);
    expect(screen.getByRole("heading", { name: BASE_PROPS.title })).toBeInTheDocument();
    expect(screen.getByText(BASE_PROPS.subTitle)).toBeInTheDocument();
  });

  it("バッジを件数分、渡された順に表示する", () => {
    render(<StoryCanvas {...BASE_PROPS} />);
    const listItems = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(listItems).toHaveLength(UNIT_TEST_BADGE_ITEMS.length);
    expect(listItems.map((item) => item.textContent)).toEqual(
      UNIT_TEST_BADGE_ITEMS.map((item) => `${item.markText}${item.label}`),
    );
  });

  it("バッジが0件の場合は空のリストを表示する", () => {
    render(<StoryCanvas {...BASE_PROPS} items={[]} />);
    expect(within(screen.getByRole("list")).queryAllByRole("listitem")).toHaveLength(0);
  });

  it("凡例カードを表示する", () => {
    render(<StoryCanvas {...BASE_PROPS} />);
    expect(screen.getByText(UNIT_TEST_LEGEND_TITLE)).toBeInTheDocument();
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
