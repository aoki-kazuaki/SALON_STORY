# 新規登録 API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | 新規登録 |
| API名称(物理名) | AuthSignUpEmail |
| API名称(リクエストパス) | `/api/auth/sign-up/email` |
| HTTPメソッド | POST |
| リクエスト形式 | `application/json` |
| レスポンス形式 | `application/json` |
| 認証可否 | 不要 |
| ステータスコード | 200: 登録に成功した場合 (※登録済みメールアドレスの場合も 200。下記「例外処理」参照)<br>400: パスワード・ログインIDの入力チェックに該当した場合 / ログインIDが登録済みの場合<br>422: ログインIDの形式・文字数が不正な場合<br>429: 短時間に登録を繰り返した場合 |
| 備考, 概要 | BetterAuth (username プラグイン) が提供する API。登録後に自動ログインはしない (`autoSignIn: false`)。<br>画面 (`RegisterForm`) は登録後に [ログイン (ログインID)](02-auth-sign-in-username.md) を呼び、承認待ちなら承認待ち画面、承認済みならダッシュボードへ遷移する |

## 入力値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 表示名 | name | string | 必須 | 画面からはログインIDと同じ値を送信する |
| ログインID | username | string | 必須 | 3文字以上30文字以下 / 半角英数字・アンダースコア・ドットのみ<br>大文字は小文字に変換して保存する (表示用の元の値は `displayUsername` に保存) |
| メールアドレス | email | string | 必須 | メールアドレス形式。小文字に変換して保存する |
| パスワード | password | string | 必須 | 8文字以上128文字以下 / 英大文字・英小文字・数字をそれぞれ1文字以上含む |

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| セッショントークン | token | null | 省略不可 | 自動ログインしないため常に `null` |
| 登録ユーザー | user: { | object | 省略不可 | - |
| 　ユーザーID | id | string | 省略不可 | 自動採番 (内部ID) |
| 　表示名 | name | string | 省略不可 | |
| 　メールアドレス | email | string | 省略不可 | |
| 　ログインID | username | string | 省略不可 | 小文字に変換済み |
| 　ユーザー権限 | role | string | 省略不可 | `"ADMIN"` / `"USER"` |
| 　承認ステータス | approvalStatus | string | 省略不可 | `"APPROVED"` / `"PENDING"` |
| 　登録日時 | createdAt | string | 省略不可 | ISO 日時 |
| - | } | - | - | ほか BetterAuth 標準項目 (emailVerified, image, updatedAt, displayUsername) |

## 内部ロジック

### 処理フロー

1. パスワードの文字種ルールを検証する (`hooks.before` の `validatePasswordRule`)
2. ログインIDの形式・文字数と重複を検証する (username プラグイン)
3. メールアドレスの重複を確認する (登録済みの場合は「例外処理」参照)
4. パスワードをハッシュ化する (scrypt)
5. 初期の権限・承認ステータスを決定する (`databaseHooks.user.create.before`)
   - ユーザーが0人 (最初の1人目) → `ADMIN` / `APPROVED`
   - 環境変数 `AUTH_SKIP_APPROVAL="true"` (ローカル開発用) → `USER` / `APPROVED`
   - 上記以外 → `USER` / `PENDING`
6. `user` と `account` に INSERT する
7. 承認待ち (`PENDING`) の場合は、管理者全員へ承認依頼メールを送信する (`databaseHooks.user.create.after`)

### 例外処理

| ステータス | code | 条件 |
| --- | --- | --- |
| 400 | `WEAK_PASSWORD` | パスワードが文字種ルールを満たさない (アプリ独自) |
| 400 | `PASSWORD_TOO_SHORT` / `PASSWORD_TOO_LONG` | パスワードが8文字未満 / 128文字超 |
| 400 | `USERNAME_IS_ALREADY_TAKEN` | ログインIDが登録済み |
| 400 | `INVALID_EMAIL` | メールアドレスの形式が不正 |
| 422 | `INVALID_USERNAME` / `USERNAME_TOO_SHORT` / `USERNAME_TOO_LONG` | ログインIDの形式・文字数が不正 |
| 429 | - | 回数制限 (10秒間に3回) を超えた |

- **登録済みメールアドレスの場合**: アカウントの有無を推測されないよう、BetterAuth は登録せずに成功時と同じ 200 を返す。画面側は、続けて行うログインが `INVALID_USERNAME_OR_PASSWORD` になることで判別し、「登録を完了できませんでした。…ログインするか、パスワードの再設定を申請してください」と案内する (登録済みとは断定しない)。

### 参照先DB一覧

- [ユーザー (user)](../db/01-user.md)
- [認証アカウント (account)](../db/03-account.md)

### サービス内での呼び出し時に新規生成される値

- ユーザーID (`user.id`)、アカウントID (`account.id`)
- パスワードハッシュ (`account.password`)

### INSERT内容

ユーザー (user)
- 新規生成.ユーザーID → `user.id`
- 入力項目.表示名 (name) → `user.name`
- 入力項目.メールアドレス (email、小文字化) → `user.email`
- 入力項目.ログインID (username、小文字化) → `user.username`
- 入力項目.ログインID (username、入力のまま) → `user.displayUsername`
- 決定した権限・承認ステータス → `user.role` / `user.approvalStatus`

認証アカウント (account)
- 新規生成.アカウントID → `account.id`
- 新規生成.ユーザーID → `account.accountId` / `account.userId`
- 固定値 `"credential"` → `account.providerId`
- 新規生成.パスワードハッシュ → `account.password`

### 実装ファイル

- `src/lib/auth.ts` (BetterAuth 設定・フック)
- `src/components/organisms/Register/RegisterForm/index.tsx` (画面)
