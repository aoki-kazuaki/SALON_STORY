# セッション取得 API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | セッション取得 |
| API名称(物理名) | AuthGetSession |
| API名称(リクエストパス) | `/api/auth/get-session` |
| HTTPメソッド | GET |
| リクエスト形式 | - |
| レスポンス形式 | `application/json` |
| 認証可否 | 不要 (未ログイン時は `null` を返す) |
| ステータスコード | 200: 取得に成功した場合 (未ログインでも 200) |
| 備考, 概要 | BetterAuth が提供する API。画面の `authClient.useSession()` が呼び出し、ログイン状態の確認・ヘッダーの管理者メニュー表示・ダッシュボードの挨拶文などに使う。<br>ブラウザのタブに戻ったときにも再取得される |

## 入力値

なし (Cookie のセッショントークンを使用)

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| セッション | session: { | object | 省略不可 | 未ログイン時はレスポンス全体が `null` |
| 　有効期限 | expiresAt | string | 省略不可 | ISO 日時 |
| 　ユーザーID | userId | string | 省略不可 | |
| - | } | - | - | ほか BetterAuth 標準項目 (id, token, ipAddress, userAgent 等) |
| ログインユーザー | user | object | 省略不可 | 項目は [新規登録](01-auth-sign-up-email.md) の戻り値と同じ (role / approvalStatus を含む) |

## 内部ロジック

### 処理フロー

1. Cookie のセッショントークンに一致し、有効期限内の `session` を取得する
2. 紐づく `user` を取得して返却する
3. 前回の延長から1日以上経過している場合は、有効期限を現在日時 + 30日に延長する

### 参照先DB一覧

- [セッション (session)](../db/02-session.md)
- [ユーザー (user)](../db/01-user.md)

### 補足

アプリ独自の API (No 8〜24) は、この HTTP API ではなくサーバー内部で `auth.api.getSession()` を呼び、ログインユーザーを取得している (`src/lib/api/server.ts` の `apiGetSessionUser`)。

### 実装ファイル

- `src/components/organisms/App/AppInitializer/index.tsx` (セッション切れ・管理者メニューのアクセス制御)
- `src/lib/api/server.ts`
