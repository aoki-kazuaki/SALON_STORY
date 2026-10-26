# 認証アカウント テーブル設計書

[← テーブル一覧](README.md) ・ [型早見表](README.md#型早見表-postgresql--prisma--typescript)

| 項目 | 内容 |
| --- | --- |
| テーブルID | Account |
| テーブル名(論理名) | 認証アカウント |
| テーブル名(物理名) | `account` |
| 備考・説明 | BetterAuth 標準テーブル。ログイン方法ごとの認証情報を管理する。本アプリは ID/パスワード認証のみのため、1ユーザーにつき `providerId` = `"credential"` の1件のみ |

| カラム名(論理名) | カラム名(物理名) | データ型 | PK | FK | NotNull | UNIQUE | コード値定義 | デフォルト値 | 備考 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| アカウントID | id | TEXT | 〇 | | 〇 | 〇 | - | - | BetterAuth が生成 |
| プロバイダ側アカウントID | accountId | TEXT | | | 〇 | | - | - | ID/パスワード認証では `user.id` と同じ値 |
| プロバイダ識別子 | providerId | TEXT | | | 〇 | | `credential`: ID/パスワード認証 | - | |
| ユーザーID | userId | TEXT | | 〇 | 〇 | | - | - | `user.id` (削除時連動) |
| アクセストークン | accessToken | TEXT | | | | | - | NULL | 外部ログイン (OAuth) 用。本アプリでは未使用 |
| リフレッシュトークン | refreshToken | TEXT | | | | | - | NULL | 同上 (未使用) |
| IDトークン | idToken | TEXT | | | | | - | NULL | 同上 (未使用) |
| アクセストークン有効期限 | accessTokenExpiresAt | TIMESTAMP(3) | | | | | - | NULL | 同上 (未使用) |
| リフレッシュトークン有効期限 | refreshTokenExpiresAt | TIMESTAMP(3) | | | | | - | NULL | 同上 (未使用) |
| 権限スコープ | scope | TEXT | | | | | - | NULL | 同上 (未使用) |
| パスワード | password | TEXT | | | | | - | NULL | ハッシュ化済みパスワード (scrypt)。平文は保存しない |
| 作成日時 | createdAt | TIMESTAMP(3) | | | 〇 | | - | `CURRENT_TIMESTAMP` | |
| 更新日時 | updatedAt | TIMESTAMP(3) | | | 〇 | | - | - | 更新時に自動更新 |

## インデックス・制約

| 名前 | 種類 | 対象カラム |
| --- | --- | --- |
| `account_pkey` | 主キー | `id` |
| `account_userId_idx` | インデックス | `userId` |
| `account_userId_fkey` | 外部キー | `userId` → `user.id` (ON DELETE CASCADE) |

## 登録・更新するAPI

- 登録: [新規登録](../api/01-auth-sign-up-email.md)
- 更新 (`password`): [パスワード変更](../api/06-auth-change-password.md)、[パスワード再設定](../api/07-auth-reset-password.md)
- ローカル開発用: `npm run user:reset-password` (`scripts/reset-password.ts`) が直接更新する
