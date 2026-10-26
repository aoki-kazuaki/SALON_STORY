import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // カバレッジ (npm run test:coverage)。単体テストの対象 (atoms / molecules / utils / lib の純粋な処理) に限定する
    // organisms 以上は E2E (Playwright)、zShadcnBase は対象外のため含めない
    coverage: {
      provider: "v8",
      include: [
        "src/components/atoms/**/*.tsx",
        "src/components/molecules/**/*.tsx",
        "src/utils/**/*.ts",
        "src/lib/schemas.ts",
        "src/lib/authError.ts",
      ],
      exclude: ["**/*.test.{ts,tsx}", "**/*.stories.tsx"],
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      // いずれかが 90% を下回ると失敗する (CI でマージを止める基準)
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
