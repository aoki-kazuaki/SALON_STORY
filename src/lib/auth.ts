import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";

import {
  AUTH_ERROR_CODE_WEAK_PASSWORD,
  AUTH_PASSWORD_RULE_TEXT,
  AUTH_SESSION_EXPIRES_IN_SECONDS,
  AUTH_SESSION_UPDATE_AGE_SECONDS,
} from "@/constants/auth";
import { mailNotifyRegistration, mailSendPasswordResetUrl } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { schemaPassword } from "@/lib/schemas";
import type { ApprovalStatus, UserRole } from "@/types";

/** 新規登録時の管理者承認をスキップするか (ローカル開発専用) */
const isApprovalSkipped: boolean = process.env.AUTH_SKIP_APPROVAL === "true";

/** 新規ユーザーの初期権限と承認ステータス */
type InitialAccountStatus = { role: UserRole; approvalStatus: ApprovalStatus };

/**
 * 新規ユーザーの初期権限・承認ステータスを決定する
 * - 最初の1人目: 管理者として自動承認 (管理者が存在しないと誰も承認できないため)
 * - AUTH_SKIP_APPROVAL="true": 一般ユーザーとして自動承認
 * - それ以外: 一般ユーザーとして承認待ち
 */
const resolveInitialAccountStatus = async (): Promise<InitialAccountStatus> => {
  const userCount = await prisma.user.count();
  if (userCount === 0) return { role: "ADMIN", approvalStatus: "APPROVED" };
  if (isApprovalSkipped) return { role: "USER", approvalStatus: "APPROVED" };
  return { role: "USER", approvalStatus: "PENDING" };
};

/** 新しいパスワードを受け取る BetterAuth エンドポイントと、ボディ内のパスワード項目名の対応表 */
const PASSWORD_FIELD_BY_PATH: Record<string, string> = {
  "/sign-up/email": "password",
  "/reset-password": "newPassword",
  "/change-password": "newPassword",
};

/** 新しいパスワードがルール (英大文字・英小文字・数字を含む8文字以上) を満たさなければ 400 を返す */
const validatePasswordRule = createAuthMiddleware(async (ctx) => {
  const field = PASSWORD_FIELD_BY_PATH[ctx.path] ?? "";
  if (field === "") return;
  const body = (ctx.body ?? {}) as Record<string, unknown>;
  if (schemaPassword.safeParse(body[field]).success) return;
  throw new APIError("BAD_REQUEST", {
    message: `パスワードは${AUTH_PASSWORD_RULE_TEXT}で入力してください`,
    code: AUTH_ERROR_CODE_WEAK_PASSWORD,
  });
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, token }) => {
      await mailSendPasswordResetUrl(user.email, token);
    },
  },
  session: {
    expiresIn: AUTH_SESSION_EXPIRES_IN_SECONDS,
    updateAge: AUTH_SESSION_UPDATE_AGE_SECONDS,
  },
  user: {
    additionalFields: {
      role: { type: "string", input: false, defaultValue: "USER" },
      approvalStatus: { type: "string", input: false, defaultValue: "PENDING" },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const status = await resolveInitialAccountStatus();
          return { data: { ...user, ...status } };
        },
        after: async (user) => {
          if (user.approvalStatus === "APPROVED") return;
          await mailNotifyRegistration(String(user.username ?? ""), user.email);
        },
      },
    },
    session: {
      create: {
        // 承認済みユーザー以外はセッションを発行しない (= ログイン不可)
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { approvalStatus: true },
          });
          if (user?.approvalStatus === "APPROVED") return;
          throw new APIError("FORBIDDEN", { message: "管理者の承認待ちです", code: "APPROVAL_PENDING" });
        },
      },
    },
  },
  hooks: { before: validatePasswordRule },
  plugins: [username(), nextCookies()],
});
