import { spawnSync } from "node:child_process";

/** テスト終了後に E2E 専用の Docker を停止・破棄する (E2E_KEEP_DOCKER="true" の場合は調査用に残す) */
const globalTeardown = (): void => {
  if (process.env.E2E_KEEP_DOCKER === "true") return;
  spawnSync("docker", ["compose", "-f", "docker-compose.e2e.yml", "down", "-v", "--remove-orphans"], {
    stdio: "inherit",
    shell: true,
  });
};

export default globalTeardown;
