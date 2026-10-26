import type { Page } from "@playwright/test";

import { E2E_OWNER_STORAGE_STATE } from "../support/data";
import { e2eConfirmDialog, e2eCreateJpeg, e2eScreenshot, e2eToast, expect, test } from "../support/fixtures";

test.use({ storageState: E2E_OWNER_STORAGE_STATE });

/** 背景画像のグラデーション (スロット番号順。スクリーンショットで見分けやすい色) */
const SLOT_COLORS: Record<number, [string, string]> = {
  2: ["#d8b4a0", "#5b3a29"],
  3: ["#a7c4bc", "#2f4f4f"],
  4: ["#e8c8d8", "#6b3f5a"],
};

/** 背景画像管理を開く */
const openBackgrounds = async (page: Page): Promise<void> => {
  await page.goto("/dashboard/backgrounds");
  await expect(page.getByText("スロット 1", { exact: true })).toBeVisible();
};

/** スロットのサムネイルに表示されている画像URL */
const thumbnailUrl = async (page: Page, slotNumber: number): Promise<string> => {
  const style = (await page.getByRole("img", { name: `スロット${slotNumber}の背景画像` }).getAttribute("style")) ?? "";
  return style.match(/url\("(.+?)"\)/)?.[1] ?? "";
};

/** スロットに画像をアップロードし、完了トーストを待つ */
const uploadToSlot = async (page: Page, slotNumber: number, buffer: Buffer): Promise<void> => {
  await page.getByLabel(`スロット${slotNumber}の画像を選択`).setInputFiles({
    name: `slot${slotNumber}.jpg`,
    mimeType: "image/jpeg",
    buffer,
  });
  await expect(e2eToast(page, `スロット${slotNumber}に画像を登録しました`)).toBeVisible({ timeout: 30_000 });
};

test.describe("背景画像管理", () => {
  test("背景画像管理を開く__4つの空きスロットが表示される", async ({ page }, testInfo) => {
    await openBackgrounds(page);
    await expect(page.getByRole("button", { name: "画像をアップロード" })).toHaveCount(4);
    await expect(page.getByText("スロット 5", { exact: true })).toHaveCount(0);
    await e2eScreenshot(page, "05-backgrounds-empty", testInfo, { fullPage: true });
  });

  test("対応していない形式の画像を選ぶ__エラーが表示され登録されない", async ({ page }) => {
    await openBackgrounds(page);
    await page.getByLabel("スロット1の画像を選択").setInputFiles({
      name: "animation.gif",
      mimeType: "image/gif",
      buffer: Buffer.from("GIF89a"),
    });
    await expect(e2eToast(page, "この形式の画像は登録できません")).toBeVisible();
    await expect(page.getByRole("button", { name: "画像をアップロード" })).toHaveCount(4);
  });

  test("サイズの大きな写真をアップロードする__長辺1920px以下・約1MB以下に軽量化されて登録される", async ({ page }) => {
    await openBackgrounds(page);
    const photo = await e2eCreateJpeg(page, {
      width: 3024,
      height: 4032,
      colors: ["#cfa98a", "#3d2b22"],
      isNoisy: true,
    });
    expect(photo.length).toBeGreaterThan(4 * 1024 * 1024);

    await uploadToSlot(page, 1, photo);

    const url = await thumbnailUrl(page, 1);
    const stored = await page.request.get(url);
    expect((await stored.body()).length).toBeLessThan(1.2 * 1024 * 1024);
    const [width, height] = await page.evaluate(async (src) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    }, url);
    expect(Math.max(width, height)).toBeLessThanOrEqual(1920);
  });

  test("残りのスロットに画像を登録する__4枠すべてにサムネイルが表示される", async ({ page }, testInfo) => {
    await openBackgrounds(page);
    for (const [slotNumber, colors] of Object.entries(SLOT_COLORS)) {
      const image = await e2eCreateJpeg(page, { width: 1080, height: 1920, colors, isNoisy: false });
      await uploadToSlot(page, Number(slotNumber), image);
    }
    await expect(page.getByRole("img", { name: /^スロット\dの背景画像$/ })).toHaveCount(4);
    await expect(page.getByRole("button", { name: "画像をアップロード" })).toHaveCount(0);
    await e2eScreenshot(page, "05-backgrounds-filled", testInfo, { fullPage: true });
  });

  test("画像を上書き変更する__新しい画像に差し替わる", async ({ page }) => {
    await openBackgrounds(page);
    const before = await thumbnailUrl(page, 2);
    const image = await e2eCreateJpeg(page, {
      width: 1080,
      height: 1920,
      colors: ["#f2d7b6", "#8a5a3b"],
      isNoisy: false,
    });
    await uploadToSlot(page, 2, image);
    await expect.poll(() => thumbnailUrl(page, 2)).not.toBe(before);
  });

  test("画像を削除する__確認後に空きスロットに戻る", async ({ page }) => {
    await openBackgrounds(page);
    await page
      .locator("div.grid")
      .filter({ has: page.getByText("スロット 4", { exact: true }) })
      .last()
      .getByRole("button", { name: "削除" })
      .click();
    await expect(e2eConfirmDialog(page)).toContainText("スロット4の画像を削除しますか？");
    await e2eConfirmDialog(page).getByRole("button", { name: "削除" }).click();

    await expect(e2eToast(page, "スロット4の画像を削除しました")).toBeVisible();
    await expect(page.getByRole("button", { name: "画像をアップロード" })).toHaveCount(1);
  });
});
