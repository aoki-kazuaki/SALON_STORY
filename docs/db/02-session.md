# ログインセッション テーブル設計書

[← テーブル一覧](README.md) ・ [型早見表](README.md#型早見表-postgresql--prisma--typescript)

| 項目 | 内容 |
| --- | --- |
| テーブルID | Session |
| テーブル名(論理名) | ログインセッション |
| テーブル名(物理名) | `session` |
| 備考・説明 | BetterAuth 標準テーブル。ログイン中のセッションを管理する。有効期限は30日 (1日ごとにアクセスがあれば延長) |

| カラム名(論理名) | カラム名(物理名) | データ型 | PK | FK | NotNull | UNIQUE | コード値定義 | デフォルト値 | 備考 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| セッションID | id | TEXT | 〇 | | 〇 | 〇 | - | - | BetterAuth が生成 |
| 有効期限 | expiresAt | TIMESTAMP(3) | | | 〇 | | - | - | ログイン時点 + 30日 |
| セッショントークン | token | TEXT | | | 〇 | 〇 | - | - | Cookie (`better-auth.session_token`) に格納する値 |
| 接続元IPアドレス | ipAddress | TEXT | | | | | - | NULL | ログイン時のリクエストから取得 |
| 接続元ユーザーエージェント | userAgent | TEXT | | | | | - | NULL | ログイン時のリクエストから取得 |
| ユーザーID | userId | TEXT | | 〇 | 〇 | | - | - | `user.id` (削除時連動) |
| 作成日時 | createdAt | TIMESTAMP(3) | | | 〇 | | - | `CURRENT_TIMESTAMP` | ログイン日時 |
| 更新日時 | updatedAt | TIMESTAMP(3) | | | 〇 | | - | - | 更新時に自動更新 |

## インデックス・制約

| 名前 | 種類 | 対象カラム |
| --- | --- | --- |
| `session_pkey` | 主キー | `id` |
| `session_token_key` | 一意 | `token` |
| `session_userId_idx` | インデックス | `userId` |
| `session_userId_fkey` | 外部キー | `userId` → `user.id` (ON DELETE CASCADE) |

## 登録・更新・削除するAPI

- 登録: [ログイン (ログインID)](../api/02-auth-sign-in-username.md)、[ログイン (メールアドレス)](../api/03-auth-sign-in-email.md)
- 更新 (有効期限の延長): [セッション取得](../api/05-auth-get-session.md)
- 削除: [ログアウト](../api/04-auth-sign-out.md)、[パスワード変更](../api/06-auth-change-password.md) (他端末)、[パスワード再設定](../api/07-auth-reset-password.md) (全端末)
