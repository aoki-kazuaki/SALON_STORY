# パスワードリセット承認 API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | パスワードリセット承認 |
| API名称(物理名) | AdminApproveReset |
| API名称(リクエストパス) | `/api/admin/approve-reset` |
| HTTPメソッド | POST |
| リクエスト形式 | `application/json` |
| レスポンス形式 | `application/json` |
| 認証可否 | 必要 (管理者のみ) |
| ステータスコード | 200: 承認・却下に成功した場合<br>400: 入力値が不正な場合<br>401: 未ログインの場合<br>403: 管理者以外の場合 |
| 備考, 概要 | 管理者メニューで「承認」「却下」→ 確認ダイアログを経て呼ばれる。承認すると BetterAuth が再設定トークン (有効期限 1時間) を発行し、本人へ再設定URLをメールで送る |

## 入力値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 対象申請ID | requestId | string | 必須 | 空文字不可。[承認待ち一覧取得](11-admin-pending.md) の `passwordResets[].id` |
| 承認判定 | approve | boolean | 必須 | true: 承認 / false: 却下 |

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 対象申請ID | requestId | string | 省略不可 | 入力値と同じ |

## 内部ロジック

### 処理フロー

1. ログインユーザーを取得し、管理者であることを確認する
2. 入力値を検証する
3. 却下の場合: `password_reset_request.status` を `REJECTED` に更新して終了
4. 承認の場合:
   1. `password_reset_request.status` を `APPROVED`、`approvedAt` を現在日時に更新する
   2. BetterAuth の `requestPasswordReset` を呼び、`verification` に再設定トークンを INSERT する (有効期限 1時間)
   3. 本人へ「パスワード再設定のご案内」メール (`<BETTER_AUTH_URL>/reset-password?token=<トークン>`) を送信する

### 例外処理

| ステータス | code | 条件 |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | 入力値が不正 |
| 401 | `UNAUTHORIZED` | 未ログイン |
| 403 | `FORBIDDEN` | 管理者以外 |

- 補足 (既知の課題): 存在しない申請IDを指定した場合は、更新時に例外となり 500 が返る (通常の画面操作では発生しない)。

### 参照先DB一覧

- [パスワードリセット申請 (password_reset_request)](../db/05-password-reset-request.md)
- [ユーザー (user)](../db/01-user.md)
- [検証トークン (verification)](../db/04-verification.md)

### サービス内での呼び出し時に新規生成される値

- 再設定トークン (BetterAuth が生成)
- 承認日時 (`approvedAt`)

### UPDATE / INSERT内容

パスワードリセット申請 (password_reset_request)
- 承認: `APPROVED` → `status`、現在日時 → `approvedAt`
- 却下: `REJECTED` → `status`

検証トークン (verification) ※承認時のみ
- `"reset-password:" + 新規生成.再設定トークン` → `identifier`
- 申請者の `user.id` → `value`
- 現在日時 + 1時間 → `expiresAt`

### 実装ファイル

- `src/app/api/admin/approve-reset/route.ts`
- `src/types/api/admin/approve-reset/index.d.ts`
- `src/lib/auth.ts` (`sendResetPassword`)、`src/lib/mail.ts`
