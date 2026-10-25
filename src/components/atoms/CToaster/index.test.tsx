import { act, render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it } from "vitest";

import CToaster from ".";

describe("CToaster", () => {
  it("toast() で通知を表示する", async () => {
    render(<CToaster />);
    act(() => {
      toast.success("保存しました");
    });
    expect(await screen.findByText("保存しました")).toBeInTheDocument();
  });
});
