// E2E 用のアプリを起動する (Playwright の webServer から呼ばれる)
// 1. E2E 専用の Docker (PostgreSQL / MinIO) を空の状態で作り直す
// 2. マイグレーションを適用する
// 3. 本番ビルドして next start で起動する (開発サーバーとは別ポート・別ビルド出力先)
import { spawn, spawnSync } from "node:child_process";

const COMPOSE = ["compose", "-f", "docker-compose.e2e.yml"];

/** 環境変数は playwright.config.ts の webServer.env から渡される */
const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: "inherit", shell: true, env: process.env });
  if (!(result.status === 0)) {
    console.error(`[e2e] failed: ${command} ${args.join(" ")}`);
    process.exit(result.status ?? 1);
  }
};

run("docker", [...COMPOSE, "down", "-v", "--remove-orphans"]);
run("docker", [...COMPOSE, "up", "-d", "--wait"]);
run("npx", ["prisma", "migrate", "deploy"]);
if (!(process.env.E2E_SKIP_BUILD === "true")) run("npx", ["next", "build"]);

const server = spawn("npx", ["next", "start", "-p", process.env.E2E_APP_PORT], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});
server.on("exit", (code) => process.exit(code ?? 0));
