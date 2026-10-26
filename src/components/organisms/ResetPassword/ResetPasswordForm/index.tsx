"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import CButton from "@/components/atoms/CButton";
import CInput from "@/components/atoms/CInput";
import CFormField from "@/components/molecules/CFormField";
import CPasswordInput from "@/components/molecules/CPasswordInput";
import { AUTH_PASSWORD_RULE_TEXT } from "@/constants/auth";
import { apiGet } from "@/lib/api/client";
import { authClient } from "@/lib/authClient";
import { authCall, authErrorMessage } from "@/lib/authError";
import { schemaResetPasswordForm } from "@/lib/schemas";
import type { ResGetPasswordResetDetail } from "@/types/api/password-reset/detail";

/** PW再設定フォームの値 */
type ResetPasswordFormValues = z.infer<typeof schemaResetPasswordForm>;

/** ResetPasswordForm の Props */
type Props = {
  /** URL に含まれるリセットトークン */
  token: string;
};

/** トークン確認状態 (checking: 確認中 / valid: 有効 / invalid: 無効・期限切れ / error: 確認自体に失敗 / done: 再設定完了) */
type TokenStatus = "checking" | "valid" | "invalid" | "error" | "done";

/** PW再設定フォーム (メールアドレスは非活性表示、新パスワードを2回入力) */
const ResetPasswordForm = ({ token }: Props) => {
  const [status, setStatus] = useState<TokenStatus>("checking");
  const [email, setEmail] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schemaResetPasswordForm),
    defaultValues: { password: "", passwordConfirm: "" },
  });

  useEffect(() => {
    const verifyToken = async () => {
      const result = await apiGet<ResGetPasswordResetDetail>("/api/password-reset/detail", { token });
      // 通信・サーバーエラーを「URLが無効」と表示すると再申請させてしまうため、別の表示にする
      if (!result.ok) {
        setVerifyError(result.error.message);
        setStatus("error");
        return;
      }
      if (!result.data.isValid) {
        setStatus("invalid");
        return;
      }
      setEmail(result.data.email);
      setStatus("valid");
    };
    verifyToken();
  }, [token]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setSubmitError("");
    const error = await authCall(() => authClient.resetPassword({ newPassword: values.password, token }));
    if (error) {
      setSubmitError(authErrorMessage(error, "再設定に失敗しました。時間をおいて再度お試しください"));
      return;
    }
    setStatus("done");
  };

  /** 送信エラーを表示するかどうかの判定フラグ */
  const hasSubmitError: boolean = !(submitError === "");

  if (status === "checking") return <p className="text-muted-foreground text-sm">URLを確認しています…</p>;
  if (status === "invalid") {
    return (
      <p className="text-destructive text-sm">
        URLが無効、または有効期限が切れています。お手数ですが再度リセットを申請してください。
      </p>
    );
  }
  if (status === "error") {
    return (
      <div className="grid gap-4">
        <p role="alert" className="text-destructive text-sm">
          {verifyError}
        </p>
        <CButton size="lg" variant="outline" onClick={() => window.location.reload()}>
          再読み込み
        </CButton>
      </div>
    );
  }
  if (status === "done") {
    return (
      <div className="grid gap-4">
        <p className="rounded-md bg-emerald-50 px-3 py-3 text-sm text-emerald-800">パスワードを再設定しました。</p>
        <CButton asChild size="lg">
          <Link href="/login">ログイン画面へ</Link>
        </CButton>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <CFormField htmlFor="reset-email" label="メールアドレス">
        <CInput id="reset-email" type="email" value={email} disabled readOnly />
      </CFormField>
      <CFormField
        htmlFor="reset-password"
        label="新しいパスワード"
        error={errors.password?.message ?? ""}
        hint={AUTH_PASSWORD_RULE_TEXT}
      >
        <CPasswordInput id="reset-password" autoComplete="new-password" {...register("password")} />
      </CFormField>
      <CFormField
        htmlFor="reset-password-confirm"
        label="新しいパスワード (確認)"
        error={errors.passwordConfirm?.message ?? ""}
      >
        <CPasswordInput id="reset-password-confirm" autoComplete="new-password" {...register("passwordConfirm")} />
      </CFormField>
      {hasSubmitError && (
        <p role="alert" className="text-destructive text-sm">
          {submitError}
        </p>
      )}
      <CButton type="submit" size="lg" disabled={isSubmitting}>
        パスワードを再設定する
      </CButton>
    </form>
  );
};

export default ResetPasswordForm;
