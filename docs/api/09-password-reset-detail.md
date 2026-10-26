# パスワードリセットトークン確認 API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | パスワードリセットトークン確認 |
| API名称(物理名) | PasswordResetDetail |
| API名称(リクエストパス) | `/api/password-reset/detail` |
| HTTPメソッド | GET |
| リクエスト形式 | クエリパラメータ |
| レスポンス形式 | `application/json` |
| 認証可否 | 不要 |
| ステータスコード | 200: 確認が完了した場合 (トークンが無効でも 200。`isValid` で判定する) |
| 備考, 概要 | 再設定画面を開いたときに呼ばれ、トークンが有効ならメールアドレスを非活性の入力欄に表示する。無効なら「URLが無効、または有効期限が切れています」と表示する |

## 入力値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| リセットトークン | token | string | 必須 | 再設定URLのクエリ `token` の値 |

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| メールアドレス | email | string | 省略不可 | トークンに紐づくユーザーのメールアドレス (無効時は `""`) |
| 有効判定 | isValid | boolean | 省略不可 | true: 有効 / false: 無効・期限切れ |

## 内部ロジック

### 処理フロー

1. トークンが空の場合は無効として返す
2. `verification` から `identifier` = `"reset-password:<トークン>"` のレコードを取得する → 無い、または期限切れの場合は無効として返す
3. `verification.value` (ユーザーID) のユーザーを取得し、メールアドレスを返す

### 参照先DB一覧

- [検証トークン (verification)](../db/04-verification.md)
- [ユーザー (user)](../db/01-user.md)

### 対象レコード取得条件

- `verification.identifier` = `"reset-password:"` + 入力項目.リセットトークン
- `verification.expiresAt` ≧ 現在日時
- `user.id` = `verification.value`

### 実装ファイル

- `src/app/api/password-reset/detail/route.ts`
- `src/types/api/password-reset/detail/index.d.ts`
