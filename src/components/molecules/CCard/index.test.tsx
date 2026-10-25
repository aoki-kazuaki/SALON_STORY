import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CCard from ".";

describe("CCard", () => {
  it("見出し・説明文・本文を表示する", () => {
    render(
      <CCard title="凡例テキスト" description="ストーリーズ下部に表示されます">
        本文
      </CCard>,
    );
    expect(screen.getByRole("heading", { name: "凡例テキスト" })).toBeInTheDocument();
    expect(screen.getByText("ストーリーズ下部に表示されます")).toBeInTheDocument();
    expect(screen.getByText("本文")).toBeInTheDocument();
  });

  it("見出し・説明文が未指定の場合は表示しない", () => {
    render(<CCard>本文のみ</CCard>);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});
