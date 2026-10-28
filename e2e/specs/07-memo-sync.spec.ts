import type { Locator, Page } from "@playwright/test";

import { dateFormatBadgeLabel } from "@/utils/date";

import { E2E_OWNER_STORAGE_STATE, e2eDateKeyAfter } from "../support/data";
import { e2eConfirmDialog, e2eToast, expect, test } from "../support/fixtures";

test.use({ storageState: E2E_OWNER_STORAGE_STATE });

/** 検証に使う日付 (一括登録データ (2〜45日後) と重ならない日) */
const TARGET_DATE_KEY = e2eDateKeyAfter(50);

/** 検証に使う日付の年月 ("YYYY-MM") */
const TARGET_MONTH_KEY = TARGET_DATE_KEY.slice(0, 7);

/** 各画面で保存するメモ本文 (すべて共通の目印を含め、表示件数を数えられるようにする) */
const MEMO_MARKER = "同期確認";

/** 保存する回ごとのメモ本文 */
const memoContent = (step: number): string => `${MEMO_MARKER}${step}\n10:00〜`;

/** 表示中のエディタの空き枠リストのうち、検証対象のメモの行 */
const slotRows = (page: Page): Locator => page.locator("li:visible").filter({ hasText: MEMO_MARKER });

/** 表示中のキャンバス上のバッジのうち、検証対象のメモのバッジ */
const canvasBadges = (page: Page): Locator =>
  page.locator('[data-testid="story-canvas"]:visible [data-variant]').filter({ hasText: MEMO_MARKER });

/** DB に保存されている検証対象の日のメモ (API で取得) */
const fetchSavedMemos = async (page: Page): Promise<{ dateKey: string; content: string }[]> => {
  const response = await page.request.get(`/api/schedule/list?startDate=${TARGET_DATE_KEY}&endDate=${TARGET_DATE_KEY}`);
  expect(response.ok()).toBe(true);
  return (await response.json()).memos;
};

/** DB に検証対象の日のメモが1件だけ、指定の本文で保存されていることを確認する */
const expectSavedMemo = async (page: Page, content: string): Promise<void> => {
  const memos = await fetchSavedMemos(page);
  expect(memos).toHaveLength(1);
  expect(memos[0].content).toBe(content);
};

/** エディタの空き枠リストとプレビューに、検証対象のメモが1件だけ最新の本文で表示されることを確認する */
const expectEditorShowsOnce = async (page: Page, step: number): Promise<void> => {
  await expect(page.getByRole("tab", { name: "編集・選択" })).toHaveAttribute("aria-selected", "true");
  await page.getByLabel("対象月").filter({ visible: true }).selectOption(TARGET_MONTH_KEY);
  await expect(slotRows(page)).toHaveCount(1);
  await expect(slotRows(page)).toContainText(`${MEMO_MARKER}${step}`);

  await page.getByRole("button", { name: "プレビューを見る" }).filter({ visible: true }).click();
  await expect(page.getByRole("tab", { name: "プレビュー・保存" })).toHaveAttribute("aria-selected", "true");
  await expect(canvasBadges(page)).toHaveCount(1);
  await expect(canvasBadges(page)).toContainText(`${MEMO_MARKER}${step}`);
};

/** 画面遷移 (ページの再読み込みなし) でダッシュボードへ戻る */
const backToDashboard = async (page: Page): Promise<void> => {
  await page.getByRole("link", { name: "SALON STORY" }).filter({ visible: true }).click();
  await expect(
    page.getByRole("heading", { name: "ダッシュボード", exact: true }).filter({ visible: true }),
  ).toBeVisible();
};

/** 画面遷移 (ページの再読み込みなし) でダッシュボードからエディタを開く */
const openEditorFromDashboard = async (page: Page): Promise<void> => {
  await page
    .getByRole("link", { name: /ストーリーズエディタ/ })
    .filter({ visible: true })
    .click();
  await expect(page.getByRole("heading", { name: "② 空き枠を選択" }).filter({ visible: true })).toBeVisible();
};

