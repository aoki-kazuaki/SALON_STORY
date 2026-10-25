import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import CInput from ".";

describe("CInput", () => {
  it("入力した値を反映する", async () => {
    render(<CInput aria-label="ログインID" />);
    const input = screen.getByRole("textbox", { name: "ログインID" });
    await userEvent.type(input, "salon_owner");
    expect(input).toHaveValue("salon_owner");
  });

  it("type=date と min 属性を指定できる", () => {
    render(<CInput aria-label="日付" type="date" min="2026-10-25" />);
    expect(screen.getByLabelText("日付")).toHaveAttribute("min", "2026-10-25");
  });

  it("disabled の場合は入力できない", () => {
    render(<CInput aria-label="メール" disabled defaultValue="owner@example.com" />);
    expect(screen.getByRole("textbox", { name: "メール" })).toBeDisabled();
  });
});
