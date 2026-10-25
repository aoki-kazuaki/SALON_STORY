import { NextResponse } from "next/server";

import { apiBadRequestResponse, apiParseJsonBody } from "@/lib/api/server";
import { mailNotifyPasswordResetRequest } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { schemaPasswordResetRequestBody } from "@/lib/schemas";
import type { ResPostPasswordResetRequest } from "@/types/api/password-reset/request";

/** アカウントの有無に関わらず返却する受付メッセージ */
const ACCEPTED_MESSAGE = "申請を受け付けました。管理者の承認後、登録メールアドレスに再設定URLをお送りします。";

/** PWリセットを申請する (未ログインで利用、管理者へ通知) */
export async function POST(request: Request) {
  const body = await apiParseJsonBody(request, schemaPasswordResetRequestBody);
  if (!body) return apiBadRequestResponse();

  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() }, select: { id: true } });
  if (!user) return NextResponse.json<ResPostPasswordResetRequest>({ message: ACCEPTED_MESSAGE });

  const pending = await prisma.passwordResetRequest.findFirst({ where: { userId: user.id, status: "PENDING" } });
  if (pending) return NextResponse.json<ResPostPasswordResetRequest>({ message: ACCEPTED_MESSAGE });

  await prisma.passwordResetRequest.create({ data: { userId: user.id } });
  await mailNotifyPasswordResetRequest(body.email);
  return NextResponse.json<ResPostPasswordResetRequest>({ message: ACCEPTED_MESSAGE });
}
