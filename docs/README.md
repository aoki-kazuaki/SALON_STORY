# 設計資料一覧

サロン空き状況ストーリーズジェネレーター (SALON STORY) の設計資料です。
実装 (`src/`・`prisma/`・`.github/`) を正として作成しています。実装を変更した場合は、同じ PR で該当する資料も更新してください。

| No | 資料 | 内容 |
| --- | --- | --- |
| 1 | [API仕様書兼設計書](api/README.md) | API一覧と、API ごとの入力値・戻り値・ステータスコード・内部ロジック (24 API) |
| 2 | [テーブル定義書](db/README.md) | テーブル一覧・ER図・型早見表と、テーブルごとのカラム定義 (9 テーブル) |
| 3 | [コマンド集](development/commands.md) | 開発時に使う npm / Docker / Prisma / Git のコマンド |
| 4 | [CI / 自動化](development/ci.md) | GitHub Actions で実行しているタスク、Dependabot、ブランチ保護ルール |
| 5 | [CI・Dependabot 運用ガイド](development/ci-operations.md) | CI が失敗したときの直し方、Dependabot の PR を取り込むかの判断基準と手順、実例 |
| 6 | [E2E シナリオテスト](../e2e/README.md) | Playwright のシナリオ一覧と実行方法 |

## 用語

| 用語 | 意味 |
| --- | --- |
| 論理名 | 人が読むための日本語の名前 (例: スケジュールメモ) |
| 物理名 | コード・DB 上の実際の名前 (例: `schedule_memo`, `ScheduleMemo`) |
| 日付キー | `"YYYY-MM-DD"` 形式の日付文字列 (例: `"2026-10-27"`) |
| ISO 日時 | ISO 8601 形式の日時文字列 (例: `"2026-10-27T03:15:00.000Z"`、UTC) |
| スロット | 背景画像の登録枠 (1〜4番の固定4枠) |
