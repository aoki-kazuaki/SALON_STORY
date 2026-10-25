import { NextResponse } from "next/server";

import { apiForbiddenResponse, apiGetSessionUser, apiUnauthorizedResponse } from "@/lib/api/server";
import { isSmtpEnabled, mailListOutbox } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import type { ResGetAdminPending } from "@/types/api/admin/pending";

/** 承認待ちの新規登録ユーザー・PWリセット申請と、ローカル送信箱を取得する (管理者のみ) */
export async function GET() {
  const user = await apiGetSessionUser();
  if (!user) return apiUnauthorizedResponse();
  if (!(user.role === "ADMIN")) return apiForbiddenResponse();

  const [users, resets] = await Promise.all([
    prisma.user.findMany({ where: { approvalStatus: "PENDING" }, orderBy: { createdAt: "asc" } }),
    prisma.passwordResetRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { username: true, email: true } } },
    }),
  ]);

  return NextResponse.json<ResGetAdminPending>({
    users: users.map((row) => ({
      id: row.id,
      username: row.username ?? "",
      email: row.email,
      createdAt: row.createdAt.toISOString(),
    })),
    passwordResets: resets.map((row) => ({
      id: row.id,
      username: row.user.username ?? "",
      email: row.user.email,
      createdAt: row.createdAt.toISOString(),
    })),
    isOutboxEnabled: !isSmtpEnabled,
    outbox: mailListOutbox(),
  });
}
