import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CButton from ".";

describe("CButton", () => {
  it("ラベルを表示し、type の既定値は button", () => {
    render(<CButton>保存</CButton>);
    expect(screen.getByRole("button", { name: "保存" })).toHaveAttribute("type", "button");
  });

  it("クリックで onClick を呼び出す", async () => {
    const handleClick = vi.fn();
    render(<CButton onClick={handleClick}>保存</CButton>);
    await userEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disabled の場合はクリックできない", async () => {
    const handleClick = vi.fn();
    render(
      <CButton disabled onClick={handleClick}>
        保存
      </CButton>,
    );
    await userEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("asChild で子要素をボタン外観で描画する", () => {
    render(
      <CButton asChild>
        <a href="/dashboard">戻る</a>
      </CButton>,
    );
    expect(screen.getByRole("link", { name: "戻る" })).toHaveAttribute("data-slot", "button");
  });
});
