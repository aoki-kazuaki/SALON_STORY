import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CTabs from ".";

/** テスト用のタブ */
const ITEMS = [
  { value: "edit", label: "編集・選択", content: "編集の内容" },
  { value: "preview", label: "プレビュー・保存", content: "プレビューの内容" },
];

describe("CTabs", () => {
  it("選択中のタブの内容のみ表示する", () => {
    render(<CTabs items={ITEMS} value="edit" onValueChange={vi.fn()} />);
    expect(screen.getByRole("tab", { name: "編集・選択" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("編集の内容")).toBeInTheDocument();
    expect(screen.queryByText("プレビューの内容")).not.toBeInTheDocument();
  });

  it("タブのクリックで切り替え先を通知する", async () => {
    const handleChange = vi.fn();
    render(<CTabs items={ITEMS} value="edit" onValueChange={handleChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "プレビュー・保存" }));
    expect(handleChange).toHaveBeenCalledWith("preview");
  });
});
