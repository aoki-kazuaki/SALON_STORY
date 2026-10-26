# 検証トークン テーブル設計書

[← テーブル一覧](README.md) ・ [型早見表](README.md#型早見表-postgresql--prisma--typescript)

| 項目 | 内容 |
| --- | --- |
| テーブルID | Verification |
| テーブル名(論理名) | 検証トークン |
| テーブル名(物理名) | `verification` |
| 備考・説明 | BetterAuth 標準テーブル。本アプリではパスワード再設定URLのトークン (有効期限1時間) の管理に使う。使用後は削除される |

| カラム名(論理名) | カラム名(物理名) | データ型 | PK | FK | NotNull | UNIQUE | コード値定義 | デフォルト値 | 備考 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 検証ID | id | TEXT | 〇 | | 〇 | 〇 | - | - | BetterAuth が生成 |
| 検証対象の識別子 | identifier | TEXT | | | 〇 | | `reset-password:<トークン>`: パスワード再設定 | - | 再設定URLのトークンを含む |
| 値 | value | TEXT | | | 〇 | | - | - | パスワード再設定の場合は対象の `user.id` (外部キー制約なし) |
| 有効期限 | expiresAt | TIMESTAMP(3) | | | 〇 | | - | - | 発行時点 + 1時間 |
| 作成日時 | createdAt | TIMESTAMP(3) | | | 〇 | | - | `CURRENT_TIMESTAMP` | |
| 更新日時 | updatedAt | TIMESTAMP(3) | | | 〇 | | - | - | 更新時に自動更新 |

## インデックス・制約

| 名前 | 種類 | 対象カラム |
| --- | --- | --- |
| `verification_pkey` | 主キー | `id` |
| `verification_identifier_idx` | インデックス | `identifier` |

## 登録・参照・削除するAPI

- 登録: [パスワードリセット承認](../api/13-admin-approve-reset.md)
- 参照: [パスワードリセットトークン確認](../api/09-password-reset-detail.md)
- 削除 (使用時): [パスワード再設定](../api/07-auth-reset-password.md)
