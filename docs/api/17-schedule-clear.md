# スケジュールメモクリア API 仕様書兼設計書

[← API一覧](README.md)

| 項目 | 内容 |
| --- | --- |
| API名称(論理名) | スケジュールメモクリア |
| API名称(物理名) | ScheduleClear |
| API名称(リクエストパス) | `/api/schedule/clear` |
| HTTPメソッド | DELETE |
| リクエスト形式 | `application/json` |
| レスポンス形式 | `application/json` |
| 認証可否 | 必要 |
| ステータスコード | 200: クリアに成功した場合<br>400: 日付の形式が不正な場合<br>401: 未ログインの場合 |
| 備考, 概要 | 月別一覧の「クリア」→ 確認ダイアログを経て呼ばれる。レコードは削除せず、本文を空文字で更新する (クリア後は未入力として扱われる) |

## 入力値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| 対象日 | dateKey | string | 必須 | 日付キー (`YYYY-MM-DD`) |

## 戻り値

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| クリア後のメモ | memo | object | 省略不可 | 項目は [スケジュールメモ保存](16-schedule-save.md) の `memo` と同じ (`content` は `""`) |

## 内部ロジック

### 処理フロー

1. ログインユーザーを取得する (未ログインは 401)
2. 入力値を検証する
3. 同じユーザー・同じ日付のメモの本文を `""` に更新する (レコードが無い場合は本文 `""` で INSERT する)

### 例外処理

| ステータス | code | 条件 |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | 日付の形式不正 |
| 401 | `UNAUTHORIZED` | 未ログイン |

### 参照先DB一覧

- [スケジュールメモ (schedule_memo)](../db/06-schedule-memo.md)

### 対象レコード取得条件

- `schedule_memo.userId` = ログインユーザーID かつ `schedule_memo.date` = 入力項目.対象日

### UPDATE内容

- 固定値 `""` → `schedule_memo.content`

### 実装ファイル

- `src/app/api/schedule/clear/route.ts`
- `src/types/api/schedule/clear/index.d.ts`
- `src/components/organisms/RecordsMonth/RecordsMonthDayList/index.tsx` (画面)
