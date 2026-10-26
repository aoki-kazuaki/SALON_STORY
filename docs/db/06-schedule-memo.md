# スケジュールメモ テーブル設計書

[← テーブル一覧](README.md) ・ [型早見表](README.md#型早見表-postgresql--prisma--typescript)

| 項目 | 内容 |
| --- | --- |
| テーブルID | ScheduleMemo |
| テーブル名(論理名) | スケジュールメモ |
| テーブル名(物理名) | `schedule_memo` |
| 備考・説明 | 日付ごとの空き枠メモ。1ユーザー × 1日 = 1件。クリアはレコードを削除せず本文を空文字にする (空文字の行は「未入力」として扱う) |

| カラム名(論理名) | カラム名(物理名) | データ型 | PK | FK | NotNull | UNIQUE | コード値定義 | デフォルト値 | 備考 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| メモID | id | TEXT | 〇 | | 〇 | 〇 | - | cuid (自動採番) | |
| ユーザーID | userId | TEXT | | 〇 | 〇 | 〇 (※) | - | - | `user.id` (削除時連動) |
| 対象日 | date | DATE | | | 〇 | 〇 (※) | - | - | 時刻を持たない日付 (UTC 0時として扱う) |
| メモ本文 | content | TEXT | | | 〇 | | - | `''` (空文字) | 最大3行・1行15文字・全体60文字 (入力チェックで制限)。空行・前後の空白は除去して保存 |
| 作成日時 | createdAt | TIMESTAMP(3) | | | 〇 | | - | `CURRENT_TIMESTAMP` | |
| 更新日時 | updatedAt | TIMESTAMP(3) | | | 〇 | | - | - | 更新時に自動更新。月別一覧の「最終更新」に表示 |

※ `userId` と `date` の組み合わせで一意

## インデックス・制約

| 名前 | 種類 | 対象カラム |
| --- | --- | --- |
| `schedule_memo_pkey` | 主キー | `id` |
| `schedule_memo_userId_date_key` | 一意 | `userId`, `date` |
| `schedule_memo_userId_fkey` | 外部キー | `userId` → `user.id` (ON DELETE CASCADE) |

## 登録・更新・参照するAPI

- 登録・更新: [スケジュールメモ保存](../api/16-schedule-save.md)
- 更新 (本文を空文字に): [スケジュールメモクリア](../api/17-schedule-clear.md)
- 参照: [スケジュールメモ一覧取得](../api/14-schedule-list.md)、[スケジュールメモ年月一覧取得](../api/15-schedule-summary.md)
