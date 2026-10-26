# 新規登録承認 API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | 新規登録承認 |
| API名称(物理名) | AdminApproveUser |
| API名称(リクエストパス) | `/api/admin/approve-user` |
| HTTPメソッド | POST |
| リクエスト形式 | `application/json` |
| レスポンス形式 | `application/json` |
| 認証可否 | 必要 (管理者のみ) |
| ステータスコード | 200: 承認・却下に成功した場合<br>400: 入力値が不正な場合<br>401: 未ログインの場合<br>403: 管理者以外の場合 |
| 備考, 概要 | 管理者メニューで「承認」「却下」→ 確認ダイアログを経て呼ばれる。承認すると本人へ承認通知メールを送り、ログインできるようになる |

## 入力値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 対象ユーザーID | userId | string | 必須 | 空文字不可。[承認待ち一覧取得](11-admin-pending.md) の `users[].id` |
| 承認判定 | approve | boolean | 必須 | true: 承認 / false: 却下 |

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 対象ユーザーID | userId | string | 省略不可 | 入力値と同じ |

## 内部ロジック

### 処理フロー

1. ログインユーザーを取得し、管理者であることを確認する
2. 入力値を検証する
3. 却下の場合: `user.approvalStatus` を `REJECTED` に更新して終了
4. 承認の場合: `user.approvalStatus` を `APPROVED` に更新し、本人へ「アカウントが承認されました」メール (ログイン画面のURL付き) を送信する

### 例外処理

| ステータス | code | 条件 |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | 入力値が不正 |
| 401 | `UNAUTHORIZED` | 未ログイン |
| 403 | `FORBIDDEN` | 管理者以外 |

- 補足 (既知の課題): 存在しないユーザーIDを指定した場合は、更新時に例外となり 500 が返る (画面からは一覧に表示されたIDしか送られないため通常は発生しない)。

### 参照先DB一覧

- [ユーザー (user)](../db/01-user.md)

### UPDATE内容

- 承認: `APPROVED` → `user.approvalStatus`
- 却下: `REJECTED` → `user.approvalStatus`

### 実装ファイル

- `src/app/api/admin/approve-user/route.ts`
- `src/types/api/admin/approve-user/index.d.ts`
