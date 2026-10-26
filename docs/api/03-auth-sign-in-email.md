# ログイン (メールアドレス) API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | ログイン (メールアドレス) |
| API名称(物理名) | AuthSignInEmail |
| API名称(リクエストパス) | `/api/auth/sign-in/email` |
| HTTPメソッド | POST |
| リクエスト形式 | `application/json` |
| レスポンス形式 | `application/json` |
| 認証可否 | 不要 |
| ステータスコード | 200: ログインに成功した場合 (Cookie にセッショントークンをセット)<br>400: メールアドレスの形式が不正な場合<br>401: メールアドレスが存在しない、またはパスワードが誤っている場合<br>403: 管理者の承認待ちの場合<br>429: 短時間にログインを繰り返した場合 |
| 備考, 概要 | BetterAuth が提供する API。画面 (`LoginForm`) は、入力値に `@` を含む場合にこの API を呼ぶ |

## 入力値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| メールアドレス | email | string | 必須 | 大文字・小文字は区別しない |
| パスワード | password | string | 必須 | |

## 戻り値

[ログイン (ログインID)](02-auth-sign-in-username.md) と同じ (`token` / `user` / `redirect`)。

## 内部ロジック

### 処理フロー

1. メールアドレスを小文字に変換し、`user.email` が一致するユーザーを取得する
2. 以降は [ログイン (ログインID)](02-auth-sign-in-username.md) の処理フロー 2〜4 と同じ (承認待ちチェックを含む)

### 例外処理

| ステータス | code | 条件 |
| --- | --- | --- |
| 400 | `INVALID_EMAIL` | メールアドレスの形式が不正 |
| 401 | `INVALID_EMAIL_OR_PASSWORD` | メールアドレスが存在しない、またはパスワードが誤り (どちらかは区別しない) |
| 403 | `APPROVAL_PENDING` | 承認待ち・却下のユーザー (アプリ独自) |
| 429 | - | 回数制限 (10秒間に3回) を超えた |

### 参照先DB一覧

- [ユーザー (user)](../db/01-user.md)
- [認証アカウント (account)](../db/03-account.md)
- [セッション (session)](../db/02-session.md)

### 対象レコード取得条件

- `user.email` = 入力項目.メールアドレス (小文字化)

### 実装ファイル

- `src/lib/auth.ts`
- `src/components/organisms/Login/LoginForm/index.tsx` (画面)
