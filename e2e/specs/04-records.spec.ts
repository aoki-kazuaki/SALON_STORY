import type { Locator, Page } from "@playwright/test";
import dayjs from "dayjs";

import { E2E_OWNER_STORAGE_STATE, e2eDateKeyAfter } from "../support/data";
import { e2eConfirmDialog, e2eScreenshot, e2eToast, expect, test } from "../support/fixtures";

test.use({ storageState: E2E_OWNER_STORAGE_STATE });

/** 空き枠を一括登録した最後の月 (今日から45日後の月。日別の編集シナリオで使う) */
const TARGET_MONTH = dayjs(e2eDateKeyAfter(45));

/** 対象月の月別一覧を開く */
const openTargetMonth = async (page: Page): Promise<void> => {
  await page.goto(`/dashboard/records/${TARGET_MONTH.year()}/${TARGET_MONTH.month() + 1}`);
  await expect(
    page.getByRole("heading", { name: `${TARGET_MONTH.year()}年${TARGET_MONTH.month() + 1}月の登録データ` }),
  ).toBeVisible();
  // 読み込み完了後に入力済みの日が開くため、操作前に読み込み完了 (入力済みの日が開いた状態) を待つ
  await expect(page.getByText("読み込み中…").filter({ visible: true })).toHaveCount(0);
  await expect(openedDayItems(page).first()).toBeVisible();
};

/**
 * 日別アコーディオンの全項目
 * - 遷移前の画面も非表示のまま DOM に残るため (Next.js の Activity)、表示中のものに限定する
 */
const dayItems = (page: Page): Locator => page.locator('[data-slot="accordion-item"]:visible');

/** 入力状態 (入力済 / 未入力) で絞り込んだ日別アコーディオン項目 */
const dayItemsByStatus = (page: Page, status: "入力済" | "未入力"): Locator =>
  dayItems(page).filter({ has: page.locator('[data-slot="accordion-trigger"]', { hasText: status }) });

/** 展開中の日別アコーディオン項目 */
const openedDayItems = (page: Page): Locator => page.locator('[data-slot="accordion-item"][data-state="open"]:visible');

