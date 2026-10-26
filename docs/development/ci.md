# CI / 自動化

[← 設計資料一覧](../README.md)

GitHub Actions・Dependabot・ブランチ保護ルールで行っている自動チェックの一覧です。設定ファイルはすべて `.github/` にあります。

## 全体像

| 仕組み | 設定ファイル | 実行タイミング | 目的 |
| --- | --- | --- | --- |
| CI (品質チェック) | `.github/workflows/ci.yml` | main / develop への PR、main / develop への push | Lint・整形・型・単体テスト (カバレッジ90%)・ビルド・ライセンス |
| Security (脆弱性チェック) | `.github/workflows/security.yml` | main / develop への PR・push、毎週月曜 9:00、手動 | 依存ライブラリとコードの脆弱性 |
| Dependabot | `.github/dependabot.yml` | 毎週月曜 9:00 | 依存ライブラリ・GitHub Actions の更新 PR を develop 宛てに作成 |
| ブランチ保護ルール | `.github/rulesets/protect-main.json` | 常時 | main / develop への直接 push 禁止、チェック成功までマージ不可 |
| Git フック | `.husky/pre-commit` | ローカルのコミット時 | ステージしたファイルの自動整形・Lint |

## CI (`ci.yml`)

ジョブ: `quality` (ubuntu-latest / Node.js 24)

| No | ステップ | コマンド | 失敗する条件 |
| --- | --- | --- | --- |
| 1 | Install | `npm ci` | `package-lock.json` と `package.json` が不一致 |
| 2 | ESLint | `npm run lint` | ESLint のエラー |
| 3 | Prettier | `npm run format:check` | 整形されていないファイルがある |
| 4 | TypeScript | `npm run typecheck` | 型エラー |
| 5 | Vitest (カバレッジ 90% 以上) | `npm run test:coverage` | テストの失敗、または命令・分岐・関数・行のいずれかのカバレッジが 90% 未満 |
| 6 | Upload coverage report | `actions/upload-artifact` | (失敗しない) カバレッジの HTML レポートを成果物 `coverage-report` として14日間保存 |
| 7 | Build | `npm run build` | 本番ビルドの失敗 (DB・S3 には接続しないダミーの環境変数で実行) |
| 8 | License check | `npm run license:check` | 許可リスト外のライセンスの本番依存がある |

- カバレッジの計測対象は単体テストの対象 (atoms / molecules / utils / `lib/schemas.ts` / `lib/authError.ts`) のみ。基準値は `vitest.config.mts` の `coverage.thresholds`。
- 失敗したときは、Actions の実行ページで該当ステップのログを確認し、同じコマンドをローカルで実行して直す ([コマンド集](commands.md#3-品質チェック-ci-と同じ内容をローカルで))。

## Security (`security.yml`)

| ジョブ | 内容 | 失敗する条件 | 実行タイミング |
| --- | --- | --- | --- |
| `npm-audit` | `npm audit --audit-level=high` で、使用中の依存ライブラリ全体の既知の脆弱性を確認 | 深刻度 High 以上がある | PR・push・定期 |
| `dependency-review` | PR で追加・更新された依存ライブラリの脆弱性を確認し、問題があれば PR にコメント | 深刻度 High 以上がある | PR のみ |
| `codeql` | CodeQL (security-extended) でアプリのコードを静的解析 (XSS・インジェクション等)。結果は Security タブにも登録 | 深刻度 High 以上 (security-severity 7.0 以上) の検出がある (`.github/scripts/codeql-gate.mjs` で判定) | PR・push・定期 |

- 毎週月曜の定期実行は、コードを変えていなくても新しく公表された脆弱性に気付くためのもの。定期実行はデフォルトブランチ (develop) のワークフローで動く。
- `dependency-review` を使うには、リポジトリ設定で「Dependency graph」を有効にしておく必要がある。
- CodeQL はリポジトリ設定の「Default setup」を有効にしない (このワークフローと二重に動いて衝突する)。

## 実行の重複キャンセル

CI・Security ともに、同じ PR に新しいコミットが push されると、古いコミット向けの実行を自動でキャンセルします (`concurrency`)。main / develop への push と定期実行はキャンセルしません。

## ライセンスチェック

`scripts/check-licenses.mjs` が本番依存のライセンスを調べ、ソースコード公開などの義務を伴わない「許容ライセンス」のみを許可します (許可リスト方式)。

| 区分 | ライセンス |
| --- | --- |
| 許可 | MIT, MIT-0, ISC, 0BSD, BSD-2-Clause, BSD-3-Clause, Apache-2.0, Unlicense, CC0-1.0, BlueOak-1.0.0, Python-2.0 |
| 例外 (理由を明記して許可) | sharp (LGPL-3.0、Next.js の画像最適化用・本アプリでは未使用)<br>lightningcss (MPL-2.0、ビルド時の CSS 処理のみ)<br>elkjs (EPL-2.0、Prisma Studio 用)<br>caniuse-lite (CC-BY-4.0、ビルド時のデータ・義務は出典表示のみ) |
| 上記以外 | CI が失敗する。別のライブラリへの置き換えを検討する |

例外はいずれもフレームワークの間接依存で、アプリ本体には組み込まれず、Web サービスとして提供するだけ (配布しない) のため義務は発生しません。例外を追加する場合は、`scripts/check-licenses.mjs` の `EXCEPTIONS` に理由とともに追記してください。

## Dependabot (`dependabot.yml`)

| 対象 | 頻度 | 宛先 | まとめ方 |
| --- | --- | --- | --- |
| npm (依存ライブラリ) | 毎週月曜 9:00 (JST) | develop | Next.js 関連 / Prisma 関連 / Storybook 関連 / テスト関連はそれぞれ1つの PR。それ以外のマイナー・パッチ更新は1つの PR。メジャー更新は個別の PR |
| GitHub Actions | 毎週月曜 9:00 (JST) | develop | すべて1つの PR |

- 公開から3日経ったバージョンだけを対象にする (`cooldown`)。乗っ取られたパッケージの悪意ある版を取り込むリスクを下げるため。
- 更新 PR にも CI・Security が走るので、すべて成功したものだけをマージする。
- 脆弱性が見つかったときの緊急の更新 PR は、リポジトリ設定の「Dependabot security updates」を有効にすると随時作成される。

## ブランチ保護ルール

GitHub の Settings → Rules → Rulesets に、`.github/rulesets/protect-main.json` を取り込んで設定しています (ルール名 `protect-main`)。

| ルール | 対象 | 内容 |
| --- | --- | --- |
| 直接 push 禁止 | main, develop | 変更は PR 経由のみ (承認者数は0人。1人開発のため) |
| 必須ステータスチェック | main, develop | `quality`・`npm-audit`・`dependency-review`・`codeql` がすべて成功するまでマージ不可 (実行中・失敗・未実行はマージ不可) |
| 強制 push 禁止 | main, develop | `git push --force` で履歴を書き換えられない |
| 削除禁止 | main, develop | ブランチを削除できない |

- 管理者も例外ではない。緊急時は Rulesets 画面でルールを一時的に「Disabled」にできる。
- ルールを変更した場合は、`protect-main.json` も同じ内容に更新しておく。

## Git フック (Husky + lint-staged)

コミット時に `.husky/pre-commit` が `npx lint-staged` を実行し、ステージしたファイルだけを処理します。

| 対象 | 実行内容 |
| --- | --- |
| `*.ts`, `*.tsx` | `prettier --write` (import の並べ替え・未使用 import の削除を含む) → `eslint --fix` |
| `*.css` | `prettier --write` |

ESLint のエラーが自動修正できない場合はコミットが中断されます。
