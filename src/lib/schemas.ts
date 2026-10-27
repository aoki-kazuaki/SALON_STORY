import dayjs from "dayjs";
import { z } from "zod";

import {
  BACKGROUND_SLOT_NUMBERS,
  LEGEND_MAX_LENGTH,
  SCHEDULE_MEMO_FUTURE_MONTH_COUNT,
  SCHEDULE_MEMO_MAX_LENGTH,
  SCHEDULE_MEMO_MAX_LINE_LENGTH,
  SCHEDULE_MEMO_MAX_LINES,
} from "@/constants/app";
import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
  AUTH_PASSWORD_PATTERN,
  AUTH_PASSWORD_RULE_TEXT,
  AUTH_USERNAME_MAX_LENGTH,
  AUTH_USERNAME_MIN_LENGTH,
} from "@/constants/auth";
import type { DateKey } from "@/types";
import { arraySplitLines } from "@/utils/array";
import { dateFormatBadgeLabel } from "@/utils/date";

// -----------------------------------------------------------------------------
// 共通パーツ
// -----------------------------------------------------------------------------

/** "YYYY-MM-DD" 形式かつ実在する日付 */
const dateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日付を選択してください")
  .refine((value) => dayjs(value).format("YYYY-MM-DD") === value, "存在しない日付です");

/** 背景スロット番号 (1〜4) */
const slotNumberSchema = z.number().int().min(1).max(BACKGROUND_SLOT_NUMBERS.length);

/** スケジュールメモ本文 (空文字可、最大5行・1行20文字まで。空行・前後の空白は数えない) */
const memoContentSchema = z
  .string()
  .max(SCHEDULE_MEMO_MAX_LENGTH, `${SCHEDULE_MEMO_MAX_LENGTH}文字以内で入力してください`)
  .refine(
    (value) => arraySplitLines(value).length <= SCHEDULE_MEMO_MAX_LINES,
    `${SCHEDULE_MEMO_MAX_LINES}行以内で入力してください`,
  )
  .refine(
    (value) => arraySplitLines(value).every((line) => line.length <= SCHEDULE_MEMO_MAX_LINE_LENGTH),
    `1行${SCHEDULE_MEMO_MAX_LINE_LENGTH}文字以内で入力してください`,
  );

/** メールアドレス */
const emailSchema = z.email("メールアドレスの形式が正しくありません");

/** パスワード (英大文字・英小文字・数字をそれぞれ含む8文字以上、サーバー側の BetterAuth フックでも同じ検証を行う) */
export const schemaPassword = z
  .string()
  .min(AUTH_PASSWORD_MIN_LENGTH, `${AUTH_PASSWORD_MIN_LENGTH}文字以上で入力してください`)
  .max(AUTH_PASSWORD_MAX_LENGTH, `${AUTH_PASSWORD_MAX_LENGTH}文字以内で入力してください`)
  .regex(AUTH_PASSWORD_PATTERN, `${AUTH_PASSWORD_RULE_TEXT}で入力してください`);

// -----------------------------------------------------------------------------
// API リクエスト検証 (サーバー側)
// -----------------------------------------------------------------------------

/** api/schedule/list の GET パラメータ */
export const schemaScheduleListParams = z.object({ startDate: dateKeySchema, endDate: dateKeySchema });

/** api/schedule/save の POST ボディ */
export const schemaScheduleSaveBody = z.object({
  dateKey: dateKeySchema,
  content: memoContentSchema,
  overwrite: z.boolean(),
});

/** api/schedule/clear の DELETE ボディ */
export const schemaScheduleClearBody = z.object({ dateKey: dateKeySchema });

/** api/background/delete の DELETE ボディ */
export const schemaBackgroundDeleteBody = z.object({ slotNumber: slotNumberSchema });

/** api/background/upload の slotNumber フィールド (FormData のため文字列から変換) */
export const schemaBackgroundUploadSlotNumber = z.coerce.number().pipe(slotNumberSchema);

/** api/legend/save の POST ボディ */
export const schemaLegendSaveBody = z.object({ content: z.string().max(LEGEND_MAX_LENGTH) });

