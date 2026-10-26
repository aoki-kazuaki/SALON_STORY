import { defineConfig } from "@playwright/test";

import { E2E_APP_PORT, E2E_BASE_URL, E2E_SERVER_ENV } from "./e2e/support/env";

// テストコード側の日付計算をブラウザ (Asia/Tokyo) と揃える
process.env.TZ = "Asia/Tokyo";

// 画面を表示して実行する場合 (--headed) は、操作を目で追えるよう既定で各操作を 0.5 秒ずつ遅らせる
// (ワーカープロセスは環境変数を引き継ぐため、ここで設定した値がブラウザ起動時に使われる)
if (process.argv.includes("--headed")) process.env.E2E_SLOW_MO ??= "500";

/**
 * E2E (シナリオ) テスト設定
 * - 専用 Docker (空の DB) で起動したアプリに対し、初回ユーザー登録から順に実行するため直列実行
 * - スマートフォン (iPhone 相当の画面幅) で操作する
 */
export default defineConfig({
  testDir: "./e2e/specs",
  outputDir: "./e2e/results",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  reporter: [["list"], ["html", { outputFolder: "./e2e/report", open: "never" }]],
  globalTeardown: "./e2e/support/globalTeardown.ts",
  use: {
    baseURL: E2E_BASE_URL,
    browserName: "chromium",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // 各操作の間の待ち時間 (ミリ秒)。E2E_SLOW_MO で変更できる
    launchOptions: { slowMo: Number(process.env.E2E_SLOW_MO ?? "0") },
  },
  webServer: {
    command: "node e2e/server.mjs",
    url: `${E2E_BASE_URL}/login`,
    env: { ...E2E_SERVER_ENV, E2E_APP_PORT: String(E2E_APP_PORT) },
    // 毎回空の DB から始めるため、起動済みのサーバーは再利用しない
    reuseExistingServer: false,
    // Docker 起動 + 本番ビルドを含むため長めに待つ
    timeout: 600_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
