import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // マイグレーションはコネクションプーラーを経由しない直接接続URLを優先する (Neon 等。未設定時は DATABASE_URL)
    url: process.env["DIRECT_DATABASE_URL"] || process.env["DATABASE_URL"],
  },
});
