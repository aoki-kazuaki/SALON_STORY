/** api/schedule/clear : スケジュールメモのクリア (本文を空文字で更新) */
import type { DateKey, ScheduleMemo } from "@/types";

/** DELETE リクエストボディ */
export type ReqBodyScheduleClear = {
  /** クリア対象日 */
  dateKey: DateKey;
};

/** DELETE レスポンス */
export type ResDeleteScheduleClear = {
  /** クリア後のメモ (content は "") */
  memo: ScheduleMemo;
};
