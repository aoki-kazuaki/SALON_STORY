# 承認待ち一覧取得 API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | 承認待ち一覧取得 |
| API名称(物理名) | AdminPending |
| API名称(リクエストパス) | `/api/admin/pending` |
| HTTPメソッド | GET |
| リクエスト形式 | - |
| レスポンス形式 | `application/json` |
| 認証可否 | 必要 (管理者のみ) |
| ステータスコード | 200: 取得に成功した場合 (該当0件でも 200)<br>401: 未ログインの場合<br>403: 管理者以外の場合 |
| 備考, 概要 | 管理者メニュー (`/dashboard/admin`) の表示用。承認待ちの新規登録・PWリセット申請と、SMTP 未設定時に送信されたメール (ローカル送信箱) を返す |

## 入力値

なし

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 承認待ちユーザー | users: [ | 配列 (始) | 省略不可 | 登録日時の昇順。該当なしは `[]` |
| 　ユーザーID | id | string | 省略不可 | 承認 API の `userId` に指定する値 |
| 　ログインID | username | string | 省略不可 | |
| 　メールアドレス | email | string | 省略不可 | |
| 　登録日時 | createdAt | string | 省略不可 | ISO 日時 |
| - | ] | 配列 (終) | - | |
| 承認待ちPWリセット申請 | passwordResets: [ | 配列 (始) | 省略不可 | 申請日時の昇順。該当なしは `[]` |
| 　申請ID | id | string | 省略不可 | 承認 API の `requestId` に指定する値 |
| 　申請者のログインID | username | string | 省略不可 | |
| 　申請者のメールアドレス | email | string | 省略不可 | |
| 　申請日時 | createdAt | string | 省略不可 | ISO 日時 |
| - | ] | 配列 (終) | - | |
| ローカル送信箱の有効判定 | isOutboxEnabled | boolean | 省略不可 | true: SMTP 未設定 (ローカル開発) |
| ローカル送信メール | outbox: [ | 配列 (始) | 省略不可 | 新しい順・最大30件。SMTP 設定済みの環境では `[]` |
| 　宛先 | to | string | 省略不可 | |
| 　件名 | subject | string | 省略不可 | |
| 　本文 | text | string | 省略不可 | PWリセットの再設定URLなどを含む |
| 　送信日時 | sentAt | string | 省略不可 | ISO 日時 |
| - | ] | 配列 (終) | - | |

## 内部ロジック

### 処理フロー

1. ログインユーザーを取得し、管理者 (`role` = `ADMIN`) であることを確認する
2. 承認待ちのユーザーと、承認待ちのPWリセット申請を並列で取得する
3. ローカル送信箱 (サーバーのメモリ上に保持。サーバー再起動で消去) の内容を付けて返す

### 例外処理

| ステータス | code | 条件 |
| --- | --- | --- |
| 401 | `UNAUTHORIZED` | 未ログイン |
| 403 | `FORBIDDEN` | 管理者以外 |

### 参照先DB一覧

- [ユーザー (user)](../db/01-user.md)
- [パスワードリセット申請 (password_reset_request)](../db/05-password-reset-request.md)

### 対象レコード取得条件

- 承認待ちユーザー: `user.approvalStatus` = `PENDING` (並び順: `createdAt` 昇順)
- 承認待ち申請: `password_reset_request.status` = `PENDING` (並び順: `createdAt` 昇順)、申請者の `user` を結合

### 実装ファイル

- `src/app/api/admin/pending/route.ts`
- `src/types/api/admin/pending/index.d.ts`
- `src/lib/mail.ts` (ローカル送信箱)
