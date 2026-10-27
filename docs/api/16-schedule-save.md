# スケジュールメモ保存 API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | スケジュールメモ保存 |
| API名称(物理名) | ScheduleSave |
| API名称(リクエストパス) | `/api/schedule/save` |
| HTTPメソッド | POST |
| リクエスト形式 | `application/json` |
| レスポンス形式 | `application/json` |
| 認証可否 | 必要 |
| ステータスコード | 200: 保存に成功した場合<br>400: 入力チェックに該当した場合<br>401: 未ログインの場合<br>409: 入力済みの日付に `overwrite: false` で保存しようとした場合 |
| 備考, 概要 | 1ユーザー × 1日 = 1件。ダッシュボードの「メモを入力」(新規、`overwrite: false`) と、月別一覧・エディタの「編集」「メモを追加」(`overwrite: true`) から呼ばれる。<br>409 の場合、画面は新旧の内容を並べた上書き確認ダイアログを表示し、「上書きする」で `overwrite: true` として再送する |

## 入力値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 対象日 | dateKey | string | 必須 | 日付キー (`YYYY-MM-DD`)。実在する日付のみ<br>※過去日は画面 (ダッシュボード) 側で選択不可。API では制限しない |
| メモ本文 | content | string | 必須 | 全体で120文字以内 / 最大5行 / 1行20文字以内 (空行・前後の空白は数えない)<br>※画面側では空 (空白のみ) を不可とする。API では空文字も受け付ける |
| 上書き判定 | overwrite | boolean | 必須 | true: 既存メモがあっても上書き / false: 既存メモがあれば 409 |

## 戻り値

200 (成功時)

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 保存後のメモ | memo: { | object | 省略不可 | - |
| 　メモID | id | string | 省略不可 | |
| 　対象日 | dateKey | string | 省略不可 | 日付キー |
| 　メモ本文 | content | string | 省略不可 | 空行・各行の前後の空白を除去した内容 |
| 　最終更新日時 | updatedAt | string | 省略不可 | ISO 日時 |
| - | } | - | - | |
| 新規作成判定 | isCreated | boolean | 省略不可 | true: 新規 (画面で NEW バッジ) / false: 上書き (UPDATED バッジ) |

409 (重複時)

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| エラー識別コード | code | string | 省略不可 | `"CONFLICT"` |
| エラーメッセージ | message | string | 省略不可 | 「この日付には既にメモが登録されています」 |
| 登録済みのメモ | existingMemo | object | 省略不可 | 項目は成功時の `memo` と同じ (新旧比較ダイアログ用) |

## 内部ロジック

### 処理フロー

1. ログインユーザーを取得する (未ログインは 401)
2. 入力値を検証する
3. メモ本文を整形する (空行と各行の前後の空白を除去し、改行で連結)
4. 同じユーザー・同じ日付のメモを取得する
5. 既存メモの本文が空でなく、かつ `overwrite` が `false` の場合は 409 を返す
6. メモを登録・更新する (存在すれば UPDATE、無ければ INSERT)
7. 既存メモの本文が空 (未登録・クリア済み) だった場合は `isCreated: true` を返す

### 例外処理

| ステータス | code | 条件 |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | 日付の形式不正 / 本文が120文字超・6行以上・1行21文字以上 / 未入力の日への新規登録で、日付が今月から3か月先の月末より後 (サーバーと端末のタイムゾーン差を考慮し、サーバー側は1日先を基準日として判定) |
| 401 | `UNAUTHORIZED` | 未ログイン |
| 409 | `CONFLICT` | 入力済みの日付に `overwrite: false` で保存 |

### 参照先DB一覧

- [スケジュールメモ (schedule_memo)](../db/06-schedule-memo.md)

### 対象レコード取得条件

- `schedule_memo.userId` = ログインユーザーID かつ `schedule_memo.date` = 入力項目.対象日 (一意キー)

### INSERT / UPDATE内容

スケジュールメモ (schedule_memo)
- 新規生成.メモID (cuid) → `id` (INSERT 時のみ)
- ログインユーザーID → `userId` (INSERT 時のみ)
- 入力項目.対象日 → `date` (INSERT 時のみ)
- 整形後のメモ本文 → `content`

### 実装ファイル

- `src/app/api/schedule/save/route.ts`
- `src/types/api/schedule/save/index.d.ts`
- `src/lib/schemas.ts` (`schemaScheduleSaveBody`)
- `src/components/organisms/App/MemoEditDialog/index.tsx` (画面)
