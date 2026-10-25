import { NextResponse } from "next/server";

import {
  apiBadRequestResponse,
  apiForbiddenResponse,
  apiGetSessionUser,
  apiParseJsonBody,
  apiUnauthorizedResponse,
} from "@/lib/api/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { schemaAdminApproveResetBody } from "@/lib/schemas";
import type { ResPostAdminApproveReset } from "@/types/api/admin/approve-reset";

/** PWリセット申請を承認 (BetterAuth でトークン発行 → 再設定URLをメール送付)・却下する (管理者のみ) */
export async function POST(request: Request) {
  const user = await apiGetSessionUser();
  if (!user) return apiUnauthorizedResponse();
  if (!(user.role === "ADMIN")) return apiForbiddenResponse();

  const body = await apiParseJsonBody(request, schemaAdminApproveResetBody);
  if (!body) return apiBadRequestResponse();

  if (!body.approve) {
    await prisma.passwordResetRequest.update({ where: { id: body.requestId }, data: { status: "REJECTED" } });
    return NextResponse.json<ResPostAdminApproveReset>({ requestId: body.requestId });
  }

  const resetRequest = await prisma.passwordResetRequest.update({
    where: { id: body.requestId },
    data: { status: "APPROVED", approvedAt: new Date() },
    include: { user: { select: { email: true } } },
  });
  await auth.api.requestPasswordReset({ body: { email: resetRequest.user.email, redirectTo: "/reset-password" } });
  return NextResponse.json<ResPostAdminApproveReset>({ requestId: body.requestId });
}
