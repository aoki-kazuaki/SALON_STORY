import type { Page } from "@playwright/test";

import {
  E2E_OWNER,
  E2E_STAFF,
  E2E_STAFF_CHANGED_EMAIL,
  E2E_STAFF_CHANGED_PASSWORD,
  E2E_STAFF_RESET_PASSWORD,
} from "../support/data";
import { e2eConfirmDialog, e2eFieldError, e2eLogin, e2eScreenshot, expect, test } from "../support/fixtures";

/** パスワード変更フォームに入力し、確認ダイアログで「変更する」を押す */
const submitPasswordChange = async (page: Page, currentPassword: string, newPassword: string): Promise<void> => {
  await page.locator("#settings-current-password").fill(currentPassword);
  await page.locator("#settings-password").fill(newPassword);
  await page.locator("#settings-password-confirm").fill(newPassword);
  await page.locator("form:has(#settings-password)").getByRole("button", { name: "変更する" }).click();
};

/** メールアドレス変更フォームに入力して送信する */
const submitEmailChange = async (page: Page, email: string): Promise<void> => {
  await page.locator("#settings-email").fill(email);
  await page.locator("form:has(#settings-email)").getByRole("button", { name: "変更する" }).click();
};

// PWリセット後のスタッフでログインし、ユーザー設定を開く (パスワード変更は最後のテストで行う)
test.beforeEach(async ({ page }) => {
  await e2eLogin(page, E2E_STAFF.username, E2E_STAFF_RESET_PASSWORD);
  await page.getByRole("link", { name: "ユーザー設定" }).click();
  await expect(page.getByRole("heading", { name: "ユーザー設定" })).toBeVisible();
  await expect(page.getByText(E2E_STAFF.username, { exact: true })).toBeVisible();
});

test.describe("ユーザー設定 (メールアドレス・パスワード変更)", () => {
  test("現在のパスワードを誤って入力し変更する__現在のパスワード欄にエラーが表示される", async ({ page }) => {
    await submitPasswordChange(page, "Wrong2026pass", E2E_STAFF_CHANGED_PASSWORD);
    await e2eConfirmDialog(page).getByRole("button", { name: "変更する" }).click();
    await expect(e2eFieldError(page, "settings-current-password")).toHaveText("現在のパスワードが正しくありません");
  });

  test("現在と同じパスワードを新しいパスワードにする__異なるパスワードを求めるエラーが表示される", async ({ page }) => {
    await submitPasswordChange(page, E2E_STAFF_RESET_PASSWORD, E2E_STAFF_RESET_PASSWORD);
    await expect(e2eFieldError(page, "settings-password")).toHaveText(
      "現在のパスワードとは異なるパスワードを入力してください",
    );
    await expect(e2eConfirmDialog(page)).toHaveCount(0);
  });

  test("条件を満たさない新しいパスワードにする__パスワードの条件エラーが表示される", async ({ page }) => {
    await submitPasswordChange(page, E2E_STAFF_RESET_PASSWORD, "onlylower2026");
    await expect(e2eFieldError(page, "settings-password")).toHaveText(
      "英大文字・英小文字・数字をそれぞれ含む8文字以上で入力してください",
    );
  });

  test("現在と同じメールアドレスを入力する__新しいメールアドレスを求めるエラーが表示される", async ({ page }) => {
    await submitEmailChange(page, E2E_STAFF.email.toUpperCase());
    await expect(e2eFieldError(page, "settings-email")).toHaveText(
      "現在と同じメールアドレスです。新しいメールアドレスを入力してください",
    );
  });

  test("他のユーザーのメールアドレスに変更する__確認後に重複エラーが入力欄に表示される", async ({ page }) => {
    await submitEmailChange(page, E2E_OWNER.email);
    await e2eConfirmDialog(page).getByRole("button", { name: "変更する" }).click();
    await expect(e2eFieldError(page, "settings-email")).toHaveText(
      "このメールアドレスは既に使用されています。別のメールアドレスを入力してください",
    );
  });

  test("メールアドレスを変更する__ダッシュボードに完了バナーが表示され設定に反映される", async ({ page }, testInfo) => {
    await submitEmailChange(page, E2E_STAFF_CHANGED_EMAIL);
    await expect(e2eConfirmDialog(page)).toContainText("メールアドレスを変更しますか？");
    await e2eConfirmDialog(page).getByRole("button", { name: "変更する" }).click();

    await page.waitForURL(/\/dashboard$/);
    await expect(page.getByRole("status").filter({ hasText: "メールアドレスを変更しました" })).toBeVisible();
    await e2eScreenshot(page, "02-dashboard-banner", testInfo);

    await page.getByRole("link", { name: "ユーザー設定" }).click();
    await expect(page.getByText(E2E_STAFF_CHANGED_EMAIL, { exact: true })).toBeVisible();
  });

  test("パスワードを変更する__完了バナーが表示され新しいパスワードでのみログインできる", async ({ page }) => {
    await submitPasswordChange(page, E2E_STAFF_RESET_PASSWORD, E2E_STAFF_CHANGED_PASSWORD);
    await e2eConfirmDialog(page).getByRole("button", { name: "変更する" }).click();

    await page.waitForURL(/\/dashboard$/);
    await expect(page.getByRole("status").filter({ hasText: "パスワードを変更しました" })).toBeVisible();

    await test.step("変更前のパスワードではログインできない", async () => {
      await page.context().clearCookies();
      await page.goto("/login");
      await page.getByLabel("ログインID または メールアドレス").fill(E2E_STAFF.username);
      await page.locator("#login-password").fill(E2E_STAFF_RESET_PASSWORD);
      await page.getByRole("button", { name: "ログイン" }).click();
      await expect(page.locator("form").getByRole("alert")).toBeVisible();
    });

    await test.step("変更後のパスワード・変更後のメールアドレスでログインできる", async () => {
      await e2eLogin(page, E2E_STAFF_CHANGED_EMAIL, E2E_STAFF_CHANGED_PASSWORD);
    });
  });
});
