import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UNIT_TEST_LEGEND_TEXT, UNIT_TEST_LEGEND_TITLE } from "@/constants/unitTest";

import LegendCard from ".";

describe("LegendCard", () => {
  it("見出しと本文を表示する", () => {
    render(<LegendCard title={UNIT_TEST_LEGEND_TITLE} text={UNIT_TEST_LEGEND_TEXT} />);
    expect(screen.getByText(UNIT_TEST_LEGEND_TITLE)).toBeInTheDocument();
    expect(screen.getByText(/空きあり/)).toBeInTheDocument();
  });

  it("本文の改行を保持して表示する", () => {
    render(<LegendCard title="" text={UNIT_TEST_LEGEND_TEXT} />);
    const body = screen.getByText(/空きあり/);
    expect(body.textContent).toBe(UNIT_TEST_LEGEND_TEXT);
    expect(body).toHaveClass("whitespace-pre-wrap");
  });

  it("見出しが空文字の場合は見出しを表示しない", () => {
    const { container } = render(<LegendCard title="" text={UNIT_TEST_LEGEND_TEXT} />);
    expect(container.querySelectorAll("p")).toHaveLength(1);
  });

  it("molecules のため大外 div を持つ", () => {
    const { container } = render(<LegendCard title={UNIT_TEST_LEGEND_TITLE} text={UNIT_TEST_LEGEND_TEXT} />);
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });
});
