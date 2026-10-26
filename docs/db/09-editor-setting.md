# エディタ設定 テーブル設計書

[← テーブル一覧](README.md) ・ [型早見表](README.md#型早見表-postgresql--prisma--typescript)

| 項目 | 内容 |
| --- | --- |
| テーブルID | EditorSetting |
| テーブル名(論理名) | エディタ設定 |
| テーブル名(物理名) | `editor_setting` |
| 備考・説明 | ストーリーズエディタで選択中の背景スロット番号を保持する。1ユーザー1件で、未設定の場合はレコードなし |

| カラム名(論理名) | カラム名(物理名) | データ型 | PK | FK | NotNull | UNIQUE | コード値定義 | デフォルト値 | 備考 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 設定ID | id | TEXT | 〇 | | 〇 | 〇 | - | cuid (自動採番) | |
| ユーザーID | userId | TEXT | | 〇 | 〇 | 〇 | - | - | `user.id` (削除時連動) |
| 選択中の背景スロット番号 | selectedSlotNumber | INTEGER | | | | | 1〜4 | NULL | NULL (未選択) または選択したスロットが未登録の場合、画面はスロット1を使う |
| 作成日時 | createdAt | TIMESTAMP(3) | | | 〇 | | - | `CURRENT_TIMESTAMP` | |
| 更新日時 | updatedAt | TIMESTAMP(3) | | | 〇 | | - | - | 更新時に自動更新 |

## インデックス・制約

| 名前 | 種類 | 対象カラム |
| --- | --- | --- |
| `editor_setting_pkey` | 主キー | `id` |
| `editor_setting_userId_key` | 一意 | `userId` |
| `editor_setting_userId_fkey` | 外部キー | `userId` → `user.id` (ON DELETE CASCADE) |

## 登録・更新・参照するAPI

- 登録・更新: [エディタ設定保存](../api/24-editor-setting-post.md)
- 参照: [エディタ設定取得](../api/23-editor-setting-get.md)
