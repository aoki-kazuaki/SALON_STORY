/** api/schedule/summary : データが存在する年・月の一覧取得 */
import type { ScheduleYearSummary } from "@/types";

/** GET リクエストパラメータ (ログインユーザーの全期間を対象とするため指定項目なし) */
export type ReqParamsScheduleSummary = Record<string, never>;

/** GET レスポンス */
export type ResGetScheduleSummary = {
  /** データが存在する年 (降順、該当なしは []) */
  years: ScheduleYearSummary[];
};
