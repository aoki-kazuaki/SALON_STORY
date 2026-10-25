import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CFormField from ".";

describe("CFormField", () => {
  it("ラベルと入力欄を関連付ける", () => {
    render(
      <CFormField htmlFor="email" label="メールアドレス">
        <input id="email" />
      </CFormField>,
    );
    expect(screen.getByLabelText("メールアドレス")).toHaveAttribute("id", "email");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("エラーメッセージと補足説明を表示する", () => {
    render(
      <CFormField htmlFor="email" label="メールアドレス" error="形式が正しくありません" hint="承認通知が届きます">
        <input id="email" />
      </CFormField>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("形式が正しくありません");
    expect(screen.getByText("承認通知が届きます")).toBeInTheDocument();
  });
});
