# 背景画像アップロード API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | 背景画像アップロード |
| API名称(物理名) | BackgroundUpload |
| API名称(リクエストパス) | `/api/background/upload` |
| HTTPメソッド | POST |
| リクエスト形式 | `multipart/form-data` |
| レスポンス形式 | `application/json` |
| 認証可否 | 必要 |
| ステータスコード | 200: 登録に成功した場合<br>400: スロット番号・ファイル形式・ファイルサイズが不正な場合<br>401: 未ログインの場合<br>413: リクエストが 4.5MB を超えた場合 (Vercel の制限。通常は画面側の圧縮により発生しない) |
| 備考, 概要 | 新規登録・上書変更の共通 API。画面は送信前にブラウザ側で長辺1920px・約1MBの JPEG に圧縮する (`src/utils/blob.ts`)。<br>上書き時は旧画像をストレージから物理削除する |

## 入力値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| スロット番号 | slotNumber | string | 必須 | `"1"`〜`"4"` (FormData のため文字列で送り、数値に変換して検証) |
| 画像ファイル | file | file | 必須 | JPEG / PNG / WebP、4MB 以下 |

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 登録後のスロット | slot | object | 省略不可 | 項目は [背景画像一覧取得](20-background-list.md) の `slots[]` と同じ |

## 内部ロジック

### 処理フロー

1. ログインユーザーを取得する (未ログインは 401)
2. スロット番号・ファイル形式・ファイルサイズを検証する
3. 新しいオブジェクトキーを生成し、ストレージ (S3 / MinIO) に保存する
4. 同じスロットの既存登録を取得する
5. スロットを登録・更新する (存在すれば UPDATE、無ければ INSERT)
6. 既存登録があった場合は、旧画像をストレージから物理削除する
7. 表示用の署名付きURL付きでスロット情報を返す

### 例外処理

| ステータス | code | message |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | 入力内容に誤りがあります (スロット番号不正・ファイル未指定) |
| 400 | `INVALID_FILE_TYPE` | この形式の画像は登録できません。JPEG / PNG / WebP の画像を選択してください |
| 400 | `FILE_TOO_LARGE` | 画像のファイルサイズが大きすぎます (4MB まで)。別の画像を選択してください |
| 401 | `UNAUTHORIZED` | ログインが必要です |

### 参照先DB一覧

- [背景画像スロット (background_slot)](../db/07-background-slot.md)

### サービス内での呼び出し時に新規生成される値

- オブジェクトキー: `backgrounds/<ユーザーID>/slot<スロット番号>-<UUID>.<拡張子>` (拡張子: jpg / png / webp)
  - 同じキーへの上書きだとブラウザのキャッシュに旧画像が残るため、毎回新しいキーにする

### INSERT / UPDATE内容

背景画像スロット (background_slot)
- 新規生成.スロットID (cuid) → `id` (INSERT 時のみ)
- ログインユーザーID → `userId` (INSERT 時のみ)
- 入力項目.スロット番号 → `slotNumber` (INSERT 時のみ)
- 新規生成.オブジェクトキー → `objectKey`
- 入力項目.画像ファイルの MIME タイプ → `contentType`

### 実装ファイル

- `src/app/api/background/upload/route.ts`
- `src/types/api/background/upload/index.d.ts`
- `src/lib/s3.ts`、`src/utils/blob.ts` (画面側の圧縮)
- `src/components/organisms/Backgrounds/BackgroundsSlotCard/index.tsx` (画面)
