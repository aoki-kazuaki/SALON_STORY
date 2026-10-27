# 背景画像スロット テーブル設計書

[← テーブル一覧](README.md) ・ [型早見表](README.md#型早見表-postgresql--prisma--typescript)

| 項目 | 内容 |
| --- | --- |
| テーブルID | BackgroundSlot |
| テーブル名(論理名) | 背景画像スロット |
| テーブル名(物理名) | `background_slot` |
| 備考・説明 | ストーリーズの背景画像。1〜4番の固定スロットで、未登録のスロットはレコードなし。画像本体はストレージ (本番: AWS S3 / ローカル: MinIO) に保存し、ここではその場所 (オブジェクトキー) を管理する |

| カラム名(論理名) | カラム名(物理名) | データ型 | PK | FK | NotNull | UNIQUE | コード値定義 | デフォルト値 | 備考 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| スロットID | id | TEXT | 〇 | | 〇 | 〇 | - | cuid (自動採番) | |
| ユーザーID | userId | TEXT | | 〇 | 〇 | 〇 (※) | - | - | `user.id` (削除時連動) |
| スロット番号 | slotNumber | INTEGER | | | 〇 | 〇 (※) | 1〜4 | - | 範囲はアプリ側で検証 (DB 制約なし) |
| オブジェクトキー | objectKey | TEXT | | | 〇 | | - | - | `backgrounds/<ユーザーID>/slot<番号>-<UUID>.<拡張子>`。アップロードごとに新しいキー |
| MIMEタイプ | contentType | TEXT | | | 〇 | | `image/jpeg` / `image/png` / `image/webp` | - | 画面側で圧縮するため、通常は `image/jpeg` |
| 作成日時 | createdAt | TIMESTAMP(3) | | | 〇 | | - | `CURRENT_TIMESTAMP` | |
| 更新日時 | updatedAt | TIMESTAMP(3) | | | 〇 | | - | - | 更新時に自動更新 (上書変更時) |

※ `userId` と `slotNumber` の組み合わせで一意

## インデックス・制約

| 名前 | 種類 | 対象カラム |
| --- | --- | --- |
| `background_slot_pkey` | 主キー | `id` |
| `background_slot_userId_slotNumber_key` | 一意 | `userId`, `slotNumber` |
| `background_slot_userId_fkey` | 外部キー | `userId` → `user.id` (ON DELETE CASCADE) |

## 注意

- ユーザー削除時、DB のレコードは連動して削除されるが、**ストレージ上の画像ファイルは削除されない** (ユーザー削除機能は現在なし)。
- スロット数を5→4に変更した経緯から、`slotNumber` = 5 の旧データが残っている場合でも一覧取得 API は返さない。

## 登録・更新・削除するAPI

- 登録・更新: [背景画像アップロード](../api/21-background-upload.md)
- 削除: [背景画像削除](../api/22-background-delete.md)
- 参照: [背景画像一覧取得](../api/20-background-list.md)
