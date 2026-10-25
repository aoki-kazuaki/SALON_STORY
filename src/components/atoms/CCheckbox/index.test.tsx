import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CCheckbox from ".";

describe("CCheckbox", () => {
  it("チェック状態を表示する", () => {
    render(<CCheckbox aria-label="10/26" checked onCheckedChange={vi.fn()} />);
    expect(screen.getByRole("checkbox", { name: "10/26" })).toBeChecked();
  });

  it("クリックで反転した boolean を通知する", async () => {
    const handleChange = vi.fn();
    render(<CCheckbox aria-label="10/26" checked onCheckedChange={handleChange} />);
    await userEvent.click(screen.getByRole("checkbox", { name: "10/26" }));
    expect(handleChange).toHaveBeenCalledWith(false);
  });
});
