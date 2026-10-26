"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import CButton from "@/components/atoms/CButton";
import CInput from "@/components/atoms/CInput";
import CFormField from "@/components/molecules/CFormField";
import CPasswordInput from "@/components/molecules/CPasswordInput";
import { AUTH_ERROR_CODE_APPROVAL_PENDING, AUTH_MESSAGES_BY_CODE, AUTH_PASSWORD_RULE_TEXT } from "@/constants/auth";
import { authClient } from "@/lib/authClient";
import { authCall, authErrorMessage } from "@/lib/authError";
import { schemaRegisterForm } from "@/lib/schemas";

/** 新規登録フォームの値 */
type RegisterFormValues = z.infer<typeof schemaRegisterForm>;

/** 新規登録で重複時に表示するメッセージ (メールアドレスはパスワードリセットへ誘導する) */
const EMAIL_TAKEN_MESSAGE =
  "このメールアドレスは既に登録されています。パスワードをお忘れの場合はログイン画面からリセットを申請してください";

/** エラーを表示する入力欄ごとの、BetterAuth のエラーコード別文言 (該当しないコードはフォーム下部に表示) */
const SIGN_UP_FIELD_ERRORS: Record<string, { field: keyof RegisterFormValues; message: string }> = {
  USERNAME_IS_ALREADY_TAKEN: { field: "username", message: AUTH_MESSAGES_BY_CODE.USERNAME_IS_ALREADY_TAKEN },
  USERNAME_TOO_SHORT: { field: "username", message: AUTH_MESSAGES_BY_CODE.USERNAME_TOO_SHORT },
  USERNAME_TOO_LONG: { field: "username", message: AUTH_MESSAGES_BY_CODE.USERNAME_TOO_LONG },
  INVALID_USERNAME: { field: "username", message: AUTH_MESSAGES_BY_CODE.INVALID_USERNAME },
  USER_ALREADY_EXISTS: { field: "email", message: EMAIL_TAKEN_MESSAGE },
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: { field: "email", message: EMAIL_TAKEN_MESSAGE },
  INVALID_EMAIL: { field: "email", message: AUTH_MESSAGES_BY_CODE.INVALID_EMAIL },
  WEAK_PASSWORD: { field: "password", message: AUTH_MESSAGES_BY_CODE.WEAK_PASSWORD },
  PASSWORD_TOO_SHORT: { field: "password", message: AUTH_MESSAGES_BY_CODE.PASSWORD_TOO_SHORT },
  PASSWORD_TOO_LONG: { field: "password", message: AUTH_MESSAGES_BY_CODE.PASSWORD_TOO_LONG },
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
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schemaRegisterForm),
    defaultValues: { username: "", email: "", password: "", passwordConfirm: "" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitError("");
    const signUpError = await authCall(() =>
      authClient.signUp.email({
        name: values.username,
        username: values.username,
        email: values.email,
        password: values.password,
      }),
    );
    const fieldError = SIGN_UP_FIELD_ERRORS[signUpError?.code ?? ""] ?? null;
    if (fieldError) {
      setError(fieldError.field, { message: fieldError.message }, { shouldFocus: true });
      return;
    }
    if (signUpError) {
      setSubmitError(authErrorMessage(signUpError, "登録に失敗しました。入力内容をご確認のうえ、再度お試しください"));
      return;
    }

    const signInError = await authCall(() =>
      authClient.signIn.username({ username: values.username, password: values.password }),
    );
    if (signInError?.code === AUTH_ERROR_CODE_APPROVAL_PENDING) {
      router.replace("/register/pending");
      return;
    }
    // 登録自体は完了しているため、再送信 (= ID重複エラー) させずにログイン画面へ案内する
    if (signInError) {
      router.replace("/login?registered=1");
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
      <CFormField
        htmlFor="register-password"
        label="パスワード"
        error={errors.password?.message ?? ""}
        hint={AUTH_PASSWORD_RULE_TEXT}
      >
        <CPasswordInput id="register-password" autoComplete="new-password" {...register("password")} />
      </CFormField>
      <CFormField
        htmlFor="register-password-confirm"
        label="パスワード (確認)"
        error={errors.passwordConfirm?.message ?? ""}
      >
        <CPasswordInput id="register-password-confirm" autoComplete="new-password" {...register("passwordConfirm")} />
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
