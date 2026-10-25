import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import CTextarea from ".";

describe("CTextarea", () => {
  it("改行を含む入力を保持する", async () => {
    render(<CTextarea aria-label="メモ" />);
    const textarea = screen.getByRole("textbox", { name: "メモ" });
    await userEvent.type(textarea, "13:00〜{enter}2名まで");
    expect(textarea).toHaveValue("13:00〜\n2名まで");
  });
});
