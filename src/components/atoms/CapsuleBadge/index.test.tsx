import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UNIT_TEST_BADGE_DESCRIPTION_LINES, UNIT_TEST_BADGE_LABEL, UNIT_TEST_BADGE_MARK } from "@/constants/unitTest";
import type { StoryBadgeVariant, StoryDensity } from "@/types";

import CapsuleBadge from ".";

/** テスト用にバッジを描画する */
const renderBadge = (variant: StoryBadgeVariant, density: StoryDensity) =>
  render(
    <CapsuleBadge
      label={UNIT_TEST_BADGE_LABEL}
      descriptionLines={UNIT_TEST_BADGE_DESCRIPTION_LINES}
      markText={UNIT_TEST_BADGE_MARK}
      variant={variant}
      density={density}
    />,
  );

describe("CapsuleBadge", () => {
  it("日付ラベル・丸バッジ記号を表示する", () => {
    renderBadge("current", "lg");
    expect(screen.getByText(UNIT_TEST_BADGE_LABEL)).toBeInTheDocument();
    expect(screen.getByText(UNIT_TEST_BADGE_MARK)).toBeInTheDocument();
  });

  it("メモの各行を省略せず、折り返し可能なかたまりとして表示する", () => {
    renderBadge("current", "lg");
    UNIT_TEST_BADGE_DESCRIPTION_LINES.forEach((line) => {
      const element = screen.getByText(line);
      expect(element).toHaveClass("break-words", "max-w-full");
      expect(element).not.toHaveClass("truncate");
    });
    expect(screen.getByText(UNIT_TEST_BADGE_DESCRIPTION_LINES[0]).parentElement).toHaveClass("flex-wrap");
  });

  it("当月 (current) は白背景黒文字、丸バッジは反転配色", () => {
    const { container } = renderBadge("current", "lg");
    expect(container.firstElementChild).toHaveClass("bg-white", "text-black");
    expect(screen.getByText(UNIT_TEST_BADGE_MARK)).toHaveClass("bg-black", "text-white");
  });

  it("次月以降 (future) は黒背景白文字、丸バッジは反転配色", () => {
    const { container } = renderBadge("future", "lg");
    expect(container.firstElementChild).toHaveClass("bg-black", "text-white");
    expect(screen.getByText(UNIT_TEST_BADGE_MARK)).toHaveClass("bg-white", "text-black");
  });

  it.each([
    ["lg", "text-[length:calc(var(--u,1cqw)*4.8)]"],
    ["md", "text-[length:calc(var(--u,1cqw)*3.6)]"],
    ["sm", "text-[length:calc(var(--u,1cqw)*3.1)]"],
  ] as const)("表示密度 %s では文字サイズ %s (自動縮小率に連動) で表示する", (density, className) => {
    renderBadge("current", density);
    expect(screen.getByText(UNIT_TEST_BADGE_LABEL).parentElement).toHaveClass(className);
  });

  it("atoms のため大外 div を持たない", () => {
    const { container } = renderBadge("current", "lg");
    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });
});
