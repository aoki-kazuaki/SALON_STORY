import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CLabel from ".";

describe("CLabel", () => {
  it("htmlFor で入力欄と関連付ける", () => {
    render(
      <>
        <CLabel htmlFor="username">ログインID</CLabel>
        <input id="username" />
      </>,
    );
    expect(screen.getByLabelText("ログインID")).toHaveAttribute("id", "username");
  });
});
