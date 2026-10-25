"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import CButton from "@/components/atoms/CButton";
import CInput from "@/components/atoms/CInput";
import CFormField from "@/components/molecules/CFormField";
import { apiPost } from "@/lib/api/client";
import { schemaForgotPasswordForm } from "@/lib/schemas";
import type { ResPostPasswordResetRequest } from "@/types/api/password-reset/request";

/** PWリセット申請フォームの値 */
type ForgotPasswordFormValues = z.infer<typeof schemaForgotPasswordForm>;

/** PWリセット申請フォーム (管理者承認後に再設定URLがメールで届く) */
const ForgotPasswordForm = () => {
  const [acceptedMessage, setAcceptedMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schemaForgotPasswordForm),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setSubmitError("");
    const result = await apiPost<ResPostPasswordResetRequest>("/api/password-reset/request", values);
    if (!result.ok) {
      setSubmitError(result.error.message);
      return;
    }
    setAcceptedMessage(result.data.message);
  };

  /** 申請を受け付けたかどうかの判定フラグ */
  const isAccepted: boolean = !(acceptedMessage === "");
  /** 送信エラーを表示するかどうかの判定フラグ */
  const hasSubmitError: boolean = !(submitError === "");

  if (isAccepted) {
    return <p className="rounded-md bg-emerald-50 px-3 py-3 text-sm text-emerald-800">{acceptedMessage}</p>;
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <CFormField htmlFor="forgot-email" label="登録済みのメールアドレス" error={errors.email?.message ?? ""}>
        <CInput id="forgot-email" type="email" autoComplete="email" {...register("email")} />
      </CFormField>
      {hasSubmitError && (
        <p role="alert" className="text-destructive text-sm">
          {submitError}
        </p>
      )}
      <CButton type="submit" size="lg" disabled={isSubmitting}>
        リセットを申請する
      </CButton>
    </form>
  );
};

export default ForgotPasswordForm;
