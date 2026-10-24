/**
 * アプリケーション全体で共有するドメイン型定義
 * - 文字列は "" / 日付は null / オブジェクトは null / 配列は [] を初期値とする
 * - undefined (省略可能プロパティ `?:` を含む) は一切使用しない
 */

// -----------------------------------------------------------------------------
// 共通
// -----------------------------------------------------------------------------

/** 日付キー ("YYYY-MM-DD" 形式の文字列) */
export type DateKey = string;

/** ISO 8601 形式の日時文字列 (未設定時は null) */
export type IsoDateTime = string | null;

/** 管理者による承認ステータス */
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

/** ユーザー権限 */
export type UserRole = "USER" | "ADMIN";

/** API エラーレスポンス共通形式 */
export type ApiErrorResponse = {
  /** エラー識別コード (例: "CONFLICT", "UNAUTHORIZED") */
  code: string;
  /** 画面表示用エラーメッセージ */
  message: string;
};

// -----------------------------------------------------------------------------
// ユーザー
// -----------------------------------------------------------------------------

/** ログインユーザーのプロフィール */
export type UserProfile = {
  /** ユーザーID */
  id: string;
  /** ログインID */
  username: string;
  /** 表示名 */
  name: string;
  /** メールアドレス */
  email: string;
  /** ユーザー権限 */
  role: UserRole;
  /** 新規登録の承認ステータス */
  approvalStatus: ApprovalStatus;
  /** 登録日時 */
  createdAt: IsoDateTime;
};

// -----------------------------------------------------------------------------
// スケジュールメモ
// -----------------------------------------------------------------------------

/** 1日分のスケジュールメモ */
export type ScheduleMemo = {
  /** メモID (未登録日は "") */
  id: string;
  /** 対象日 */
  dateKey: DateKey;
  /** メモ本文 (未入力・クリア済みは "") */
  content: string;
  /** 最終更新日時 (未登録日は null) */
  updatedAt: IsoDateTime;
};

/** データが存在する月の集計 */
export type ScheduleMonthSummary = {
  /** 月 (1〜12) */
  month: number;
  /** 入力済み日数 */
  count: number;
};

/** データが存在する年の集計 (登録データ一覧の年別アコーディオン用) */
export type ScheduleYearSummary = {
  /** 西暦年 */
  year: number;
  /** データが存在する月 (12月→1月の降順) */
  months: ScheduleMonthSummary[];
};

/** 月別一覧で直前に操作した日に付与するバッジ種別 ("" は付与なし) */
export type ScheduleOperationBadge = "NEW" | "UPDATED" | "";

// -----------------------------------------------------------------------------
// 背景画像
// -----------------------------------------------------------------------------

/** 背景画像スロット番号 (1〜5 の固定スロット) */
export type BackgroundSlotNumber = 1 | 2 | 3 | 4 | 5;

/** 背景画像スロット */
export type BackgroundSlot = {
  /** スロット番号 */
  slotNumber: BackgroundSlotNumber;
  /** S3 / MinIO 上のオブジェクトキー (未登録は "") */
  objectKey: string;
  /** 表示用の署名付きURL (未登録は "") */
  imageUrl: string;
  /** 最終更新日時 (未登録は null) */
  updatedAt: IsoDateTime;
};

// -----------------------------------------------------------------------------
// 凡例テキスト
// -----------------------------------------------------------------------------

/** ストーリーズ下部の凡例テキスト */
export type LegendText = {
  /** 凡例本文 (改行を含む、未入力は "") */
  content: string;
  /** 最終更新日時 (未保存は null) */
  updatedAt: IsoDateTime;
};

// -----------------------------------------------------------------------------
// エディタ / ストーリーズキャンバス
// -----------------------------------------------------------------------------

/** 期間・日付の選択方式 (month: 月指定 / period: 期間指定) */
export type EditorRangeMode = "month" | "period";

/** エディタの選択状態 (zustand で保持) */
export type EditorSelection = {
  /** 期間・日付の選択方式 */
  rangeMode: EditorRangeMode;
  /** 月指定時の対象年月 ("YYYY-MM"、未選択は "") */
  targetMonth: string;
  /** 月指定時に過去日を含めるかどうか */
  includePastDates: boolean;
  /** 期間指定時の開始日 (未選択は null) */
  periodStartDate: IsoDateTime;
  /** 期間指定時の日数プリセット */
  periodDays: number;
  /** チェックOFFにより除外した日付キー (条件変更時も維持) */
  excludedDateKeys: Set<DateKey>;
  /** 選択中の背景スロット番号 (未選択は null) */
  selectedSlotNumber: BackgroundSlotNumber | null;
};

/** カプセルバッジの表示バリアント (current: 当月 / future: 次月以降) */
export type StoryBadgeVariant = "current" | "future";

/** キャンバス上に描画するカプセルバッジ1件分 */
export type StoryBadgeItem = {
  /** 日付キー (React の key としても利用) */
  dateKey: DateKey;
  /** ピル内の表示ラベル (例: "10/25(日)") */
  label: string;
  /** 丸バッジ内の記号 (例: "◎", "残1") */
  markText: string;
  /** 表示バリアント */
  variant: StoryBadgeVariant;
};
