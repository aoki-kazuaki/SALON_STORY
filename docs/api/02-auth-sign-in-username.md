# ログイン (ログインID) API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | ログイン (ログインID) |
| API名称(物理名) | AuthSignInUsername |
| API名称(リクエストパス) | `/api/auth/sign-in/username` |
| HTTPメソッド | POST |
| リクエスト形式 | `application/json` |
| レスポンス形式 | `application/json` |
| 認証可否 | 不要 |
| ステータスコード | 200: ログインに成功した場合 (Cookie にセッショントークンをセット)<br>401: ログインIDが存在しない、またはパスワードが誤っている場合<br>403: 管理者の承認待ちの場合<br>422: ログインIDの形式が不正な場合<br>429: 短時間にログインを繰り返した場合 |
| 備考, 概要 | BetterAuth (username プラグイン) が提供する API。<br>画面 (`LoginForm`) は、入力値に `@` を含まない場合にこの API を、含む場合は [ログイン (メールアドレス)](03-auth-sign-in-email.md) を呼ぶ |

## 入力値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| ログインID | username | string | 必須 | 大文字・小文字は区別しない (小文字に変換して照合) |
| パスワード | password | string | 必須 | |

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| セッショントークン | token | string | 省略不可 | 同じ値を Cookie (`better-auth.session_token`) にもセットする |
| ログインユーザー | user | object | 省略不可 | 項目は [新規登録](01-auth-sign-up-email.md) の戻り値と同じ |
| リダイレクト有無 | redirect | boolean | 省略不可 | 常に `false` |

## 内部ロジック

### 処理フロー

1. ログインIDを小文字に変換し、`user.username` が一致するユーザーを取得する
2. `account` (providerId = `"credential"`) のパスワードハッシュと照合する
3. セッション作成前に承認ステータスを確認する (`databaseHooks.session.create.before`)
   - `user.approvalStatus` が `APPROVED` 以外の場合はセッションを発行せず 403 を返す
4. `session` に INSERT し、Cookie をセットする (有効期限 30日)

### 例外処理

| ステータス | code | 条件 |
| --- | --- | --- |
| 401 | `INVALID_USERNAME_OR_PASSWORD` | ログインIDが存在しない、またはパスワードが誤り (どちらかは区別しない) |
| 403 | `APPROVAL_PENDING` | 承認待ち・却下のユーザー (アプリ独自) |
| 422 | `INVALID_USERNAME` / `USERNAME_TOO_SHORT` / `USERNAME_TOO_LONG` | ログインIDの形式が不正 |
| 429 | - | 回数制限 (10秒間に3回) を超えた |

画面では、401・422 はいずれも「ログインID (メールアドレス) またはパスワードが正しくありません」と表示し、アカウントの有無の手がかりを与えない。403 の場合は承認待ち画面 (`/register/pending`) へ遷移する。

### 参照先DB一覧

- [ユーザー (user)](../db/01-user.md)
- [認証アカウント (account)](../db/03-account.md)
- [セッション (session)](../db/02-session.md)

### 対象レコード取得条件

- `user.username` = 入力項目.ログインID (小文字化)
- `account.userId` = 取得した `user.id` かつ `account.providerId` = `"credential"`

### INSERT内容

セッション (session)
- 新規生成.セッションID → `session.id`
- 新規生成.セッショントークン → `session.token`
- 現在日時 + 30日 → `session.expiresAt`
- リクエストの送信元IP・User-Agent → `session.ipAddress` / `session.userAgent`
- 取得した `user.id` → `session.userId`

### 実装ファイル

- `src/lib/auth.ts`
- `src/components/organisms/Login/LoginForm/index.tsx` (画面)
