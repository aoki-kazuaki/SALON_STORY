# パスワード再設定 API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | パスワード再設定 |
| API名称(物理名) | AuthResetPassword |
| API名称(リクエストパス) | `/api/auth/reset-password` |
| HTTPメソッド | POST |
| リクエスト形式 | `application/json` |
| レスポンス形式 | `application/json` |
| 認証可否 | 不要 (再設定URLのトークンで本人確認) |
| ステータスコード | 200: 再設定に成功した場合<br>400: トークンが無効・期限切れの場合 / 新しいパスワードが入力チェックに該当した場合 |
| 備考, 概要 | BetterAuth が提供する API。管理者が [パスワードリセット承認](13-admin-approve-reset.md) を行うと本人に再設定URL (`/reset-password?token=...`) が届き、その画面から呼ばれる。<br>再設定後は全端末のセッションを無効化する |

## 入力値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 新しいパスワード | newPassword | string | 必須 | 8文字以上128文字以下 / 英大文字・英小文字・数字をそれぞれ含む |
| リセットトークン | token | string | 必須 | 再設定URLのクエリ `token` の値 (有効期限 1時間) |

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 成功判定 | status | boolean | 省略不可 | `true` |

## 内部ロジック

### 処理フロー

1. 新しいパスワードの文字種ルールを検証する (`hooks.before` の `validatePasswordRule`)
2. `verification` から `identifier` = `"reset-password:<トークン>"` かつ有効期限内のレコードを取得する
3. 取得したレコードの `value` (ユーザーID) の `account.password` を、新しいパスワードのハッシュで更新する
4. 使用したトークン (`verification`) を削除する
5. 対象ユーザーの全セッションを削除する (`revokeSessionsOnPasswordReset: true`)

### 例外処理

| ステータス | code | 条件 |
| --- | --- | --- |
| 400 | `INVALID_TOKEN` | トークンが存在しない・期限切れ・使用済み |
| 400 | `WEAK_PASSWORD` / `PASSWORD_TOO_SHORT` / `PASSWORD_TOO_LONG` | 新しいパスワードがルール外 |

### 参照先DB一覧

- [検証トークン (verification)](../db/04-verification.md)
- [認証アカウント (account)](../db/03-account.md)
- [セッション (session)](../db/02-session.md)

### 対象レコード取得条件

- `verification.identifier` = `"reset-password:"` + 入力項目.リセットトークン
- `verification.expiresAt` > 現在日時

### 実装ファイル

- `src/lib/auth.ts`
- `src/components/organisms/ResetPassword/ResetPasswordForm/index.tsx` (画面)
