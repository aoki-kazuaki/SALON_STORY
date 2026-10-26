// CodeQL の解析結果 (SARIF) に深刻度 High 以上の検出があれば、一覧を表示して異常終了する (security.yml から実行)
// CodeQL 自体は検出があっても失敗しないため、マージを止めるためにこのスクリプトで判定する
// 使い方: node .github/scripts/codeql-gate.mjs <SARIF のディレクトリ>
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/** この値以上の security-severity を High 以上とみなす (GitHub の基準: 7.0〜8.9 High / 9.0〜 Critical) */
const HIGH_SEVERITY_THRESHOLD = 7.0;

const sarifDir = process.argv[2] ?? "sarif-results";
const sarifFiles = readdirSync(sarifDir).filter((name) => name.endsWith(".sarif"));

/** ルールID ごとの security-severity (ルール定義は driver と extensions のどちらにも置かれ得る) */
const severityByRuleId = (run) =>
  new Map(
    [
      ...(run.tool.driver.rules ?? []),
      ...(run.tool.extensions ?? []).flatMap((extension) => extension.rules ?? []),
    ].map((rule) => [rule.id, Number(rule.properties?.["security-severity"] ?? 0)]),
  );

/** 検出1件を「ルール: 内容 (ファイル:行)」の形式にする */
const formatResult = (result, severity) => {
  const location = result.locations?.[0]?.physicalLocation;
  const file = location?.artifactLocation?.uri ?? "";
  const line = location?.region?.startLine ?? "";
  return `- [${severity}] ${result.ruleId}: ${result.message?.text ?? ""} (${file}:${line})`;
};

const highFindings = sarifFiles.flatMap((name) => {
  const sarif = JSON.parse(readFileSync(path.join(sarifDir, name), "utf8"));
  return sarif.runs.flatMap((run) => {
    const severities = severityByRuleId(run);
    return (run.results ?? [])
      .map((result) => ({ result, severity: severities.get(result.ruleId) ?? 0 }))
      .filter(({ severity }) => severity >= HIGH_SEVERITY_THRESHOLD)
      .map(({ result, severity }) => formatResult(result, severity));
  });
});

console.log(`SARIF ${sarifFiles.length} 件を確認: 深刻度 High 以上の検出 ${highFindings.length} 件`);
if (highFindings.length > 0) {
  console.log(highFindings.join("\n"));
  process.exit(1);
}
