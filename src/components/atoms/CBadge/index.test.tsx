import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CBadge from ".";

describe("CBadge", () => {
  it.each([
    ["blue", "bg-blue-600"],
    ["gray", "bg-stone-200"],
    ["green", "bg-emerald-500"],
    ["orange", "bg-orange-500"],
    ["dark", "bg-stone-900"],
  ] as const)("tone=%s は %s で表示する", (tone, className) => {
    render(<CBadge tone={tone}>NEW</CBadge>);
    expect(screen.getByText("NEW")).toHaveClass(className);
  });
});
