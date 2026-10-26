# 凡例テキスト保存 API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | 凡例テキスト保存 |
| API名称(物理名) | LegendSave |
| API名称(リクエストパス) | `/api/legend/save` |
| HTTPメソッド | POST |
| リクエスト形式 | `application/json` |
| レスポンス形式 | `application/json` |
| 認証可否 | 必要 |
| ステータスコード | 200: 保存に成功した場合<br>400: 500文字を超える場合<br>401: 未ログインの場合 |
| 備考, 概要 | ダッシュボードの「凡例テキストを編集」ダイアログから呼ばれる。1ユーザー1件 |

## 入力値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 凡例本文 | content | string | 必須 | 500文字以内。改行可・空文字可 |

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 保存後の凡例テキスト | legend | object | 省略不可 | 項目は [凡例テキスト取得](18-legend-detail.md) と同じ |

## 内部ロジック

### 処理フロー

1. ログインユーザーを取得する (未ログインは 401)
2. 入力値を検証する
3. 凡例テキストを登録・更新する (存在すれば UPDATE、無ければ INSERT)

### 例外処理

| ステータス | code | 条件 |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | 500文字を超える |
| 401 | `UNAUTHORIZED` | 未ログイン |

### 参照先DB一覧

- [凡例テキスト (legend_text)](../db/08-legend-text.md)

### INSERT / UPDATE内容

- 新規生成.凡例ID (cuid) → `id` (INSERT 時のみ)
- ログインユーザーID → `userId` (INSERT 時のみ)
- 入力項目.凡例本文 → `content`

### 実装ファイル

- `src/app/api/legend/save/route.ts`
- `src/types/api/legend/save/index.d.ts`
- `src/components/organisms/Home/HomeLegendDialog/index.tsx` (画面)
