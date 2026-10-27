import { describe, expect, it } from "vitest";

import {
  schemaBuildMemoForm,
  schemaLoginForm,
  schemaMemoForm,
  schemaPassword,
  schemaScheduleSaveBody,
} from "./schemas";

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

  it("5行・1行20文字までは入力可能", () => {
    expect(parseMemo("10:00〜 カット・カラーOK\n11:00\n13:15\n14:00\n12345678901234567890").success).toBe(true);
  });

  it("6行以上は入力不可", () => {
    expect(errorMessages("10:00\n11:00\n13:15\n14:00\n15:00\n16:00")).toContain("5行以内で入力してください");
  });

  it("1行21文字以上は入力不可", () => {
    expect(errorMessages("123456789012345678901")).toContain("1行20文字以内で入力してください");
  });

  it("空・空白のみは入力不可", () => {
    expect(errorMessages(" \n ")).toContain("メモを入力してください");
  });
});

describe("schemaScheduleSaveBody (API 側のメモ本文の検証)", () => {
  it("フォームと同じ行数・文字数制限を適用する", () => {
    const parse = (content: string) =>
      schemaScheduleSaveBody.safeParse({ dateKey: "2026-10-25", content, overwrite: false }).success;
    expect(parse("10:00\n11:00\n13:15\n14:00\n15:00")).toBe(true);
    expect(parse("10:00\n11:00\n13:15\n14:00\n15:00\n16:00")).toBe(false);
    expect(parse("123456789012345678901")).toBe(false);
  });
});

describe("schemaPassword (パスワードの入力条件)", () => {
  it.each([["Salon2026"], ["aB345678"], ["Abcdefg1!"]])("%j は登録可能", (password) => {
    expect(schemaPassword.safeParse(password).success).toBe(true);
  });

  it.each([
    ["Salon26", "7文字以下"],
    ["salon2026", "英大文字なし"],
    ["SALON2026", "英小文字なし"],
    ["SalonOwner", "数字なし"],
  ])("%j は登録不可 (%s)", (password) => {
    expect(schemaPassword.safeParse(password).success).toBe(false);
  });
});

describe("schemaLoginForm (ログインIDまたはメールアドレス)", () => {
  it("前後の空白を除去して受け付ける", () => {
    const result = schemaLoginForm.safeParse({ identifier: " owner@example.com ", password: "x" });
    expect(result.success && result.data.identifier).toBe("owner@example.com");
  });

  it("未入力はエラー", () => {
    expect(schemaLoginForm.safeParse({ identifier: " ", password: "x" }).success).toBe(false);
  });
});

describe("schemaBuildMemoForm (新規登録できる日付の上限)", () => {
  /** 上限日を指定してメモ入力フォームの値を検証する */
  const parseWithMax = (dateKey: string, maxDateKey: string) =>
    schemaBuildMemoForm(maxDateKey).safeParse({ dateKey, content: "10:00" });

  it("上限日以前は登録可能", () => {
    expect(parseWithMax("2027-01-31", "2027-01-31").success).toBe(true);
  });

  it("上限日より後は日付のエラーになる", () => {
    const result = parseWithMax("2027-02-01", "2027-01-31");
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["dateKey"]);
    expect(result.error?.issues[0].message).toBe("新規のメモは3か月先の月末 (1/31(日)) までの日付で登録してください");
  });

  it("上限日が空文字の場合は制限しない", () => {
    expect(parseWithMax("2030-12-31", "").success).toBe(true);
  });
});
