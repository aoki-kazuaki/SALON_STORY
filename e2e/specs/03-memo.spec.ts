import type { Page } from "@playwright/test";
import dayjs from "dayjs";

import { dateFormatBadgeLabel } from "@/utils/date";

import { E2E_LEGEND_TEXT, E2E_OWNER_STORAGE_STATE, e2eBuildScenarioMemos, e2eDateKeyAfter } from "../support/data";
import { e2eConfirmDialog, e2eFieldError, e2eScreenshot, e2eToast, expect, test } from "../support/fixtures";

test.use({ storageState: E2E_OWNER_STORAGE_STATE });

/** ダッシュボードからメモ入力ダイアログを開く */
const openMemoDialog = async (page: Page) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "メモを入力" }).click();
  const dialog = page.getByRole("dialog", { name: "メモを入力" });
  await expect(dialog).toBeVisible();
  return dialog;
};

/** メモ入力ダイアログに入力して保存する */
const saveMemo = async (page: Page, dateKey: string, content: string): Promise<void> => {
  const dialog = await openMemoDialog(page);
  await dialog.locator("#memo-date").fill(dateKey);
  await dialog.locator("#memo-content").fill(content);
  await page.getByRole("button", { name: "保存する" }).click();
};

test.describe("ダッシュボード (メモ入力・凡例テキスト)", () => {
  test("メモ入力ダイアログを開く__日付の初期値が今日で今日より前は選べない", async ({ page }, testInfo) => {
    const dialog = await openMemoDialog(page);
    const today = e2eDateKeyAfter(0);
    await expect(dialog.locator("#memo-date")).toHaveValue(today);
    await expect(dialog.locator("#memo-date")).toHaveAttribute("min", today);
    await e2eScreenshot(page, "03-memo-dialog", testInfo);
  });

  test("過去の日付を入力して保存する__保存されずダイアログが開いたままになる", async ({ page }) => {
    const dialog = await openMemoDialog(page);
    await dialog.locator("#memo-date").fill(e2eDateKeyAfter(-1));
    await dialog.locator("#memo-content").fill("10:00〜");
    await page.getByRole("button", { name: "保存する" }).click();

    const isRangeUnderflow = await dialog
      .locator("#memo-date")
      .evaluate((input: HTMLInputElement) => input.validity.rangeUnderflow);
    expect(isRangeUnderflow).toBe(true);
    await expect(dialog).toBeVisible();
    await expect(e2eToast(page, "のメモを保存しました")).toHaveCount(0);
  });

  test("空のメモを保存する__メモの入力を求めるエラーが表示される", async ({ page }) => {
    await saveMemo(page, e2eDateKeyAfter(1), "  \n ");
    await expect(e2eFieldError(page, "memo-content")).toHaveText("メモを入力してください");
  });

  test("4行のメモを保存する__行数の上限エラーが表示される", async ({ page }) => {
    await saveMemo(page, e2eDateKeyAfter(1), "10:00\n11:00\n13:00\n15:00");
    await expect(e2eFieldError(page, "memo-content")).toHaveText("3行以内で入力してください");
  });

  test("1行16文字のメモを保存する__1行の文字数の上限エラーが表示される", async ({ page }) => {
    await saveMemo(page, e2eDateKeyAfter(1), "1234567890123456");
    await expect(e2eFieldError(page, "memo-content")).toHaveText("1行15文字以内で入力してください");
  });

  test("メモを保存する__保存のトーストが表示され次回は直前の日付が初期値になる", async ({ page }) => {
    const dateKey = e2eDateKeyAfter(1);
    await saveMemo(page, dateKey, "10:00〜\n14:00〜");
    await expect(e2eToast(page, `${dateFormatBadgeLabel(dateKey)} のメモを保存しました`)).toBeVisible();

    await page.getByRole("button", { name: "メモを入力" }).click();
    await expect(page.locator("#memo-date")).toHaveValue(dateKey);
  });

  test("入力済みの日付に保存する__新旧比較ダイアログで確認後に上書きされる", async ({ page }, testInfo) => {
    const dateKey = e2eDateKeyAfter(1);
    await saveMemo(page, dateKey, "11:00〜 カットのみ");

    const confirm = e2eConfirmDialog(page);
    await expect(confirm).toContainText("既存のメモを上書きしますか？");
    await expect(confirm).toContainText("10:00〜");
    await expect(confirm).toContainText("11:00〜 カットのみ");
    await e2eScreenshot(page, "03-memo-overwrite-confirm", testInfo);

    await confirm.getByRole("button", { name: "上書きする" }).click();
    await expect(e2eToast(page, `${dateFormatBadgeLabel(dateKey)} のメモを保存しました`)).toBeVisible();
  });

  test("凡例テキストを編集する__プレビューに反映され再度開いても保持される", async ({ page }, testInfo) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "凡例テキストを編集" }).click();
    const dialog = page.getByRole("dialog", { name: "凡例テキストを編集" });
    await dialog.locator("#legend-content").fill(E2E_LEGEND_TEXT);
    await expect(dialog.getByText("ご予約はプロフィールのリンク、またはDMからどうぞ。")).toBeVisible();
    await e2eScreenshot(page, "03-legend-dialog", testInfo);
    await page.getByRole("button", { name: "保存する" }).click();
    await expect(e2eToast(page, "凡例テキストを保存しました")).toBeVisible();

    await page.reload();
    await page.getByRole("button", { name: "凡例テキストを編集" }).click();
    await expect(page.locator("#legend-content")).toHaveValue(E2E_LEGEND_TEXT);
  });

  test("月をまたいで多数の空き枠を登録する__登録データ一覧に登録のある月がすべて表示される", async ({
    page,
  }, testInfo) => {
    const memos = e2eBuildScenarioMemos();
    for (const memo of memos) {
      const response = await page.request.post("/api/schedule/save", { data: { ...memo, overwrite: true } });
      expect(response.ok()).toBe(true);
    }

    await page.goto("/dashboard/records");
    const monthKeys = [
      ...new Set([...memos.map((memo) => memo.dateKey), e2eDateKeyAfter(1)].map((key) => key.slice(0, 7))),
    ];
    for (const monthKey of monthKeys) {
      const month = dayjs(`${monthKey}-01`);
      await expect(page.locator(`a[href="/dashboard/records/${month.year()}/${month.month() + 1}"]`)).toBeVisible();
    }
    await e2eScreenshot(page, "03-records-after-bulk", testInfo, { fullPage: true });
  });
});
