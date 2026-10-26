import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // E2E テストは開発サーバーと並行して起動できるよう、別のビルド出力先を使う (未指定時は既定の .next)
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
