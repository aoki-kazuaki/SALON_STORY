# エディタ設定保存 API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | エディタ設定保存 |
| API名称(物理名) | EditorSetting (POST) |
| API名称(リクエストパス) | `/api/editor/setting` |
| HTTPメソッド | POST |
| リクエスト形式 | `application/json` |
| レスポンス形式 | `application/json` |
| 認証可否 | 必要 |
| ステータスコード | 200: 保存に成功した場合<br>400: スロット番号が不正な場合<br>401: 未ログインの場合 |
| 備考, 概要 | エディタの「③ 背景画像を選択」でサムネイルを押したときに呼ばれる。1ユーザー1件 |

## 入力値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 選択する背景スロット番号 | selectedSlotNumber | number / null | 必須 | 1〜4 の整数。`null` で選択解除 |

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 保存後の背景スロット番号 | selectedSlotNumber | number / null | 省略不可 | |

## 内部ロジック

### 処理フロー

1. ログインユーザーを取得する (未ログインは 401)
2. 入力値を検証する
3. エディタ設定を登録・更新する (存在すれば UPDATE、無ければ INSERT)

### 例外処理

| ステータス | code | 条件 |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | スロット番号が 1〜4 の整数・`null` のいずれでもない |
| 401 | `UNAUTHORIZED` | 未ログイン |

### 参照先DB一覧

- [エディタ設定 (editor_setting)](../db/09-editor-setting.md)

### INSERT / UPDATE内容

- 新規生成.設定ID (cuid) → `id` (INSERT 時のみ)
- ログインユーザーID → `userId` (INSERT 時のみ)
- 入力項目.選択する背景スロット番号 → `selectedSlotNumber`

### 実装ファイル

- `src/app/api/editor/setting/route.ts` (POST)
- `src/types/api/editor/setting/index.d.ts`
- `src/components/organisms/Editor/EditorBackgroundPicker/index.tsx` (画面)
