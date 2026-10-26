import type { Page } from "@playwright/test";

import { E2E_OWNER, E2E_OWNER_STORAGE_STATE, E2E_STAFF, E2E_STAFF_RESET_PASSWORD } from "../support/data";
import { e2eConfirmDialog, e2eFieldError, e2eLogin, e2eScreenshot, e2eToast, expect, test } from "../support/fixtures";

/** ID/パスワード誤りのエラーメッセージ (どちらが誤りかは区別しない) */
const INVALID_CREDENTIALS_MESSAGE = "ログインID (メールアドレス) またはパスワードが正しくありません";

/** パスワードの文字種ルールのエラーメッセージ */
const PASSWORD_RULE_MESSAGE = "英大文字・英小文字・数字をそれぞれ含む8文字以上で入力してください";

/** 新規登録フォームに入力して送信する */
const submitRegister = async (
  page: Page,
  values: { username: string; email: string; password: string; passwordConfirm: string },
): Promise<void> => {
  await page.goto("/register");
  await page.locator("#register-username").fill(values.username);
  await page.locator("#register-email").fill(values.email);
  await page.locator("#register-password").fill(values.password);
  await page.locator("#register-password-confirm").fill(values.passwordConfirm);
  await page.getByRole("button", { name: "登録する" }).click();
};

/** ログイン画面で送信だけ行う (成功・失敗のどちらも待たない) */
const submitLogin = async (page: Page, identifier: string, password: string): Promise<void> => {
  await page.goto("/login");
  await page.getByLabel("ログインID または メールアドレス").fill(identifier);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: "ログイン" }).click();
};

/** 管理者メニューの承認待ち行 (承認ボタンを持つ行。ローカル送信メールの行は含まない) */
const pendingRow = (page: Page, username: string) =>
  page
    .getByRole("listitem")
    .filter({ hasText: username })
    .filter({ has: page.getByRole("button", { name: "承認", exact: true }) });

/** 管理者メニューで対象ユーザーの承認待ち (新規登録・PWリセット) を承認する */
const approveOnAdminPage = async (page: Page, username: string): Promise<void> => {
  await page.goto("/dashboard/admin");
  await pendingRow(page, username).getByRole("button", { name: "承認", exact: true }).click();
  await e2eConfirmDialog(page).getByRole("button", { name: "承認する" }).click();
};

