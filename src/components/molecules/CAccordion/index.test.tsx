import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CAccordion from ".";

/** テスト用の項目 */
const ITEMS = [
  { value: "2026", trigger: "2026年", content: "2026年の内容" },
  { value: "2025", trigger: "2025年", content: "2025年の内容" },
];

describe("CAccordion", () => {
  it("value に含まれる項目のみ開いて表示する", () => {
    render(<CAccordion items={ITEMS} value={["2026"]} onValueChange={vi.fn()} />);
    expect(screen.getByText("2026年の内容")).toBeVisible();
    expect(screen.queryByText("2025年の内容")).not.toBeInTheDocument();
  });

  it("見出しのクリックで開閉後の value を通知する", async () => {
    const handleChange = vi.fn();
    render(<CAccordion items={ITEMS} value={["2026"]} onValueChange={handleChange} />);
    await userEvent.click(screen.getByRole("button", { name: "2025年" }));
    expect(handleChange).toHaveBeenCalledWith(["2026", "2025"]);
  });
});
