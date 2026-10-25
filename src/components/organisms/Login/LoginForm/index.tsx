"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import CButton from "@/components/atoms/CButton";
import CInput from "@/components/atoms/CInput";
import CFormField from "@/components/molecules/CFormField";
import { AUTH_ERROR_CODE_APPROVAL_PENDING } from "@/constants/auth";
import { authClient } from "@/lib/authClient";
import { schemaLoginForm } from "@/lib/schemas";

/** ログインフォームの値 */
type LoginFormValues = z.infer<typeof schemaLoginForm>;

/** LoginForm の Props */
type Props = {
  /** ログイン後の遷移先 (ダッシュボード配下のみ有効) */
  redirectPath: string;
};

/** ログイン後の既定の遷移先 */
const DEFAULT_REDIRECT_PATH = "/dashboard";

/** ID / パスワードによるログインフォーム */
const LoginForm = ({ redirectPath }: Props) => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schemaLoginForm),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError("");
    const { error } = await authClient.signIn.username(values);
    if (error?.code === AUTH_ERROR_CODE_APPROVAL_PENDING) {
      router.push("/register/pending");
      return;
    }
    if (error) {
      setSubmitError("ログインIDまたはパスワードが正しくありません");
      return;
    }
    /** 遷移先がダッシュボード配下 (オープンリダイレクト対策) かどうかの判定フラグ */
    const isSafeRedirect: boolean = redirectPath.startsWith(DEFAULT_REDIRECT_PATH);
    if (!isSafeRedirect) {
      router.replace(DEFAULT_REDIRECT_PATH);
      return;
    }
    router.replace(redirectPath);
  };

  /** 送信エラーを表示するかどうかの判定フラグ */
  const hasSubmitError: boolean = !(submitError === "");

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <CFormField htmlFor="login-username" label="ログインID" error={errors.username?.message ?? ""}>
        <CInput id="login-username" autoComplete="username" {...register("username")} />
      </CFormField>
      <CFormField htmlFor="login-password" label="パスワード" error={errors.password?.message ?? ""}>
        <CInput id="login-password" type="password" autoComplete="current-password" {...register("password")} />
      </CFormField>
      {hasSubmitError && (
        <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {submitError}
        </p>
      )}
      <CButton type="submit" size="lg" disabled={isSubmitting}>
        ログイン
      </CButton>
    </form>
  );
};

export default LoginForm;