/** api/editor/setting の POST ボディ */
export const schemaEditorSettingBody = z.object({ selectedSlotNumber: slotNumberSchema.nullable() });

/** api/user/email の POST ボディ */
export const schemaUserEmailBody = z.object({ email: emailSchema });

/** api/password-reset/request の POST ボディ */
export const schemaPasswordResetRequestBody = z.object({ email: emailSchema });

/** api/admin/approve-user の POST ボディ */
export const schemaAdminApproveUserBody = z.object({ userId: z.string().min(1), approve: z.boolean() });

/** api/admin/approve-reset の POST ボディ */
export const schemaAdminApproveResetBody = z.object({ requestId: z.string().min(1), approve: z.boolean() });

// -----------------------------------------------------------------------------
// フォーム検証 (クライアント側)
// -----------------------------------------------------------------------------

/** ログインフォーム */
export const schemaLoginForm = z.object({
  identifier: z.string().trim().min(1, "ログインIDまたはメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

/** 新規登録フォーム */
export const schemaRegisterForm = z
  .object({
    username: z
      .string()
      .min(AUTH_USERNAME_MIN_LENGTH, `${AUTH_USERNAME_MIN_LENGTH}文字以上で入力してください`)
      .max(AUTH_USERNAME_MAX_LENGTH, `${AUTH_USERNAME_MAX_LENGTH}文字以内で入力してください`)
      .regex(/^[a-zA-Z0-9_.]+$/, "半角英数字・アンダースコア・ドットのみ使用できます"),
    email: emailSchema,
    password: schemaPassword,
    passwordConfirm: z.string().min(1, "確認のため、もう一度パスワードを入力してください"),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    message: "パスワードが一致しません",
    path: ["passwordConfirm"],
  });

/** PWリセット申請フォーム */
export const schemaForgotPasswordForm = z.object({ email: emailSchema });

/** PW再設定フォーム */
export const schemaResetPasswordForm = z
  .object({
    password: schemaPassword,
    passwordConfirm: z.string().min(1, "確認のため、もう一度パスワードを入力してください"),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    message: "パスワードが一致しません",
    path: ["passwordConfirm"],
  });

/** メールアドレス変更フォーム */
export const schemaEmailChangeForm = z.object({ email: emailSchema });

/** パスワード変更フォーム */
export const schemaPasswordChangeForm = z
  .object({
    currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
    password: schemaPassword,
    passwordConfirm: z.string().min(1, "確認のため、もう一度パスワードを入力してください"),
  })
  .refine((value) => !(value.password === value.currentPassword), {
    message: "現在のパスワードとは異なるパスワードを入力してください",
    path: ["password"],
  })
  .refine((value) => value.password === value.passwordConfirm, {
    message: "パスワードが一致しません",
    path: ["passwordConfirm"],
  });

/** スケジュールメモ入力フォーム */
export const schemaMemoForm = z.object({
  dateKey: dateKeySchema,
  content: memoContentSchema.refine((value) => arraySplitLines(value).length > 0, "メモを入力してください"),
});

/**
 * 新規登録できる日付の上限を加えたスケジュールメモ入力フォームを生成する
 * @param maxDateKey 登録可能な最終日 ("" は上限なし。入力済みメモの編集時)
 * @returns スケジュールメモ入力フォームのスキーマ
 */
export const schemaBuildMemoForm = (maxDateKey: DateKey) =>
  schemaMemoForm.refine((value) => maxDateKey === "" || value.dateKey <= maxDateKey, {
    message: `新規のメモは${SCHEDULE_MEMO_FUTURE_MONTH_COUNT}か月先の月末 (${dateFormatBadgeLabel(maxDateKey)}) までの日付で登録してください`,
    path: ["dateKey"],
  });

/** 凡例テキスト編集フォーム */
export const schemaLegendForm = z.object({
  content: z.string().max(LEGEND_MAX_LENGTH, `${LEGEND_MAX_LENGTH}文字以内で入力してください`),
});
