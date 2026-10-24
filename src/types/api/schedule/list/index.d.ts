/** api/schedule/list : 期間内のスケジュールメモ一覧取得 */
import type { DateKey, ScheduleMemo } from "@/types";

/** GET リクエストパラメータ */
export type ReqParamsScheduleList = {
  /** 取得開始日 */
  startDate: DateKey;
  /** 取得終了日 (この日を含む) */
  endDate: DateKey;
};

/** GET レスポンス */
export type ResGetScheduleList = {
  /** 期間内の入力済みメモ (日付昇順、該当なしは []) */
  memos: ScheduleMemo[];
};
