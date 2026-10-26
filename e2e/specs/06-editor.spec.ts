import type { Locator, Page } from "@playwright/test";

import { E2E_OWNER_STORAGE_STATE, e2eBuildScenarioMemos, e2eDateKeyAfter } from "../support/data";
import { e2eScreenshot, e2eToast, expect, test } from "../support/fixtures";

test.use({ storageState: E2E_OWNER_STORAGE_STATE });

/** バッジ件数ごとの表示密度 (1〜6件: 大 / 7〜12件: 中 / 13件〜: 小) */
const expectedDensity = (count: number): string => {
  if (count <= 6) return "lg";
  if (count <= 12) return "md";
  return "sm";
};

/** データのある年月の一覧から、エディタが初期選択すべき年月 (今月があれば今月、なければ最も早い月) */
const expectedDefaultMonth = (monthKeys: string[]): string => {
  const currentMonth = e2eDateKeyAfter(0).slice(0, 7);
  if (monthKeys.includes(currentMonth)) return currentMonth;
  return [...monthKeys].sort()[0] ?? "";
};

/** 空き枠リストの各行のチェックボックス */
const slotCheckboxes = (page: Page): Locator => page.getByRole("checkbox");

/** プレビューのキャンバス */
const canvas = (page: Page): Locator => page.getByTestId("story-canvas").first();

/** キャンバス上のカプセルバッジ */
const canvasBadges = (page: Page): Locator => canvas(page).locator("[data-variant]");

/** エディタを開き、空き枠リストの読み込み完了を待つ */
const openEditor = async (page: Page): Promise<void> => {
  await page.goto("/dashboard/editor");
  await expect(page.getByRole("heading", { name: "② 空き枠を選択" })).toBeVisible();
  await expect(page.getByText("読み込み中…").filter({ visible: true })).toHaveCount(0);
};

/** 期間指定に切り替えて日数を選び、空き枠リストの表示を待つ (開始日は今日。どの日数でも1件以上ある前提) */
const selectPeriod = async (page: Page, days: number): Promise<void> => {
  await page.getByRole("button", { name: "期間指定" }).click();
  await page.getByRole("button", { name: `${days}日`, exact: true }).click();
  await expect(page.getByText("読み込み中…").filter({ visible: true })).toHaveCount(0);
  await expect(slotCheckboxes(page).first()).toBeVisible();
};

/** タブを切り替える */
const switchTab = async (page: Page, name: "編集・選択" | "プレビュー・保存"): Promise<void> => {
  await page.getByRole("tab", { name }).click();
};

