import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CBanner from ".";

describe("CBanner", () => {
  it("メッセージを表示し、閉じるボタンで onClose を呼ぶ", async () => {
    const handleClose = vi.fn();
    render(<CBanner message="メールアドレスを変更しました" onClose={handleClose} />);
    expect(screen.getByRole("status")).toHaveTextContent("メールアドレスを変更しました");
    await userEvent.click(screen.getByRole("button", { name: "閉じる" }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
