import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UNIT_TEST_BADGE_LABEL, UNIT_TEST_BADGE_MARK } from "@/constants/unitTest";

import CapsuleBadge from ".";

describe("CapsuleBadge", () => {
  it("ラベルと丸バッジ記号を表示する", () => {
    render(<CapsuleBadge label={UNIT_TEST_BADGE_LABEL} markText={UNIT_TEST_BADGE_MARK} variant="current" />);
    expect(screen.getByText(UNIT_TEST_BADGE_LABEL)).toBeInTheDocument();
    expect(screen.getByText(UNIT_TEST_BADGE_MARK)).toBeInTheDocument();
  });

  it("当月 (current) は白背景黒文字、丸バッジは反転配色", () => {
    const { container } = render(
      <CapsuleBadge label={UNIT_TEST_BADGE_LABEL} markText={UNIT_TEST_BADGE_MARK} variant="current" />,
    );
    expect(container.firstElementChild).toHaveClass("bg-white", "text-black");
    expect(screen.getByText(UNIT_TEST_BADGE_MARK)).toHaveClass("bg-black", "text-white");
  });

  it("次月以降 (future) は黒背景白文字、丸バッジは反転配色", () => {
    const { container } = render(
      <CapsuleBadge label={UNIT_TEST_BADGE_LABEL} markText={UNIT_TEST_BADGE_MARK} variant="future" />,
    );
    expect(container.firstElementChild).toHaveClass("bg-black", "text-white");
    expect(screen.getByText(UNIT_TEST_BADGE_MARK)).toHaveClass("bg-white", "text-black");
  });

  it("atoms のため大外 div を持たない", () => {
    const { container } = render(
      <CapsuleBadge label={UNIT_TEST_BADGE_LABEL} markText={UNIT_TEST_BADGE_MARK} variant="current" />,
    );
    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });
});
