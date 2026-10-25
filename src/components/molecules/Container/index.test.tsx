import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Container from ".";

describe("Container", () => {
  it("大外 div で内容を包み、最大幅を設定する", () => {
    const { container } = render(<Container>内容</Container>);
    expect(container.firstElementChild?.tagName).toBe("DIV");
    expect(container.firstElementChild).toHaveClass("max-w-3xl");
    expect(screen.getByText("内容")).toBeInTheDocument();
  });
});
