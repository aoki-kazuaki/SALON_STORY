# パスワードリセット申請 テーブル設計書

[← テーブル一覧](README.md) ・ [型早見表](README.md#型早見表-postgresql--prisma--typescript)

| 項目 | 内容 |
| --- | --- |
| テーブルID | PasswordResetRequest |
| テーブル名(論理名) | パスワードリセット申請 |
| テーブル名(物理名) | `password_reset_request` |
| 備考・説明 | アプリ独自テーブル。本人がPWリセットを申請し、管理者が承認すると再設定URLが送られる仕組みのための申請履歴 |

| カラム名(論理名) | カラム名(物理名) | データ型 | PK | FK | NotNull | UNIQUE | コード値定義 | デフォルト値 | 備考 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 申請ID | id | TEXT | 〇 | | 〇 | 〇 | - | cuid (自動採番) | |
| ユーザーID | userId | TEXT | | 〇 | 〇 | | - | - | 申請者の `user.id` (削除時連動) |
| 承認ステータス | status | ApprovalStatus (ENUM) | | | 〇 | | `PENDING`: 承認待ち<br>`APPROVED`: 承認済み<br>`REJECTED`: 却下 | `PENDING` | 同じユーザーの `PENDING` は1件まで (アプリ側で制御) |
| 承認日時 | approvedAt | TIMESTAMP(3) | | | | | - | NULL | 承認した場合のみ値を持つ |
| 作成日時 | createdAt | TIMESTAMP(3) | | | 〇 | | - | `CURRENT_TIMESTAMP` | 申請日時 |
| 更新日時 | updatedAt | TIMESTAMP(3) | | | 〇 | | - | - | 更新時に自動更新 |

## インデックス・制約

| 名前 | 種類 | 対象カラム |
| --- | --- | --- |
| `password_reset_request_pkey` | 主キー | `id` |
| `password_reset_request_userId_status_idx` | インデックス | `userId`, `status` |
| `password_reset_request_userId_fkey` | 外部キー | `userId` → `user.id` (ON DELETE CASCADE) |

## 登録・更新するAPI

- 登録: [パスワードリセット申請](../api/08-password-reset-request.md)
- 参照: [承認待ち一覧取得](../api/11-admin-pending.md)
- 更新: [パスワードリセット承認](../api/13-admin-approve-reset.md)
