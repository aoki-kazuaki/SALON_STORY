import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { UNIT_TEST_PASSWORD } from "@/constants/unitTest";

import CPasswordInput from ".";

describe("CPasswordInput", () => {
  it("初期状態では入力内容を隠す", () => {
    render(<CPasswordInput aria-label="パスワード" />);
    expect(screen.getByLabelText("パスワード")).toHaveAttribute("type", "password");
  });

  it("切り替えボタンで表示・非表示を切り替え、入力値は保持する", async () => {
    render(<CPasswordInput aria-label="パスワード" />);
    const input = screen.getByLabelText("パスワード");
    await userEvent.type(input, UNIT_TEST_PASSWORD);

    await userEvent.click(screen.getByRole("button", { name: "パスワードを表示" }));
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue(UNIT_TEST_PASSWORD);

    await userEvent.click(screen.getByRole("button", { name: "パスワードを隠す" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("disabled の場合は切り替えボタンも押せない", () => {
    render(<CPasswordInput aria-label="パスワード" disabled />);
    expect(screen.getByRole("button", { name: "パスワードを表示" })).toBeDisabled();
  });
});
