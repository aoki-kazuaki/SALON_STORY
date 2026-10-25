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
import { schemaRegisterForm } from "@/lib/schemas";

/** 新規登録フォームの値 */
type RegisterFormValues = z.infer<typeof schemaRegisterForm>;

/** BetterAuth のエラーコードごとの表示メッセージ */
const SIGN_UP_ERROR_MESSAGES: Record<string, string> = {
  USERNAME_IS_ALREADY_TAKEN: "このログインIDは既に使用されています",
  USER_ALREADY_EXISTS: "このメールアドレスは既に登録されています",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "このメールアドレスは既に登録されています",
};

/**
 * 新規登録フォーム
 * - 登録後にそのままログインを試み、承認待ちの場合は承認待ち画面へ遷移
 * - ローカル環境 (AUTH_SKIP_APPROVAL="true") では自動承認されるため、そのままダッシュボードへ遷移
 */
const RegisterForm = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schemaRegisterForm),
    defaultValues: { username: "", email: "", password: "", passwordConfirm: "" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitError("");
    const { error: signUpError } = await authClient.signUp.email({
      name: values.username,
      username: values.username,
      email: values.email,
      password: values.password,
    });
    if (signUpError) {
      setSubmitError(SIGN_UP_ERROR_MESSAGES[signUpError.code ?? ""] ?? "登録に失敗しました。入力内容をご確認ください");
      return;
    }

    const { error: signInError } = await authClient.signIn.username({
      username: values.username,
      password: values.password,
    });
    if (signInError?.code === AUTH_ERROR_CODE_APPROVAL_PENDING) {
      router.replace("/register/pending");
      return;
    }
    if (signInError) {
      router.replace("/login");
      return;
    }
    router.replace("/dashboard");
  };

  /** 送信エラーを表示するかどうかの判定フラグ */
  const hasSubmitError: boolean = !(submitError === "");

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <CFormField
        htmlFor="register-username"
        label="ログインID"
        error={errors.username?.message ?? ""}
        hint="半角英数字・アンダースコア・ドット (3文字以上)"
      >
        <CInput id="register-username" autoComplete="username" {...register("username")} />
      </CFormField>
      <CFormField
        htmlFor="register-email"
        label="メールアドレス"
        error={errors.email?.message ?? ""}
        hint="承認通知やパスワード再設定URLの送付先になります"
      >
        <CInput id="register-email" type="email" autoComplete="email" {...register("email")} />
      </CFormField>
      <CFormField htmlFor="register-password" label="パスワード" error={errors.password?.message ?? ""}>
        <CInput id="register-password" type="password" autoComplete="new-password" {...register("password")} />
      </CFormField>
      <CFormField
        htmlFor="register-password-confirm"
        label="パスワード (確認)"
        error={errors.passwordConfirm?.message ?? ""}
      >
        <CInput
          id="register-password-confirm"
          type="password"
          autoComplete="new-password"
          {...register("passwordConfirm")}
        />
      </CFormField>
      {hasSubmitError && (
        <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {submitError}
        </p>
      )}
      <CButton type="submit" size="lg" disabled={isSubmitting}>
        登録する
      </CButton>
    </form>
  );
};

export default RegisterForm;