test.describe("認証 (新規登録・承認・ログイン・PWリセット)", () => {
  test("未入力のまま登録する__各項目に必須エラーが表示される", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: "登録する" }).click();

    await expect(e2eFieldError(page, "register-username")).toHaveText("3文字以上で入力してください");
    await expect(e2eFieldError(page, "register-email")).toHaveText("メールアドレスの形式が正しくありません");
    await expect(e2eFieldError(page, "register-password")).toHaveText("8文字以上で入力してください");
    await expect(e2eFieldError(page, "register-password-confirm")).toHaveText(
      "確認のため、もう一度パスワードを入力してください",
    );
  });

  test("条件を満たさないパスワードで登録する__パスワードの条件エラーが表示される", async ({ page }) => {
    const cases = [
      { password: "Abc1234", message: "8文字以上で入力してください", label: "7文字" },
      { password: "salon2026", message: PASSWORD_RULE_MESSAGE, label: "英大文字なし" },
      { password: "SALON2026", message: PASSWORD_RULE_MESSAGE, label: "英小文字なし" },
      { password: "SalonOwner", message: PASSWORD_RULE_MESSAGE, label: "数字なし" },
    ];
    for (const { password, message, label } of cases) {
      await test.step(label, async () => {
        await submitRegister(page, { ...E2E_OWNER, password, passwordConfirm: password });
        await expect(e2eFieldError(page, "register-password")).toHaveText(message);
        await expect(page).toHaveURL(/\/register$/);
      });
    }
  });

  test("確認用に別のパスワードを入力して登録する__不一致エラーが表示される", async ({ page }) => {
    await submitRegister(page, { ...E2E_OWNER, passwordConfirm: `${E2E_OWNER.password}x` });
    await expect(e2eFieldError(page, "register-password-confirm")).toHaveText("パスワードが一致しません");
  });

  test("目のアイコンを押す__入力中のパスワードが表示・非表示に切り替わる", async ({ page }, testInfo) => {
    await page.goto("/register");
    const passwordInput = page.locator("#register-password");
    await passwordInput.fill(E2E_OWNER.password);
    await expect(passwordInput).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "パスワードを表示" }).first().click();
    await expect(passwordInput).toHaveAttribute("type", "text");
    await expect(passwordInput).toHaveValue(E2E_OWNER.password);
    await e2eScreenshot(page, "01-register-password-visible", testInfo);

    await page.getByRole("button", { name: "パスワードを隠す" }).click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("最初のユーザーを登録する__管理者としてダッシュボードに遷移する", async ({ page }, testInfo) => {
    await submitRegister(page, { ...E2E_OWNER, passwordConfirm: E2E_OWNER.password });

    await page.waitForURL("**/dashboard");
    await expect(page.getByText(`${E2E_OWNER.username} さん、今日の空き枠を告知しましょう。`)).toBeVisible();
    await expect(page.getByRole("link", { name: "管理者メニュー" })).toBeVisible();
    await e2eScreenshot(page, "01-dashboard-first-user", testInfo, { fullPage: true });

    // 以降のシナリオは管理者のログイン状態を再利用する
    await page.context().storageState({ path: E2E_OWNER_STORAGE_STATE });
  });

  test("登録済みのログインIDで登録する__ログインID欄に重複エラーが表示される", async ({ page }) => {
    await submitRegister(page, {
      ...E2E_STAFF,
      username: E2E_OWNER.username,
      passwordConfirm: E2E_STAFF.password,
    });
    await expect(e2eFieldError(page, "register-username")).toHaveText(
      "このログインIDは既に使用されています。別のログインIDを入力してください",
    );
  });

  test("登録済みのメールアドレスで登録する__登録済みとは断定せずにログイン・再設定へ案内される", async ({ page }) => {
    await submitRegister(page, { ...E2E_STAFF, email: E2E_OWNER.email, passwordConfirm: E2E_STAFF.password });
    await expect(e2eFieldError(page, "register-email")).toHaveText(
      "登録を完了できませんでした。このメールアドレスで登録済みの場合は、ログインするか、パスワードの再設定を申請してください",
    );
    await expect(page).toHaveURL(/\/register$/);
  });

  test("2人目のユーザーを登録する__承認待ち画面に遷移する", async ({ page }, testInfo) => {
    await submitRegister(page, { ...E2E_STAFF, passwordConfirm: E2E_STAFF.password });

    await page.waitForURL("**/register/pending");
    await expect(page.getByText("管理者の承認待ちです")).toBeVisible();
    await e2eScreenshot(page, "01-register-pending", testInfo);
  });

  test("承認前のユーザーでログインする__承認待ち画面に遷移する", async ({ page }) => {
    await submitLogin(page, E2E_STAFF.username, E2E_STAFF.password);
    await page.waitForURL("**/register/pending");
  });

  test("管理者が新規登録を承認する__承認待ちから消え本人へ承認メールが送信される", async ({ page }, testInfo) => {
    await e2eLogin(page, E2E_OWNER.username, E2E_OWNER.password);
    await page.goto("/dashboard/admin");
    await expect(page.getByText(`ログインID: ${E2E_STAFF.username}`)).toBeVisible();

    await approveOnAdminPage(page, E2E_STAFF.username);

    await expect(e2eToast(page, "新規登録の承認状態を更新しました")).toBeVisible();
    await expect(pendingRow(page, E2E_STAFF.username)).toHaveCount(0);
    await expect(page.getByText(`宛先: ${E2E_STAFF.email}`)).toBeVisible();
    await expect(page.getByText("【サロン空き状況】アカウントが承認されました")).toBeVisible();
    await e2eScreenshot(page, "01-admin-approved", testInfo, { fullPage: true });
  });

  test("承認後のユーザーがログインIDでログインする__ダッシュボードに遷移する", async ({ page }) => {
    await e2eLogin(page, E2E_STAFF.username, E2E_STAFF.password);
    await expect(page.getByText(`${E2E_STAFF.username} さん、今日の空き枠を告知しましょう。`)).toBeVisible();
    await expect(page.getByRole("link", { name: "管理者メニュー" })).toHaveCount(0);
  });

  test("メールアドレスでログインする__ダッシュボードに遷移する", async ({ page }) => {
    await e2eLogin(page, E2E_STAFF.email, E2E_STAFF.password);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("誤ったパスワードや存在しないIDでログインする__どれも同じエラーメッセージが表示される", async ({ page }) => {
    const cases = [
      { identifier: E2E_STAFF.username, label: "登録済みID・誤ったパスワード" },
      { identifier: "nobody_here", label: "存在しないID" },
      { identifier: "nobody@salon-e2e.test", label: "存在しないメールアドレス" },
    ];
    for (const { identifier, label } of cases) {
      await test.step(label, async () => {
        await submitLogin(page, identifier, "Wrong2026pass");
        await expect(page.locator("form").getByRole("alert")).toHaveText(INVALID_CREDENTIALS_MESSAGE);
      });
    }
  });

  test("短時間にログイン失敗を繰り返す__一時的に制限されている旨が表示される", async ({ page }) => {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await submitLogin(page, E2E_STAFF.username, "Wrong2026pass");
      await expect(page.locator("form").getByRole("alert")).toHaveText(INVALID_CREDENTIALS_MESSAGE);
    }
    await submitLogin(page, E2E_STAFF.username, E2E_STAFF.password);
    await expect(page.locator("form").getByRole("alert")).toContainText("一時的に制限しています");
  });

  test("未ログインでダッシュボード配下を開く__ログイン後に元の画面へ戻る", async ({ page }) => {
    await page.goto("/dashboard/records");
    await page.waitForURL("**/login?redirect=%2Fdashboard%2Frecords");

    await page.getByLabel("ログインID または メールアドレス").fill(E2E_STAFF.username);
    await page.locator("#login-password").fill(E2E_STAFF.password);
    await page.getByRole("button", { name: "ログイン" }).click();
    await page.waitForURL("**/dashboard/records");
  });

  test("一般ユーザーが管理者メニューを開く__ダッシュボードに戻される", async ({ page }) => {
    await e2eLogin(page, E2E_STAFF.username, E2E_STAFF.password);
    await page.goto("/dashboard/admin");
    await page.waitForURL(/\/dashboard$/);
  });

  test("ログアウトを確定する__ログイン画面に戻りダッシュボードを開けなくなる", async ({ page }) => {
    await e2eLogin(page, E2E_STAFF.username, E2E_STAFF.password);
    await page.getByRole("button", { name: "ログアウト" }).click();
    await e2eConfirmDialog(page).getByRole("button", { name: "ログアウト" }).click();
    await page.waitForURL(/\/login/);
    // 前回の入力値 (ID・パスワード) がログイン画面に残っていない
    await expect(page.getByLabel("ログインID または メールアドレス")).toHaveValue("");
    await expect(page.locator("#login-password")).toHaveValue("");

    await page.goto("/dashboard");
    await page.waitForURL("**/login?redirect=%2Fdashboard");
  });

  test("存在しないメールアドレスでPWリセットを申請する__登録済みと同じ受付メッセージが表示される", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("登録済みのメールアドレス").fill("nobody@salon-e2e.test");
    await page.getByRole("button", { name: "リセットを申請する" }).click();
    await expect(page.getByText("申請を受け付けました。")).toBeVisible();
  });

  test("PWリセットを申請する__管理者の承認後に届くURLから再設定し新しいパスワードでログインできる", async ({
    page,
  }, testInfo) => {
    await test.step("本人がリセットを申請する", async () => {
      await page.goto("/forgot-password");
      await page.getByLabel("登録済みのメールアドレス").fill(E2E_STAFF.email);
      await page.getByRole("button", { name: "リセットを申請する" }).click();
      await expect(page.getByText("申請を受け付けました。")).toBeVisible();
    });

    const resetUrl = await test.step("管理者が承認し、ローカル送信メールから再設定URLを取得する", async () => {
      await e2eLogin(page, E2E_OWNER.username, E2E_OWNER.password);
      await approveOnAdminPage(page, E2E_STAFF.username);
      await expect(pendingRow(page, E2E_STAFF.username)).toHaveCount(0);
      const mail = page.getByRole("listitem").filter({ hasText: "パスワード再設定のご案内" }).first();
      return (await mail.getByRole("link").getAttribute("href")) ?? "";
    });

    await test.step("再設定URLを開き、新しいパスワードを設定する", async () => {
      await page.goto(resetUrl);
      await expect(page.locator("#reset-email")).toHaveValue(E2E_STAFF.email);
      await expect(page.locator("#reset-email")).toBeDisabled();
      await page.locator("#reset-password").fill(E2E_STAFF_RESET_PASSWORD);
      await page.locator("#reset-password-confirm").fill(E2E_STAFF_RESET_PASSWORD);
      await e2eScreenshot(page, "01-reset-password", testInfo);
      await page.getByRole("button", { name: "パスワードを再設定する" }).click();
      await expect(page.getByText("パスワードを再設定しました。")).toBeVisible();
    });

    await test.step("新しいパスワードでログインできる", async () => {
      await e2eLogin(page, E2E_STAFF.username, E2E_STAFF_RESET_PASSWORD);
    });
  });

  test("無効なトークンで再設定画面を開く__URLが無効である旨が表示される", async ({ page }) => {
    await page.goto("/reset-password?token=invalid-token");
    await expect(page.getByText("URLが無効、または有効期限が切れています。")).toBeVisible();
  });
});
