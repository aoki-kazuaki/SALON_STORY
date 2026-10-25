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
import { apiPost } from "@/lib/api/client";
import { schemaEmailChangeForm } from "@/lib/schemas";
import type { ResPostUserEmail } from "@/types/api/user/email";

/** メールアドレス変更フォームの値 */
type EmailChangeFormValues = z.infer<typeof schemaEmailChangeForm>;

/** SettingsEmailForm の Props */
type Props = {
  /** 現在のメールアドレス */
  currentEmail: string;
  /** 変更完了時に呼ばれる */
  onSuccess: (message: string) => void;
};

/** メールアドレス変更フォーム (確認ダイアログを挟んで即時反映) */
const SettingsEmailForm = ({ currentEmail, onSuccess }: Props) => {
  const [pendingValues, setPendingValues] = useState<EmailChangeFormValues | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailChangeFormValues>({ resolver: zodResolver(schemaEmailChangeForm), defaultValues: { email: "" } });

  const handleConfirm = async () => {
    if (!pendingValues) return;
    const values = pendingValues;
    setPendingValues(null);
    const result = await apiPost<ResPostUserEmail>("/api/user/email", values);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    onSuccess("メールアドレスを変更しました");
  };

  /** 確認ダイアログを表示するかどうかの判定フラグ */
  const isConfirmOpen: boolean = Boolean(pendingValues);

  return (
    <CCard title="メールアドレスの変更" description={`現在: ${currentEmail}`}>
      <form className="grid gap-4" onSubmit={handleSubmit((values) => setPendingValues(values))}>
        <CFormField htmlFor="settings-email" label="新しいメールアドレス" error={errors.email?.message ?? ""}>
          <CInput id="settings-email" type="email" autoComplete="email" {...register("email")} />
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
        title="メールアドレスを変更しますか？"
        description={`${currentEmail}\n↓\n${pendingValues?.email ?? ""}`}
        confirmLabel="変更する"
        onConfirm={handleConfirm}
      />
    </CCard>
  );
};

export default SettingsEmailForm;
