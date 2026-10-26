# 凡例テキスト取得 API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | 凡例テキスト取得 |
| API名称(物理名) | LegendDetail |
| API名称(リクエストパス) | `/api/legend/detail` |
| HTTPメソッド | GET |
| リクエスト形式 | - |
| レスポンス形式 | `application/json` |
| 認証可否 | 必要 |
| ステータスコード | 200: 取得に成功した場合 (未保存でも 200)<br>401: 未ログインの場合 |
| 備考, 概要 | ストーリーズ下部の半透明カード (凡例カード) に表示する文章。ダッシュボードの編集ダイアログとエディタで使う |

## 入力値

なし

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 凡例テキスト | legend: { | object | 省略不可 | - |
| 　凡例本文 | content | string | 省略不可 | 改行を含む。未保存の場合は `""` |
| 　最終更新日時 | updatedAt | string / null | 省略不可 | ISO 日時。未保存の場合は `null` |
| - | } | - | - | |

## 内部ロジック

### 処理フロー

1. ログインユーザーを取得する (未ログインは 401)
2. ログインユーザーの凡例テキストを取得する。無い場合は `content: ""` / `updatedAt: null` を返す

### 参照先DB一覧

- [凡例テキスト (legend_text)](../db/08-legend-text.md)

### 対象レコード取得条件

- `legend_text.userId` = ログインユーザーID

### 実装ファイル

- `src/app/api/legend/detail/route.ts`
- `src/types/api/legend/detail/index.d.ts`
