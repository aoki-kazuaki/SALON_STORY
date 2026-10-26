// アプリケーション全体の業務ルールに関する定数定義
import type { BackgroundSlotNumber } from "@/types";

/** 背景画像の固定スロット番号一覧 */
export const BACKGROUND_SLOT_NUMBERS: BackgroundSlotNumber[] = [1, 2, 3, 4, 5];

/** 背景画像として受け付ける MIME タイプ */
export const BACKGROUND_ACCEPT_CONTENT_TYPES: string[] = ["image/jpeg", "image/png", "image/webp"];

/** 背景画像の最大ファイルサイズ (10MB) */
export const BACKGROUND_MAX_FILE_BYTES: number = 10 * 1024 * 1024;

/** スケジュールメモの最大行数 (ストーリーズで多数の日付を1画面に収めるための上限) */
export const SCHEDULE_MEMO_MAX_LINES: number = 3;

/** スケジュールメモ1行あたりの最大文字数 (例: "16:00〜 カットのみ" は11文字) */
export const SCHEDULE_MEMO_MAX_LINE_LENGTH: number = 15;

/** スケジュールメモ本文全体の最大文字数 (改行・前後の空白を含めた入力欄の上限) */
export const SCHEDULE_MEMO_MAX_LENGTH: number = 60;

/** 凡例テキストの最大文字数 */
export const LEGEND_MAX_LENGTH: number = 500;

/** 登録データ一覧で初期展開する直近年数 */
export const RECORDS_DEFAULT_OPEN_YEAR_COUNT: number = 2;

/** 期間指定で選択できる日数プリセット (上限 28日) */
export const EDITOR_PERIOD_DAY_PRESETS: number[] = [7, 14, 21, 28];

/** トースト通知の表示時間 (ミリ秒) */
export const TOAST_DURATION_MS: number = 2000;
