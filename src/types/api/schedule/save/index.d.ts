/** api/schedule/save : スケジュールメモの新規登録・上書き */
import type { ApiErrorResponse, DateKey, ScheduleMemo } from "@/types";

/** POST リクエストボディ */
export type ReqBodyScheduleSave = {
  /** 対象日 (過去日は不可) */
  dateKey: DateKey;
  /** メモ本文 */
  content: string;
  /** 既存データを上書きするかどうか (false で既存データがある場合は 409 を返却) */
  overwrite: boolean;
};

/** POST レスポンス (成功時) */
export type ResPostScheduleSave = {
  /** 保存後のメモ */
  memo: ScheduleMemo;
  /** 新規作成かどうか (true: NEW / false: UPDATED バッジ表示に利用) */
  isCreated: boolean;
};

/** POST レスポンス (409 重複時、新旧比較ダイアログ用) */
export type ResPostScheduleSaveConflict = ApiErrorResponse & {
  /** DB に登録済みの既存メモ */
  existingMemo: ScheduleMemo;
};
