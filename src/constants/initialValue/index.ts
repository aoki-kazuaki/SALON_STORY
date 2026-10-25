// State・フォーム・APIレスポンスで利用する各ドメイン型の初期値定義 (文字列は ""、日付/オブジェクトは null、配列は [])
import type { EditorSelection, LegendText, ScheduleMemo, UserProfile } from "@/types";

/** ユーザープロフィールの初期値 */
export const INITIAL_USER_PROFILE: UserProfile = {
  id: "",
  username: "",
  name: "",
  email: "",
  role: "USER",
  approvalStatus: "PENDING",
  createdAt: null,
};

/** スケジュールメモの初期値 */
export const INITIAL_SCHEDULE_MEMO: ScheduleMemo = {
  id: "",
  dateKey: "",
  content: "",
  updatedAt: null,
};

/** 凡例テキストの初期値 */
export const INITIAL_LEGEND_TEXT: LegendText = {
  content: "",
  updatedAt: null,
};

/** エディタ選択状態の初期値を生成する (Set を共有しないよう毎回新規生成) */
export const createInitialEditorSelection = (): EditorSelection => ({
  rangeMode: "month",
  targetMonth: "",
  includePastDates: false,
  periodStartDate: null,
  periodDays: 14,
  excludedDateKeys: new Set<string>(),
  selectedSlotNumber: null,
});
