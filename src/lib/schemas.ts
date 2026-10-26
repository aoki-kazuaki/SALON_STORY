import dayjs from "dayjs";
import { z } from "zod";

import { AUTH_PASSWORD_MIN_LENGTH, AUTH_USERNAME_MIN_LENGTH } from "@/constants/auth";
import {
  BACKGROUND_SLOT_NUMBERS,
  LEGEND_MAX_LENGTH,
  SCHEDULE_MEMO_MAX_LENGTH,
  SCHEDULE_MEMO_MAX_LINE_LENGTH,
  SCHEDULE_MEMO_MAX_LINES,
} from "@/constants/app";
import { arraySplitLines } from "@/utils/array";

// -----------------------------------------------------------------------------
// 共通パーツ
// -----------------------------------------------------------------------------

/** "YYYY-MM-DD" 形式かつ実在する日付 */
const dateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日付を選択してください")
  .refine((value) => dayjs(value).format("YYYY-MM-DD") === value, "存在しない日付です");

/** 背景スロット番号 (1〜5) */
const slotNumberSchema = z.number().int().min(1).max(BACKGROUND_SLOT_NUMBERS.length);

/** スケジュールメモ本文 (空文字可、最大3行・1行15文字まで。空行・前後の空白は数えない) */
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

/** パスワード */
const passwordSchema = z
  .string()
  .min(AUTH_PASSWORD_MIN_LENGTH, `${AUTH_PASSWORD_MIN_LENGTH}文字以上で入力してください`);

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
  username: z.string().min(1, "ログインIDを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

/** 新規登録フォーム */
export const schemaRegisterForm = z
  .object({
    username: z
      .string()
      .min(AUTH_USERNAME_MIN_LENGTH, `${AUTH_USERNAME_MIN_LENGTH}文字以上で入力してください`)
      .regex(/^[a-zA-Z0-9_.]+$/, "半角英数字・アンダースコア・ドットのみ使用できます"),
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    message: "パスワードが一致しません",
    path: ["passwordConfirm"],
  });

/** PWリセット申請フォーム */
export const schemaForgotPasswordForm = z.object({ email: emailSchema });

/** PW再設定フォーム */
export const schemaResetPasswordForm = z
  .object({ password: passwordSchema, passwordConfirm: z.string() })
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
    password: passwordSchema,
    passwordConfirm: z.string(),
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

/** 凡例テキスト編集フォーム */
export const schemaLegendForm = z.object({
  content: z.string().max(LEGEND_MAX_LENGTH, `${LEGEND_MAX_LENGTH}文字以内で入力してください`),
});
