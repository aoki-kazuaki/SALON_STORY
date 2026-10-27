import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CDialog from ".";

describe("CDialog", () => {
  it("open=true で見出し・本文・フッターを表示する", () => {
    render(
      <CDialog
        open
        onOpenChange={vi.fn()}
        title="メモを入力"
        description="日付とメモを入力してください"
        footer={<button>保存</button>}
      >
        <p>フォーム</p>
      </CDialog>,
    );
    expect(screen.getByRole("dialog", { name: "メモを入力" })).toBeInTheDocument();
    expect(screen.getByText("フォーム")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
  });

  it("既定では先頭の入力欄にフォーカスする", () => {
    render(
      <CDialog open onOpenChange={vi.fn()} title="メモを入力" description="">
        <textarea aria-label="メモ" />
      </CDialog>,
    );
    expect(screen.getByRole("textbox", { name: "メモ" })).toHaveFocus();
  });

  it("isAutoFocusDisabled の場合は入力欄ではなくダイアログ自体にフォーカスする", () => {
    render(
      <CDialog open onOpenChange={vi.fn()} title="メモを編集" description="" isAutoFocusDisabled>
        <textarea aria-label="メモ" />
      </CDialog>,
    );
    expect(screen.getByRole("textbox", { name: "メモ" })).not.toHaveFocus();
    expect(screen.getByRole("dialog", { name: "メモを編集" })).toHaveFocus();
  });

  it("閉じるボタンで onOpenChange(false) を呼ぶ", async () => {
    const handleOpenChange = vi.fn();
    render(
      <CDialog open onOpenChange={handleOpenChange} title="メモを入力" description="">
        <p>フォーム</p>
      </CDialog>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
