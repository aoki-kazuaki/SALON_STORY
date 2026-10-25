import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CSwitch from ".";

describe("CSwitch", () => {
  it("クリックで反転した状態を通知する", async () => {
    const handleChange = vi.fn();
    render(<CSwitch aria-label="過去日を含める" checked={false} onCheckedChange={handleChange} />);
    const toggle = screen.getByRole("switch", { name: "過去日を含める" });
    expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
