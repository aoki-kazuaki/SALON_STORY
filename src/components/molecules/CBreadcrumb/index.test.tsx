import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CBreadcrumb from ".";

/** テスト用のパンくず */
const ITEMS = [
  { label: "ダッシュボード", href: "/dashboard" },
  { label: "登録データ一覧", href: "/dashboard/records" },
  { label: "2026年10月", href: "/dashboard/records/2026/10" },
];

describe("CBreadcrumb", () => {
  it("末尾以外はリンク、末尾は現在ページとして表示する", () => {
    render(<CBreadcrumb items={ITEMS} />);
    expect(screen.getByRole("link", { name: "ダッシュボード" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "登録データ一覧" })).toHaveAttribute("href", "/dashboard/records");
    const currentPage = screen.getByText("2026年10月");
    expect(currentPage).toHaveAttribute("aria-current", "page");
    expect(currentPage).not.toHaveAttribute("href");
  });
});