test.describe("ストーリーズエディタ", () => {
  test("エディタを開く__データのある今月 (なければ直近の月) が選ばれている", async ({ page }, testInfo) => {
    await openEditor(page);
    const monthKeys = [...e2eBuildScenarioMemos().map((memo) => memo.dateKey), e2eDateKeyAfter(1)].map((key) =>
      key.slice(0, 7),
    );
    await expect(page.getByLabel("対象月")).toHaveValue(expectedDefaultMonth(monthKeys));
    await e2eScreenshot(page, "06-editor-open", testInfo, { fullPage: true });
  });

  test("過去日を含めるをONにする__今日より前の空き枠も一覧に表示される", async ({ page }) => {
    const pastCount = e2eBuildScenarioMemos().filter((memo) => memo.dateKey < e2eDateKeyAfter(0)).length;
    test.skip(pastCount === 0, "今日が月初のため、同じ月に過去日の空き枠がない");

    await openEditor(page);
    await page.getByLabel("対象月").selectOption(e2eDateKeyAfter(0).slice(0, 7));
    const countBefore = await slotCheckboxes(page).count();
    await page.getByRole("switch", { name: "過去日を含める" }).click();
    await expect(slotCheckboxes(page)).toHaveCount(countBefore + pastCount);
  });

  test("期間指定で7日・14日・28日を選ぶ__件数に応じてバッジの表示サイズが切り替わる", async ({ page }, testInfo) => {
    await openEditor(page);
    for (const days of [7, 14, 28]) {
      await test.step(`${days}日間`, async () => {
        await switchTab(page, "編集・選択");
        await selectPeriod(page, days);
        const count = await slotCheckboxes(page).count();

        await switchTab(page, "プレビュー・保存");
        await expect(canvasBadges(page)).toHaveCount(count);
        await expect(canvas(page)).toHaveAttribute("data-density", expectedDensity(count));
        await e2eScreenshot(canvas(page), `06-editor-canvas-${days}days-${count}items`, testInfo);
      });
    }
  });

  test("チェックを外す__件数とキャンバスのバッジが減り期間を変えても除外が保持される", async ({ page }) => {
    await openEditor(page);
    await selectPeriod(page, 28);
    const total = await slotCheckboxes(page).count();

    await slotCheckboxes(page).first().click();
    await expect(page.getByText(`${total}件中 ${total - 1}件をキャンバスに表示します`)).toBeVisible();
    await switchTab(page, "プレビュー・保存");
    await expect(canvasBadges(page)).toHaveCount(total - 1);

    await switchTab(page, "編集・選択");
    await page.getByRole("button", { name: "7日", exact: true }).click();
    await page.getByRole("button", { name: "28日", exact: true }).click();
    await expect(slotCheckboxes(page).first()).not.toBeChecked();
    await expect(page.getByText(`${total}件中 ${total - 1}件をキャンバスに表示します`)).toBeVisible();
  });

  test("全解除・全選択を押す__表示件数が0件・全件に切り替わる", async ({ page }) => {
    await openEditor(page);
    await selectPeriod(page, 14);
    const total = await slotCheckboxes(page).count();

    await page.getByRole("button", { name: "全解除" }).click();
    await expect(page.getByText(`${total}件中 0件をキャンバスに表示します`)).toBeVisible();
    await switchTab(page, "プレビュー・保存");
    await expect(canvasBadges(page)).toHaveCount(0);

    await switchTab(page, "編集・選択");
    await page.getByRole("button", { name: "全選択" }).click();
    await expect(page.getByText(`${total}件中 ${total}件をキャンバスに表示します`)).toBeVisible();
  });

  test("空き枠リストからメモを編集する__UPDATEDバッジが付きプレビューに反映される", async ({ page }, testInfo) => {
    await openEditor(page);
    await selectPeriod(page, 7);
    await page
      .getByRole("button", { name: /のメモを編集$/ })
      .first()
      .click();

    const dialog = page.getByRole("dialog", { name: "メモを編集" });
    await dialog.locator("#memo-content").fill("19:00〜 最終枠\n※学割あり");
    await page.getByRole("button", { name: "保存する" }).click();
    await expect(e2eToast(page, "のメモを保存しました")).toBeVisible();

    const firstRow = page
      .getByRole("listitem")
      .filter({ has: page.getByRole("button", { name: /のメモを編集$/ }) })
      .first();
    await expect(firstRow).toContainText("UPDATED");
    await expect(firstRow).toContainText("19:00〜 最終枠");
    await e2eScreenshot(page, "06-editor-updated-badge", testInfo);

    await switchTab(page, "プレビュー・保存");
    await expect(canvas(page)).toContainText("19:00〜 最終枠");
  });

  test("背景画像を選ぶ__キャンバスの背景が切り替わり再度開いても選択が保持される", async ({ page }) => {
    await openEditor(page);
    const slot3 = page.getByRole("button", { name: "スロット3を背景にする" });
    await slot3.click();
    await expect(slot3).toHaveAttribute("aria-pressed", "true");
    const slot3Style = (await slot3.getAttribute("style")) ?? "";

    await switchTab(page, "プレビュー・保存");
    await expect(canvas(page).getByTestId("story-canvas-background")).toHaveAttribute("style", slot3Style);

    await page.reload();
    await expect(page.getByRole("button", { name: "スロット3を背景にする" })).toHaveAttribute("aria-pressed", "true");
  });

  test("全画面プレビューを開いてタップする__全画面表示が解除される", async ({ page }, testInfo) => {
    await openEditor(page);
    await selectPeriod(page, 14);
    await switchTab(page, "プレビュー・保存");
    await page.getByRole("button", { name: "全画面プレビュー" }).click();

    const fullscreen = page.getByRole("dialog", { name: "全画面プレビュー (タップで解除)" });
    await expect(fullscreen).toBeVisible();
    await e2eScreenshot(page, "06-editor-fullscreen-14days", testInfo);

    await fullscreen.tap();
    await expect(fullscreen).toHaveCount(0);
  });

  test("28日間の空き枠を全画面表示する__はみ出し警告なしで1画面に収まる", async ({ page }, testInfo) => {
    await openEditor(page);
    await selectPeriod(page, 28);
    await switchTab(page, "プレビュー・保存");
    await expect(canvas(page)).toHaveAttribute("data-density", "sm");
    await expect(page.getByText("下の方の日付が1画面に表示しきれていません")).toHaveCount(0);
    await e2eScreenshot(page, "06-editor-preview-28days", testInfo, { fullPage: true });

    await page.getByRole("button", { name: "全画面プレビュー" }).click();
    await e2eScreenshot(page, "06-editor-fullscreen-28days", testInfo);
  });

  test("1か月分の空き枠を月指定で表示する__月全体のスクリーンショットを保存できる", async ({ page }, testInfo) => {
    await openEditor(page);
    const busiestMonth = Object.entries(
      e2eBuildScenarioMemos().reduce<Record<string, number>>((counts, memo) => {
        const monthKey = memo.dateKey.slice(0, 7);
        return { ...counts, [monthKey]: (counts[monthKey] ?? 0) + 1 };
      }, {}),
    ).sort((a, b) => b[1] - a[1])[0][0];
    await page.getByLabel("対象月").selectOption(busiestMonth);
    await page.getByRole("switch", { name: "過去日を含める" }).click();
    await expect(page.getByText("読み込み中…").filter({ visible: true })).toHaveCount(0);
    const count = await slotCheckboxes(page).count();

    await switchTab(page, "プレビュー・保存");
    await expect(canvasBadges(page)).toHaveCount(count);
    await page.getByRole("button", { name: "全画面プレビュー" }).click();
    await e2eScreenshot(page, `06-editor-fullscreen-month-${busiestMonth}-${count}items`, testInfo);
  });
});
