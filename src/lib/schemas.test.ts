import { describe, expect, it } from "vitest";

import { schemaMemoForm, schemaScheduleSaveBody } from "./schemas";

/** メモ入力フォームの値を検証する */
const parseMemo = (content: string) => schemaMemoForm.safeParse({ dateKey: "2026-10-25", content });

/** 検証エラーのメッセージ一覧を返す */
const errorMessages = (content: string): string[] => {
  const result = parseMemo(content);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.message);
};

describe("schemaMemoForm (メモ本文の入力制限)", () => {
  it.each([["10:00"], ["10:00\n14:00"], ["10:00\n13:15\n14:00"], ["16:00〜 カットのみ\n※カラーをご希望の方は要相談"]])(
    "%j は入力可能",
    (content) => {
      expect(parseMemo(content).success).toBe(true);
    },
  );

  it("空行・前後の空白は行数・文字数に数えない", () => {
    expect(parseMemo("\n 10:00 \n\n13:15\n14:00\n").success).toBe(true);
  });

  it("4行以上は入力不可", () => {
    expect(errorMessages("10:00\n11:00\n13:15\n14:00")).toContain("3行以内で入力してください");
  });

  it("1行16文字以上は入力不可", () => {
    expect(errorMessages("1234567890123456")).toContain("1行15文字以内で入力してください");
  });

  it("空・空白のみは入力不可", () => {
    expect(errorMessages(" \n ")).toContain("メモを入力してください");
  });
});

describe("schemaScheduleSaveBody (API 側のメモ本文の検証)", () => {
  it("フォームと同じ行数・文字数制限を適用する", () => {
    const parse = (content: string) =>
      schemaScheduleSaveBody.safeParse({ dateKey: "2026-10-25", content, overwrite: false }).success;
    expect(parse("10:00\n13:15\n14:00")).toBe(true);
    expect(parse("10:00\n11:00\n13:15\n14:00")).toBe(false);
    expect(parse("1234567890123456")).toBe(false);
  });
});
