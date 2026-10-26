// 本番依存ライブラリのライセンス検査 (npm run license:check / CI で実行)
// - ソースコード公開などの義務を伴わない「許容ライセンス」のみ許可する (許可リスト方式)
// - 許可リスト外のライセンスがあれば一覧を表示して異常終了する
// - フレームワークが間接的に依存し、取り除けないものは理由を明記して例外にする
import { execSync } from "node:child_process";

/** 許可するライセンス (著作権表示以外の義務がない許容型ライセンス) */
const ALLOWED_LICENSES = new Set([
  "MIT",
  "MIT-0",
  "ISC",
  "0BSD",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "Apache-2.0",
  "Unlicense",
  "CC0-1.0",
  "BlueOak-1.0.0",
  "Python-2.0",
]);

/**
 * 例外として許可するパッケージ (パッケージ名の前方一致)
 * いずれもフレームワークの間接依存で、本アプリのコードには組み込まれず、配布もしない (Web サービスとして提供するのみ)
 */
const EXCEPTIONS = [
  {
    prefix: "@img/sharp-",
    license: "LGPL-3.0 (libvips)",
    reason: "Next.js の画像最適化用。本アプリは next/image を使わず、Vercel では Vercel 側の最適化が使われる",
  },
  {
    prefix: "lightningcss",
    license: "MPL-2.0",
    reason: "Vite (better-auth 経由) のビルド時の CSS 処理のみ。成果物には含まれない",
  },
  {
    prefix: "elkjs",
    license: "EPL-2.0",
    reason: "Prisma Studio (開発用の管理画面) の図の描画用。アプリの実行時には使われない",
  },
  {
    prefix: "caniuse-lite",
    license: "CC-BY-4.0",
    reason: "Next.js がビルド時に参照するブラウザ対応状況のデータ。義務は出典表示のみ",
  },
];

/** "MIT OR Apache-2.0" / "(MIT AND Zlib)" / "ISC*" (推定) 形式のライセンス表記が許可リストを満たすか */
const isAllowedLicense = (license) => {
  const normalized = license.replace(/[()*]/g, "").trim();
  if (normalized.includes(" OR ")) return normalized.split(" OR ").some((part) => isAllowedLicense(part));
  if (normalized.includes(" AND ")) return normalized.split(" AND ").every((part) => isAllowedLicense(part));
  return ALLOWED_LICENSES.has(normalized);
};

/** 例外に該当するか */
const findException = (packageName) => EXCEPTIONS.find((exception) => packageName.startsWith(exception.prefix));

const output = execSync("npx license-checker --production --excludePrivatePackages --json", {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});
const packages = Object.entries(JSON.parse(output)).map(([nameWithVersion, info]) => ({
  nameWithVersion,
  name: nameWithVersion.slice(0, nameWithVersion.lastIndexOf("@")),
  license: [info.licenses ?? "UNKNOWN"].flat().join(" OR "),
}));

const violations = packages.filter((pkg) => !isAllowedLicense(pkg.license) && !findException(pkg.name));
const exceptions = packages.filter((pkg) => !isAllowedLicense(pkg.license) && findException(pkg.name));

console.log(`本番依存 ${packages.length} 件のライセンスを確認しました`);
if (exceptions.length > 0) {
  console.log("\n例外として許可したパッケージ:");
  exceptions.forEach((pkg) =>
    console.log(`  - ${pkg.nameWithVersion} (${pkg.license}): ${findException(pkg.name).reason}`),
  );
}
if (violations.length > 0) {
  console.error("\n許可されていないライセンスのパッケージ (別のライブラリへの置き換えを検討してください):");
  violations.forEach((pkg) => console.error(`  - ${pkg.nameWithVersion}: ${pkg.license}`));
  process.exit(1);
}
console.log("\n許可されていないライセンスはありません");
