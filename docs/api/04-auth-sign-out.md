# ログアウト API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | ログアウト |
| API名称(物理名) | AuthSignOut |
| API名称(リクエストパス) | `/api/auth/sign-out` |
| HTTPメソッド | POST |
| リクエスト形式 | `application/json` (ボディなし) |
| レスポンス形式 | `application/json` |
| 認証可否 | 必要 (セッション Cookie) |
| ステータスコード | 200: ログアウトに成功した場合 |
| 備考, 概要 | BetterAuth が提供する API。ヘッダーのログアウトボタン → 確認ダイアログで「ログアウト」を押すと呼ばれ、ログイン画面へ遷移する |

## 入力値

なし (Cookie のセッショントークンを使用)

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 成功判定 | success | boolean | 省略不可 | `true` |

## 内部ロジック

### 処理フロー

1. Cookie のセッショントークンに一致する `session` を削除する
2. セッション Cookie を削除する

### 参照先DB一覧

- [セッション (session)](../db/02-session.md)

### 対象レコード取得条件

- `session.token` = Cookie のセッショントークン

### 実装ファイル

- `src/components/organisms/App/AppHeader/index.tsx` (画面)