test.describe("登録データ一覧・月別一覧", () => {
  test("登録データ一覧を開く__登録のある月と3か月先までの月が新しい月から順に表示され今月が強調される", async ({
    page,
  }, testInfo) => {
    await page.goto("/dashboard/records");
    const year = String(dayjs().year());
    const monthLinks = page.locator(`a[href^="/dashboard/records/${year}/"]`);
    await expect(monthLinks.first()).toBeVisible();

    const today = dayjs();
    const currentMonthLink = page.locator(`a[href="/dashboard/records/${today.year()}/${today.month() + 1}"]`);
    await expect(currentMonthLink).toHaveAttribute("aria-current", "date");
    await expect(currentMonthLink).toContainText("今月");
    const limitMonth = today.add(3, "month");
    await expect(
      page.locator(`a[href="/dashboard/records/${limitMonth.year()}/${limitMonth.month() + 1}"]`),
    ).toBeVisible();

    const months = (await monthLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""))).map(
      (href) => Number(href.split("/").at(-1)),
    );
    expect(months).toEqual([...months].sort((a, b) => b - a));
    await e2eScreenshot(page, "04-records", testInfo, { fullPage: true });
  });

  test("月をタップする__月別一覧に遷移し入力済みの日だけが開いている", async ({ page }, testInfo) => {
    await page.goto("/dashboard/records");
    await page.locator(`a[href="/dashboard/records/${TARGET_MONTH.year()}/${TARGET_MONTH.month() + 1}"]`).click();
    await expect(page.getByRole("heading", { name: `${TARGET_MONTH.month() + 1}月の登録データ` })).toBeVisible();

    const filledCount = await dayItemsByStatus(page, "入力済").count();
    expect(filledCount).toBeGreaterThan(0);
    await expect(dayItems(page)).toHaveCount(TARGET_MONTH.daysInMonth());
    await expect(openedDayItems(page)).toHaveCount(filledCount);
    await expect(page.getByText(`入力済み ${filledCount}日 / ${TARGET_MONTH.daysInMonth()}日`)).toBeVisible();
    await e2eScreenshot(page, "04-records-month", testInfo);
  });

  test("全て閉じる・全て開くを押す__入力済みの日だけがまとめて開閉される", async ({ page }) => {
    await openTargetMonth(page);
    const filledCount = await dayItemsByStatus(page, "入力済").count();

    await page.getByRole("button", { name: "全て閉じる" }).click();
    await expect(openedDayItems(page)).toHaveCount(0);

    await page.getByRole("button", { name: "全て開く (入力済)" }).click();
    await expect(openedDayItems(page)).toHaveCount(filledCount);
    await expect(dayItemsByStatus(page, "未入力").and(openedDayItems(page))).toHaveCount(0);
  });

  test("入力済みの日を編集する__UPDATEDバッジが付き内容が更新される", async ({ page }) => {
    await openTargetMonth(page);
    const item = dayItemsByStatus(page, "入力済").first();
    await item.getByRole("button", { name: "編集" }).click();

    const dialog = page.getByRole("dialog", { name: "メモを編集" });
    await expect(dialog.locator("#memo-date")).toBeDisabled();
    await dialog.locator("#memo-content").fill("19:00〜 最終枠");
    await page.getByRole("button", { name: "保存する" }).click();

    await expect(e2eToast(page, "のメモを保存しました")).toBeVisible();
    await expect(item).toContainText("UPDATED");
    await expect(item).toContainText("19:00〜 最終枠");
  });

  test("入力済みの日をクリアする__確認後に未入力になりUPDATEDバッジが付く", async ({ page }) => {
    await openTargetMonth(page);
    const filledBefore = await dayItemsByStatus(page, "入力済").count();
    const item = dayItemsByStatus(page, "入力済").last();
    const dateLabel = (await item.locator('[data-slot="accordion-trigger"] span.font-bold').textContent()) ?? "";

    await item.getByRole("button", { name: "クリア" }).click();
    await expect(e2eConfirmDialog(page)).toContainText(`${dateLabel} のメモをクリアしますか？`);
    await e2eConfirmDialog(page).getByRole("button", { name: "クリア" }).click();

    await expect(e2eToast(page, `${dateLabel} のメモをクリアしました`)).toBeVisible();
    await expect(dayItemsByStatus(page, "入力済")).toHaveCount(filledBefore - 1);
    const clearedItem = dayItems(page).filter({ hasText: dateLabel });
    await expect(clearedItem).toContainText("未入力");
    await expect(clearedItem).toContainText("UPDATED");
  });

  test("未入力の日にメモを追加する__NEWバッジが付き入力済みになる", async ({ page }, testInfo) => {
    await openTargetMonth(page);
    const item = dayItemsByStatus(page, "未入力").first();
    const dateLabel = (await item.locator('[data-slot="accordion-trigger"] span.font-bold').textContent()) ?? "";
    await item.locator('[data-slot="accordion-trigger"]').click();
    await item.getByRole("button", { name: "メモを追加" }).click();

    const dialog = page.getByRole("dialog", { name: "メモを追加" });
    await dialog.locator("#memo-content").fill("15:00〜\n2名まで");
    await page.getByRole("button", { name: "保存する" }).click();

    const addedItem = dayItems(page).filter({ hasText: dateLabel });
    await expect(addedItem).toContainText("入力済");
    await expect(addedItem).toContainText("NEW");
    await e2eScreenshot(page, "04-records-month-badges", testInfo);
  });

  test("前の月・次の月で切り替える__3か月先の月では次の月が押せない", async ({ page }) => {
    const today = dayjs();
    await page.goto(`/dashboard/records/${today.year()}/${today.month() + 1}`);
    const navigation = page.getByRole("navigation", { name: "月の切り替え" });
    await expect(navigation).toContainText("今月");

    const limitMonth = today.add(3, "month");
    for (let index = 1; index <= 3; index += 1) {
      const target = today.add(index, "month");
      await navigation.getByRole("link", { name: `${target.month() + 1}月`, exact: true }).click();
      await expect(
        page.getByRole("heading", { name: `${target.year()}年${target.month() + 1}月の登録データ` }),
      ).toBeVisible();
    }
    await expect(navigation).not.toContainText("今月");
    await expect(
      navigation.getByRole("button", { name: `${limitMonth.add(1, "month").month() + 1}月`, exact: true }),
    ).toBeDisabled();

    const prevMonth = limitMonth.subtract(1, "month");
    await navigation.getByRole("link", { name: `${prevMonth.month() + 1}月`, exact: true }).click();
    await expect(
      page.getByRole("heading", { name: `${prevMonth.year()}年${prevMonth.month() + 1}月の登録データ` }),
    ).toBeVisible();
  });

  test("存在しない年月を開く__年月が正しくない旨が表示される", async ({ page }) => {
    await page.goto("/dashboard/records/2026/13");
    await expect(page.getByText("指定された年月が正しくありません。")).toBeVisible();
  });

  test("この月でストーリーズを作成を押す__エディタが対象月の月指定で開く", async ({ page }) => {
    await openTargetMonth(page);
    await page.getByRole("link", { name: "この月でストーリーズを作成" }).click();
    await page.waitForURL("**/dashboard/editor");
    await expect(page.getByLabel("対象月")).toHaveValue(TARGET_MONTH.format("YYYY-MM"));
  });
});
