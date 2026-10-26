# パスワード変更 API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | パスワード変更 |
| API名称(物理名) | AuthChangePassword |
| API名称(リクエストパス) | `/api/auth/change-password` |
| HTTPメソッド | POST |
| リクエスト形式 | `application/json` |
| レスポンス形式 | `application/json` |
| 認証可否 | 必要 |
| ステータスコード | 200: 変更に成功した場合<br>400: 現在のパスワードが誤っている場合 / 新しいパスワードが入力チェックに該当した場合<br>401: 未ログインの場合<br>429: 短時間に変更を繰り返した場合 |
| 備考, 概要 | BetterAuth が提供する API。ユーザー設定画面で確認ダイアログを経て呼ばれる。変更後は他の端末のセッションを無効化する |

## 入力値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 現在のパスワード | currentPassword | string | 必須 | |
| 新しいパスワード | newPassword | string | 必須 | 8文字以上128文字以下 / 英大文字・英小文字・数字をそれぞれ含む<br>(画面側で「現在のパスワードと異なること」も検証する) |
| 他セッション無効化 | revokeOtherSessions | boolean | 必須 | 画面からは常に `true` |

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 新しいセッショントークン | token | string | 省略不可 | 他セッション無効化時に再発行される |
| ログインユーザー | user | object | 省略不可 | 項目は [新規登録](01-auth-sign-up-email.md) の戻り値と同じ |

## 内部ロジック

### 処理フロー

1. 新しいパスワードの文字種ルールを検証する (`hooks.before` の `validatePasswordRule`)
2. ログインユーザーの `account.password` と現在のパスワードを照合する
3. 新しいパスワードをハッシュ化して `account.password` を更新する
4. `revokeOtherSessions` が `true` の場合、ログインユーザーの全セッションを削除し、新しいセッションを発行する

### 例外処理

| ステータス | code | 条件 | 画面の表示先 |
| --- | --- | --- | --- |
| 400 | `INVALID_PASSWORD` | 現在のパスワードが誤り | 現在のパスワード欄 |
| 400 | `WEAK_PASSWORD` / `PASSWORD_TOO_SHORT` / `PASSWORD_TOO_LONG` | 新しいパスワードがルール外 | 新しいパスワード欄 |
| 401 | - | 未ログイン | トースト |
| 429 | - | 回数制限 | トースト |

### 参照先DB一覧

- [認証アカウント (account)](../db/03-account.md)
- [セッション (session)](../db/02-session.md)

### UPDATE内容

- 新規生成.パスワードハッシュ → `account.password`

### 実装ファイル

- `src/lib/auth.ts`
- `src/components/organisms/Settings/SettingsPasswordForm/index.tsx` (画面)
