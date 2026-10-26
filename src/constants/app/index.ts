// アプリケーション全体の業務ルールに関する定数定義
import type { BackgroundSlotNumber } from "@/types";

/** 背景画像の固定スロット番号一覧 */
export const BACKGROUND_SLOT_NUMBERS: BackgroundSlotNumber[] = [1, 2, 3, 4, 5];

/** 背景画像として受け付ける MIME タイプ */
export const BACKGROUND_ACCEPT_CONTENT_TYPES: string[] = ["image/jpeg", "image/png", "image/webp"];

/** 背景画像の最大ファイルサイズ (4MB。Vercel の関数はリクエストボディ 4.5MB までのため、マルチパートの余白を見込む) */
export const BACKGROUND_MAX_FILE_BYTES: number = 4 * 1024 * 1024;

/** 圧縮前に選択できる背景画像の最大ファイルサイズ (30MB。端末のメモリ不足で圧縮処理が落ちるのを防ぐ) */
export const BACKGROUND_SOURCE_MAX_FILE_BYTES: number = 30 * 1024 * 1024;

/** 背景画像の圧縮後の長辺ピクセル数 (ストーリーズの解像度 1080×1920 に合わせる) */
export const BACKGROUND_COMPRESS_MAX_EDGE_PX: number = 1920;

/** 背景画像の圧縮後の目標ファイルサイズ (MB。画質より通信量・ストレージ料金を優先) */
export const BACKGROUND_COMPRESS_MAX_SIZE_MB: number = 1;

/** 背景画像の圧縮時の初期 JPEG 品質 (0〜1) */
export const BACKGROUND_COMPRESS_INITIAL_QUALITY: number = 0.8;

/** 背景画像の圧縮後の MIME タイプ (透過不要の写真のため、最も軽量で全ブラウザが出力できる JPEG に統一) */
export const BACKGROUND_COMPRESS_CONTENT_TYPE: string = "image/jpeg";

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
