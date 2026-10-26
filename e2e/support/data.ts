// E2E シナリオで使うユーザー・入力値の定義 (シナリオの進行に合わせてパスワード・メールが変わる)
import dayjs from "dayjs";

/** シナリオに登場するユーザー */
type E2EUser = {
  /** ログインID */
  username: string;
  /** メールアドレス */
  email: string;
  /** 登録時のパスワード */
  password: string;
};

/** 最初に登録するユーザー (自動的に管理者になる) */
export const E2E_OWNER: E2EUser = {
  username: "salon_owner",
  email: "owner@salon-e2e.test",
  password: "Owner2026pass",
};

/** 2人目に登録するユーザー (承認待ち → 管理者承認 → PWリセット → 設定変更 の順に使う) */
export const E2E_STAFF: E2EUser = {
  username: "salon_staff",
  email: "staff@salon-e2e.test",
  password: "Staff2026pass",
};

/** スタッフが PWリセットで設定するパスワード */
export const E2E_STAFF_RESET_PASSWORD: string = "Reset2026pass";

/** スタッフがユーザー設定で変更するパスワード */
export const E2E_STAFF_CHANGED_PASSWORD: string = "Change2026pass";

/** スタッフがユーザー設定で変更するメールアドレス */
export const E2E_STAFF_CHANGED_EMAIL: string = "staff.new@salon-e2e.test";

/** 管理者のログイン状態の保存先 (認証シナリオで保存し、以降のシナリオで再利用する) */
export const E2E_OWNER_STORAGE_STATE: string = "e2e/.auth/owner.json";

/** ストーリーズの凡例テキスト */
export const E2E_LEGEND_TEXT: string = "白：今月　／　黒：来月\nご予約はプロフィールのリンク、またはDMからどうぞ。";

/** 空き枠メモの本文パターン (1〜3行、1行15文字以内) */
const MEMO_CONTENT_PATTERNS: string[] = [
  "10:00〜",
  "13:00〜 / 15:30〜",
  "11:00〜\n14:00〜",
  "終日OK",
  "16:00〜 カットのみ\n※カラーは要相談",
  "10:30〜\n13:15〜\n17:00〜",
  "18:00〜",
  "12:00〜 / 14:30〜\n2名まで",
];

/** 空き枠を登録しない日のパターン (定休日のイメージ。登録日を間引いて実データに近づける) */
const SKIP_DAY_INTERVAL = 4;

/** 一括登録する空き枠メモ */
export type E2EMemo = {
  /** 日付キー ("YYYY-MM-DD") */
  dateKey: string;
  /** 本文 */
  content: string;
};

/**
 * 今日から指定日数先までの空き枠メモを生成する (月をまたぐ件数・行数の異なるデータ)
 * @param startOffsetDays 何日後から登録するか
 * @param days 何日分を対象にするか
 */
export const e2eBuildMemos = (startOffsetDays: number, days: number): E2EMemo[] =>
  Array.from({ length: days }, (_, index) => index + startOffsetDays)
    .filter((offset) => !(offset % SKIP_DAY_INTERVAL === 0))
    .map((offset, index) => ({
      dateKey: e2eDateKeyAfter(offset),
      content: MEMO_CONTENT_PATTERNS[index % MEMO_CONTENT_PATTERNS.length],
    }));

/** 今日から指定日数後の日付キー ("YYYY-MM-DD") */
export const e2eDateKeyAfter = (days: number): string => dayjs().add(days, "day").format("YYYY-MM-DD");

/**
 * シナリオで一括登録する空き枠メモ
 * - 今日の2〜3日前 (今日と同じ月の場合のみ。「過去日を含める」の確認用)
 * - 2日後〜45日後 (4日おきに休み。月をまたぎ、1〜3行のメモが混在する)
 */
export const e2eBuildScenarioMemos = (): E2EMemo[] => {
  const currentMonth = e2eDateKeyAfter(0).slice(0, 7);
  const pastMemos = [e2eDateKeyAfter(-3), e2eDateKeyAfter(-2)]
    .filter((dateKey) => dateKey.slice(0, 7) === currentMonth)
    .map((dateKey) => ({ dateKey, content: "13:00〜" }));
  return [...pastMemos, ...e2eBuildMemos(2, 44)];
};
