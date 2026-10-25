"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import CButton from "@/components/atoms/CButton";
import CInput from "@/components/atoms/CInput";
import CCard from "@/components/molecules/CCard";
import CConfirmDialog from "@/components/molecules/CConfirmDialog";
import CFormField from "@/components/molecules/CFormField";
import { authClient } from "@/lib/authClient";
import { schemaPasswordChangeForm } from "@/lib/schemas";

/** パスワード変更フォームの値 */
type PasswordChangeFormValues = z.infer<typeof schemaPasswordChangeForm>;

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
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(schemaPasswordChangeForm),
    defaultValues: { currentPassword: "", password: "", passwordConfirm: "" },
  });

  const handleConfirm = async () => {
    if (!pendingValues) return;
    const values = pendingValues;
    setPendingValues(null);
    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.password,
      revokeOtherSessions: true,
    });
    if (error) {
      toast.error("現在のパスワードが正しくありません");
      return;
    }
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
          <CInput
            id="settings-current-password"
            type="password"
            autoComplete="current-password"
            {...register("currentPassword")}
          />
        </CFormField>
        <CFormField htmlFor="settings-password" label="新しいパスワード" error={errors.password?.message ?? ""}>
          <CInput id="settings-password" type="password" autoComplete="new-password" {...register("password")} />
        </CFormField>
        <CFormField
          htmlFor="settings-password-confirm"
          label="新しいパスワード (確認)"
          error={errors.passwordConfirm?.message ?? ""}
        >
          <CInput
            id="settings-password-confirm"
            type="password"
            autoComplete="new-password"
            {...register("passwordConfirm")}
          />
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
