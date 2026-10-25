import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CSelect from ".";

/** テスト用の選択肢 */
const OPTIONS = [
  { value: "2026-10", label: "2026年10月" },
  { value: "2026-11", label: "2026年11月" },
];

describe("CSelect", () => {
  it("選択肢を表示し、選択変更を通知する", async () => {
    const handleChange = vi.fn();
    render(<CSelect aria-label="対象月" options={OPTIONS} value="2026-10" onChange={handleChange} />);
    expect(screen.getAllByRole("option")).toHaveLength(2);
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "対象月" }), "2026-11");
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
