import { mkdirSync } from "node:fs";
import path from "node:path";

import { test as base, expect, type Locator, type Page, type TestInfo } from "@playwright/test";

/** スクリーンショットの保存先 (レポートにも添付する) */
const SCREENSHOT_DIR = "e2e/screenshots";

/** テストごとに割り当てる送信元IPの連番 */
let clientIpSequence = 0;

/**
 * 共通フィクスチャ
 * - テストごとに異なる送信元IP (X-Forwarded-For) を付与する
 *   BetterAuth のログイン回数制限 (同一IPで10秒に3回) を、別々の利用者として扱うため
 */
export const test = base.extend({
  // フィクスチャの提供関数は React の use と誤検知されないよう provide と命名する
  extraHTTPHeaders: async ({}, provide) => {
    clientIpSequence += 1;
    await provide({ "X-Forwarded-For": `10.0.${Math.floor(clientIpSequence / 250)}.${(clientIpSequence % 250) + 1}` });
  },
});

export { expect };

/** トースト通知 (Sonner) */
export const e2eToast = (page: Page, text: string | RegExp): Locator =>
  page.locator("[data-sonner-toast]").filter({ hasText: text });

/** 確認ダイアログ (CConfirmDialog) */
export const e2eConfirmDialog = (page: Page): Locator => page.getByRole("alertdialog");

/** 入力欄の下に表示されるエラーメッセージ (CFormField) */
export const e2eFieldError = (page: Page, fieldId: string): Locator =>
  page.locator(`div:has(> #${fieldId}), div:has(> div > #${fieldId})`).getByRole("alert");

/** ログイン画面からログインし、ダッシュボードへの遷移を待つ */
export const e2eLogin = async (page: Page, identifier: string, password: string): Promise<void> => {
  await page.goto("/login");
  await page.getByLabel("ログインID または メールアドレス").fill(identifier);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: "ログイン" }).click();
  await page.waitForURL("**/dashboard");
};

/** スクリーンショットを e2e/screenshots に保存し、HTML レポートにも添付する */
export const e2eScreenshot = async (
  target: Page | Locator,
  name: string,
  testInfo: TestInfo,
  options: { fullPage?: boolean } = {},
): Promise<void> => {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  const isPage = "goto" in target;
  if (isPage) await target.screenshot({ path: filePath, fullPage: options.fullPage ?? false });
  if (!isPage) await target.screenshot({ path: filePath });
  await testInfo.attach(name, { path: filePath, contentType: "image/png" });
};

/** 画像生成の指定 */
type ImageSpec = {
  /** 幅 (px) */
  width: number;
  /** 高さ (px) */
  height: number;
  /** グラデーションの色 (上 → 下) */
  colors: [string, string];
  /** ノイズを加えるか (圧縮しにくい大きな写真を再現する) */
  isNoisy: boolean;
};

/** ブラウザの canvas で背景画像用の JPEG を生成する (アップロード用のテストデータ) */
export const e2eCreateJpeg = async (page: Page, spec: ImageSpec): Promise<Buffer> => {
  const dataUrl = await page.evaluate(({ width, height, colors, isNoisy }) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return "";
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    if (isNoisy) {
      const image = context.getImageData(0, 0, width, height);
      for (let i = 0; i < image.data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 120;
        image.data[i] += noise;
        image.data[i + 1] += noise;
        image.data[i + 2] += noise;
      }
      context.putImageData(image, 0, 0);
    }
    return canvas.toDataURL("image/jpeg", 0.95);
  }, spec);
  return Buffer.from(dataUrl.split(",")[1] ?? "", "base64");
};
