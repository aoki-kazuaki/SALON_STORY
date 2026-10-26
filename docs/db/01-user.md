# ユーザー テーブル設計書

[← テーブル一覧](README.md) ・ [型早見表](README.md#型早見表-postgresql--prisma--typescript)

| 項目 | 内容 |
| --- | --- |
| テーブルID | User |
| テーブル名(論理名) | ユーザー |
| テーブル名(物理名) | `user` |
| 備考・説明 | BetterAuth 標準のユーザーテーブルに、username プラグインの項目と承認制のための独自項目 (`role` / `approvalStatus`) を追加したもの |

| カラム名(論理名) | カラム名(物理名) | データ型 | PK | FK | NotNull | UNIQUE | コード値定義 | デフォルト値 | 備考 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ユーザーID | id | TEXT | 〇 | | 〇 | 〇 | - | - | 登録時に BetterAuth が生成する内部ID。画面には表示しない |
| 表示名 | name | TEXT | | | 〇 | | - | - | 登録時はログインIDと同じ値。ダッシュボードの挨拶文に表示 |
| メールアドレス | email | TEXT | | | 〇 | 〇 | - | - | 小文字で保存。承認通知・PW再設定URLの送付先、ログインにも使用 |
| メール検証済みフラグ | emailVerified | BOOLEAN | | | 〇 | | true: 検証済み / false: 未検証 | `false` | BetterAuth 標準項目。本アプリはメール検証を行わないため常に `false` |
| アイコン画像URL | image | TEXT | | | | | - | NULL | BetterAuth 標準項目。本アプリでは未使用 |
| ログインID | username | TEXT | | | | 〇 | - | NULL | 小文字で保存 (3〜30文字、半角英数字・`_`・`.`)。新規登録時に必ず設定される |
| 表示用ログインID | displayUsername | TEXT | | | | | - | NULL | 入力された大文字・小文字のままのログインID |
| ユーザー権限 | role | UserRole (ENUM) | | | 〇 | | `USER`: 一般ユーザー<br>`ADMIN`: 管理者 | `USER` | 最初に登録したユーザーのみ `ADMIN` |
| 承認ステータス | approvalStatus | ApprovalStatus (ENUM) | | | 〇 | | `PENDING`: 承認待ち<br>`APPROVED`: 承認済み<br>`REJECTED`: 却下 | `PENDING` | `APPROVED` のユーザーのみログイン可能 |
| 作成日時 | createdAt | TIMESTAMP(3) | | | 〇 | | - | `CURRENT_TIMESTAMP` | 登録日時 |
| 更新日時 | updatedAt | TIMESTAMP(3) | | | 〇 | | - | - | 更新時に自動更新 |

## インデックス・制約

| 名前 | 種類 | 対象カラム |
| --- | --- | --- |
| `user_pkey` | 主キー | `id` |
| `user_email_key` | 一意 | `email` |
| `user_username_key` | 一意 | `username` |

## 関連

`session` / `account` / `password_reset_request` / `schedule_memo` / `background_slot` / `legend_text` / `editor_setting` の `userId` から参照される (ユーザー削除時はすべて連動して削除)。

## 登録・更新するAPI

- 登録: [新規登録](../api/01-auth-sign-up-email.md)
- 更新: [メールアドレス変更](../api/10-user-email.md)、[新規登録承認](../api/12-admin-approve-user.md)
