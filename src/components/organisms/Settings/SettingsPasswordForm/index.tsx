"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import CButton from "@/components/atoms/CButton";
import CCard from "@/components/molecules/CCard";
import CConfirmDialog from "@/components/molecules/CConfirmDialog";
import CFormField from "@/components/molecules/CFormField";
import CPasswordInput from "@/components/molecules/CPasswordInput";
import { AUTH_MESSAGES_BY_CODE, AUTH_PASSWORD_RULE_TEXT } from "@/constants/auth";
import { authClient } from "@/lib/authClient";
import { authCall, authErrorMessage } from "@/lib/authError";
import { schemaPasswordChangeForm } from "@/lib/schemas";

/** パスワード変更フォームの値 */
type PasswordChangeFormValues = z.infer<typeof schemaPasswordChangeForm>;

/** 入力欄に表示する、BetterAuth のエラーコード別文言 (該当しないコードはトーストで表示) */
const CHANGE_PASSWORD_FIELD_ERRORS: Record<string, { field: keyof PasswordChangeFormValues; message: string }> = {
  INVALID_PASSWORD: { field: "currentPassword", message: "現在のパスワードが正しくありません" },
  WEAK_PASSWORD: { field: "password", message: AUTH_MESSAGES_BY_CODE.WEAK_PASSWORD },
  PASSWORD_TOO_SHORT: { field: "password", message: AUTH_MESSAGES_BY_CODE.PASSWORD_TOO_SHORT },
  PASSWORD_TOO_LONG: { field: "password", message: AUTH_MESSAGES_BY_CODE.PASSWORD_TOO_LONG },
};

/** SettingsPasswordForm の Props */
type Props = {
  /** 変更完了時に呼ばれる */
  onSuccess: (message: string) => void;
};

/** パスワード変更フォーム (確認ダイアログを挟んで即時反映、他端末のセッションは無効化) */
const SettingsPasswordForm = ({ onSuccess }: Props) => {
  const [pendingValues, setPendingValues] = useState<PasswordChangeFormValues | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(schemaPasswordChangeForm),
    defaultValues: { currentPassword: "", password: "", passwordConfirm: "" },
  });

  const handleConfirm = async () => {
    if (!pendingValues) return;
    const values = pendingValues;
    setPendingValues(null);
    const error = await authCall(() =>
      authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.password,
        revokeOtherSessions: true,
      }),
    );
    const fieldError = CHANGE_PASSWORD_FIELD_ERRORS[error?.code ?? ""] ?? null;
    if (fieldError) {
      setError(fieldError.field, { message: fieldError.message }, { shouldFocus: true });
      return;
    }
    if (error) {
      toast.error(authErrorMessage(error, "パスワードの変更に失敗しました。時間をおいて再度お試しください"));
      return;
    }
    // 再度この画面を開いたときにパスワードが残らないよう空にする (Next.js の Activity 対策)
    reset();
    onSuccess("パスワードを変更しました");
  };

  /** 確認ダイアログを表示するかどうかの判定フラグ */
  const isConfirmOpen: boolean = Boolean(pendingValues);

  return (
    <CCard title="パスワードの変更" description="変更すると、他の端末ではログアウトされます。">
      <form className="grid gap-4" onSubmit={handleSubmit((values) => setPendingValues(values))}>
        <CFormField
          htmlFor="settings-current-password"
          label="現在のパスワード"
          error={errors.currentPassword?.message ?? ""}
        >
          <CPasswordInput
            id="settings-current-password"
            autoComplete="current-password"
            {...register("currentPassword")}
          />
        </CFormField>
        <CFormField
          htmlFor="settings-password"
          label="新しいパスワード"
          error={errors.password?.message ?? ""}
          hint={AUTH_PASSWORD_RULE_TEXT}
        >
          <CPasswordInput id="settings-password" autoComplete="new-password" {...register("password")} />
        </CFormField>
        <CFormField
          htmlFor="settings-password-confirm"
          label="新しいパスワード (確認)"
          error={errors.passwordConfirm?.message ?? ""}
        >
          <CPasswordInput id="settings-password-confirm" autoComplete="new-password" {...register("passwordConfirm")} />
        </CFormField>
        <CButton type="submit" className="justify-self-start" disabled={isSubmitting}>
          変更する
        </CButton>
      </form>
      <CConfirmDialog
        open={isConfirmOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPendingValues(null);
        }}
        title="パスワードを変更しますか？"
        description="他の端末でログイン中のセッションは無効になります。"
        confirmLabel="変更する"
        onConfirm={handleConfirm}
      />
    </CCard>
  );
};

export default SettingsPasswordForm;
