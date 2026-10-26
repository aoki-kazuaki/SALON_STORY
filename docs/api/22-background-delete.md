# 背景画像削除 API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | 背景画像削除 |
| API名称(物理名) | BackgroundDelete |
| API名称(リクエストパス) | `/api/background/delete` |
| HTTPメソッド | DELETE |
| リクエスト形式 | `application/json` |
| レスポンス形式 | `application/json` |
| 認証可否 | 必要 |
| ステータスコード | 200: 削除に成功した場合 (未登録のスロットを指定した場合も 200)<br>400: スロット番号が不正な場合<br>401: 未ログインの場合 |
| 備考, 概要 | 背景画像管理画面の「削除」→ 確認ダイアログを経て呼ばれる。画像はストレージから物理削除し、元に戻せない |

## 入力値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| スロット番号 | slotNumber | number | 必須 | 1〜4 の整数 |

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 削除したスロット番号 | slotNumber | number | 省略不可 | 入力値と同じ |

## 内部ロジック

### 処理フロー

1. ログインユーザーを取得する (未ログインは 401)
2. 入力値を検証する
3. 対象スロットの登録を取得する
4. 登録がある場合: ストレージから画像を物理削除し、`background_slot` のレコードを削除する
5. 登録が無い場合: 何もせずに成功を返す

### 例外処理

| ステータス | code | 条件 |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | スロット番号が 1〜4 の整数でない |
| 401 | `UNAUTHORIZED` | 未ログイン |

### 参照先DB一覧

- [背景画像スロット (background_slot)](../db/07-background-slot.md)

### 対象レコード取得条件

- `background_slot.userId` = ログインユーザーID かつ `background_slot.slotNumber` = 入力項目.スロット番号 (一意キー)

### DELETE内容

- 対象の `background_slot` レコードを物理削除する
- ストレージ上の `objectKey` のファイルを物理削除する

### 実装ファイル

- `src/app/api/background/delete/route.ts`
- `src/types/api/background/delete/index.d.ts`
