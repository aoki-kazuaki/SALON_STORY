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
import { AUTH_ERROR_CODE_APPROVAL_PENDING, AUTH_MESSAGE_INVALID_CREDENTIALS } from "@/constants/auth";
import { authClient } from "@/lib/authClient";
import { authCall, authErrorMessage } from "@/lib/authError";
import { schemaLoginForm } from "@/lib/schemas";
import { boolIsEmailIdentifier } from "@/utils/boolean";

/** ログインフォームの値 */
type LoginFormValues = z.infer<typeof schemaLoginForm>;

/** LoginForm の Props */
type Props = {
  /** ログイン後の遷移先 (ダッシュボード配下のみ有効) */
  redirectPath: string;
};

/** ログイン後の既定の遷移先 */
const DEFAULT_REDIRECT_PATH = "/dashboard";

/**
 * ログイン固有のエラーコード別文言
 * - ID・メールアドレスの形式エラーも「一致しない」と同じ文言にし、アカウントの有無や入力形式の手がかりを与えない
 */
const LOGIN_MESSAGES_BY_CODE: Record<string, string> = {
  INVALID_USERNAME: AUTH_MESSAGE_INVALID_CREDENTIALS,
  USERNAME_TOO_SHORT: AUTH_MESSAGE_INVALID_CREDENTIALS,
  USERNAME_TOO_LONG: AUTH_MESSAGE_INVALID_CREDENTIALS,
  INVALID_EMAIL: AUTH_MESSAGE_INVALID_CREDENTIALS,
  PASSWORD_TOO_LONG: AUTH_MESSAGE_INVALID_CREDENTIALS,
};

/**
 * 入力値に応じてログイン方式を切り替える ("@" を含む場合はメールアドレス、それ以外はログインID)
 * - 承認待ちチェックはセッション作成フックで行うため、どちらの方式でも同じエラーコードが返る
 */
const signIn = ({ identifier, password }: LoginFormValues) => {
  if (boolIsEmailIdentifier(identifier)) return authClient.signIn.email({ email: identifier, password });
  return authClient.signIn.username({ username: identifier, password });
};

/** ログインID (またはメールアドレス) / パスワードによるログインフォーム */
const LoginForm = ({ redirectPath }: Props) => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schemaLoginForm),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError("");
    const error = await authCall(() => signIn(values));
    if (error?.code === AUTH_ERROR_CODE_APPROVAL_PENDING) {
      router.push("/register/pending");
      return;
    }
    if (error) {
      setSubmitError(authErrorMessage(error, AUTH_MESSAGE_INVALID_CREDENTIALS, LOGIN_MESSAGES_BY_CODE));
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
      <CFormField
        htmlFor="login-identifier"
        label="ログインID または メールアドレス"
        error={errors.identifier?.message ?? ""}
      >
        <CInput id="login-identifier" autoComplete="username" {...register("identifier")} />
      </CFormField>
      <CFormField htmlFor="login-password" label="パスワード" error={errors.password?.message ?? ""}>
        <CPasswordInput id="login-password" autoComplete="current-password" {...register("password")} />
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