/** ダッシュボードのメモ入力ダイアログで検証対象の日に保存する (登録済みの場合は上書き確認を経る) */
const saveFromDashboard = async (page: Page, content: string, isOverwrite: boolean): Promise<void> => {
  await page.getByRole("button", { name: "メモを入力" }).filter({ visible: true }).click();
  const dialog = page.getByRole("dialog", { name: "メモを入力" });
  await dialog.locator("#memo-date").fill(TARGET_DATE_KEY);
  await dialog.locator("#memo-content").fill(content);
  await dialog.getByRole("button", { name: "保存する" }).click();
  if (isOverwrite) await e2eConfirmDialog(page).getByRole("button", { name: "上書きする" }).click();
  await expect(e2eToast(page, `${dateFormatBadgeLabel(TARGET_DATE_KEY)} のメモを保存しました`).first()).toBeVisible();
};

test.describe("メモの編集内容の同期 (各画面の編集 → DB → ストーリーズエディタ)", () => {
  test("各画面でメモを編集する__DBに1件だけ保存されエディタの一覧とプレビューに最新の内容が1件だけ表示される", async ({
    page,
  }) => {
    // 1. ダッシュボードから新規登録
    await page.goto("/dashboard");
    await saveFromDashboard(page, memoContent(1), false);
    await expectSavedMemo(page, memoContent(1));
    await openEditorFromDashboard(page);
    await expectEditorShowsOnce(page, 1);

    // 2. ダッシュボードから上書き (エディタはプレビュータブを開いたまま離れる)
    await backToDashboard(page);
    await saveFromDashboard(page, memoContent(2), true);
    await expectSavedMemo(page, memoContent(2));
    await openEditorFromDashboard(page);
    await expectEditorShowsOnce(page, 2);

    // 3. エディタの空き枠リストから編集
    await page.getByRole("tab", { name: "編集・選択" }).click();
    await page
      .getByRole("button", { name: `${dateFormatBadgeLabel(TARGET_DATE_KEY)} のメモを編集` })
      .filter({ visible: true })
      .click();
    const editorDialog = page.getByRole("dialog", { name: "メモを編集" });
    await editorDialog.locator("#memo-content").fill(memoContent(3));
    await editorDialog.getByRole("button", { name: "保存する" }).click();
    await expect(editorDialog).toHaveCount(0);
    await expectSavedMemo(page, memoContent(3));
    await expectEditorShowsOnce(page, 3);

    // 4. 月別一覧から編集し、「この月でストーリーズを作成」でエディタへ
    const [year, month] = TARGET_MONTH_KEY.split("-").map(Number);
    await backToDashboard(page);
    await page
      .getByRole("link", { name: /登録データ一覧/ })
      .filter({ visible: true })
      .click();
    await page.locator(`a[href="/dashboard/records/${year}/${month}"]:visible`).click();
    const dayItem = page
      .locator('[data-slot="accordion-item"]:visible')
      .filter({ hasText: dateFormatBadgeLabel(TARGET_DATE_KEY) });
    await dayItem.getByRole("button", { name: "編集" }).click();
    const recordsDialog = page.getByRole("dialog", { name: "メモを編集" });
    await recordsDialog.locator("#memo-content").fill(memoContent(4));
    await recordsDialog.getByRole("button", { name: "保存する" }).click();
    await expect(dayItem).toContainText(`${MEMO_MARKER}4`);
    await expectSavedMemo(page, memoContent(4));
    await page.getByRole("link", { name: "この月でストーリーズを作成" }).filter({ visible: true }).click();
    await expect(page.getByRole("heading", { name: "② 空き枠を選択" }).filter({ visible: true })).toBeVisible();
    await expectEditorShowsOnce(page, 4);

    // 5. 別の端末で更新された場合 (画面を経由しない更新) も「プレビューを見る」で最新の内容から生成される
    await page.getByRole("tab", { name: "編集・選択" }).click();
    const response = await page.request.post("/api/schedule/save", {
      data: { dateKey: TARGET_DATE_KEY, content: memoContent(5), overwrite: true },
    });
    expect(response.ok()).toBe(true);
    await page.getByRole("button", { name: "プレビューを見る" }).filter({ visible: true }).click();
    await expect(canvasBadges(page)).toHaveCount(1);
    await expect(canvasBadges(page)).toContainText(`${MEMO_MARKER}5`);
    await page.getByRole("tab", { name: "編集・選択" }).click();
    await expect(slotRows(page)).toHaveCount(1);
    await expect(slotRows(page)).toContainText(`${MEMO_MARKER}5`);
  });
});
