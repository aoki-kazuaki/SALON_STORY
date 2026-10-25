import { NextResponse } from "next/server";

import {
  apiBadRequestResponse,
  apiForbiddenResponse,
  apiGetSessionUser,
  apiParseJsonBody,
  apiUnauthorizedResponse,
} from "@/lib/api/server";
import { mailNotifyApproved } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { schemaAdminApproveUserBody } from "@/lib/schemas";
import type { ResPostAdminApproveUser } from "@/types/api/admin/approve-user";

/** 新規登録ユーザーを承認 (本人へ通知)・却下する (管理者のみ) */
export async function POST(request: Request) {
  const user = await apiGetSessionUser();
  if (!user) return apiUnauthorizedResponse();
  if (!(user.role === "ADMIN")) return apiForbiddenResponse();

  const body = await apiParseJsonBody(request, schemaAdminApproveUserBody);
  if (!body) return apiBadRequestResponse();

  if (!body.approve) {
    await prisma.user.update({ where: { id: body.userId }, data: { approvalStatus: "REJECTED" } });
    return NextResponse.json<ResPostAdminApproveUser>({ userId: body.userId });
  }

  const approved = await prisma.user.update({ where: { id: body.userId }, data: { approvalStatus: "APPROVED" } });
  await mailNotifyApproved(approved.email);
  return NextResponse.json<ResPostAdminApproveUser>({ userId: body.userId });
}
