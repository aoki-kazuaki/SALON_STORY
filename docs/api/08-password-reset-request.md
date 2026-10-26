# パスワードリセット申請 API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | パスワードリセット申請 |
| API名称(物理名) | PasswordResetRequest |
| API名称(リクエストパス) | `/api/password-reset/request` |
| HTTPメソッド | POST |
| リクエスト形式 | `application/json` |
| レスポンス形式 | `application/json` |
| 認証可否 | 不要 |
| ステータスコード | 200: 申請を受け付けた場合 (※アカウントが存在しない場合も 200)<br>400: メールアドレスの形式が不正な場合 |
| 備考, 概要 | パスワードを忘れた本人が申請し、管理者へ承認依頼メールを送る。承認されると本人に再設定URLが届く ([パスワードリセット承認](13-admin-approve-reset.md))。<br>アカウントの有無を推測されないよう、結果に関わらず同じメッセージを返す |

## 入力値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| メールアドレス | email | string | 必須 | メールアドレス形式。小文字に変換して照合する |

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 受付メッセージ | message | string | 省略不可 | 固定文言「申請を受け付けました。管理者の承認後、登録メールアドレスに再設定URLをお送りします。」 |

## 内部ロジック

### 処理フロー

1. 入力値を検証する (メールアドレス形式)
2. メールアドレスが一致するユーザーを取得する → 存在しない場合は受付メッセージを返して終了
3. 同じユーザーの承認待ち (`PENDING`) の申請が既にある場合は、受付メッセージを返して終了 (二重申請を防ぐ)
4. `password_reset_request` に INSERT する
5. 管理者全員へ承認依頼メールを送信する
6. 受付メッセージを返す

### 例外処理

| ステータス | code | 条件 |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | メールアドレスの形式が不正 |

### 参照先DB一覧

- [ユーザー (user)](../db/01-user.md)
- [パスワードリセット申請 (password_reset_request)](../db/05-password-reset-request.md)

### 対象レコード取得条件

- ユーザー: `user.email` = 入力項目.メールアドレス (小文字化)
- 二重申請の確認: `password_reset_request.userId` = 取得した `user.id` かつ `status` = `PENDING`

### INSERT内容

パスワードリセット申請 (password_reset_request)
- 新規生成.申請ID (cuid) → `id`
- 取得した `user.id` → `userId`
- 既定値 `PENDING` → `status`

### 実装ファイル

- `src/app/api/password-reset/request/route.ts`
- `src/types/api/password-reset/request/index.d.ts`
