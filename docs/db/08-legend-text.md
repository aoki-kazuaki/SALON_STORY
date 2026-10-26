# 凡例テキスト テーブル設計書

[← テーブル一覧](README.md) ・ [型早見表](README.md#型早見表-postgresql--prisma--typescript)

| 項目 | 内容 |
| --- | --- |
| テーブルID | LegendText |
| テーブル名(論理名) | 凡例テキスト |
| テーブル名(物理名) | `legend_text` |
| 備考・説明 | ストーリーズ下部の半透明カード (凡例カード) に表示する文章。1ユーザー1件で、未保存の場合はレコードなし |

| カラム名(論理名) | カラム名(物理名) | データ型 | PK | FK | NotNull | UNIQUE | コード値定義 | デフォルト値 | 備考 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 凡例ID | id | TEXT | 〇 | | 〇 | 〇 | - | cuid (自動採番) | |
| ユーザーID | userId | TEXT | | 〇 | 〇 | 〇 | - | - | `user.id` (削除時連動) |
| 凡例本文 | content | TEXT | | | 〇 | | - | `''` (空文字) | 改行を含む。500文字以内 (入力チェックで制限) |
| 作成日時 | createdAt | TIMESTAMP(3) | | | 〇 | | - | `CURRENT_TIMESTAMP` | |
| 更新日時 | updatedAt | TIMESTAMP(3) | | | 〇 | | - | - | 更新時に自動更新 |

## インデックス・制約

| 名前 | 種類 | 対象カラム |
| --- | --- | --- |
| `legend_text_pkey` | 主キー | `id` |
| `legend_text_userId_key` | 一意 | `userId` |
| `legend_text_userId_fkey` | 外部キー | `userId` → `user.id` (ON DELETE CASCADE) |

## 登録・更新・参照するAPI

- 登録・更新: [凡例テキスト保存](../api/19-legend-save.md)
- 参照: [凡例テキスト取得](../api/18-legend-detail.md)
