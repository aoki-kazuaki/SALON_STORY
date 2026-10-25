import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CConfirmDialog from ".";

describe("CConfirmDialog", () => {
  it("open=true で見出し・説明文・追加内容を表示する", () => {
    render(
      <CConfirmDialog
        open
        onOpenChange={vi.fn()}
        title="削除しますか？"
        description="元に戻せません"
        onConfirm={vi.fn()}
      >
        <p>追加内容</p>
      </CConfirmDialog>,
    );
    expect(screen.getByRole("alertdialog", { name: "削除しますか？" })).toBeInTheDocument();
    expect(screen.getByText("元に戻せません")).toBeInTheDocument();
    expect(screen.getByText("追加内容")).toBeInTheDocument();
  });

  it("確定ボタンで onConfirm、キャンセルで onOpenChange(false) を呼ぶ", async () => {
    const handleConfirm = vi.fn();
    const handleOpenChange = vi.fn();
    const { rerender } = render(
      <CConfirmDialog
        open
        onOpenChange={handleOpenChange}
        title="削除しますか？"
        description=""
        confirmLabel="削除"
        onConfirm={handleConfirm}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);

    rerender(
      <CConfirmDialog open onOpenChange={handleOpenChange} title="削除しますか？" description="" onConfirm={vi.fn()} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("open=false では表示しない", () => {
    render(<CConfirmDialog open={false} onOpenChange={vi.fn()} title="確認" description="" onConfirm={vi.fn()} />);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
