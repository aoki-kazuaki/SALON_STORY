import { NextResponse } from "next/server";

import {
  apiBadRequestResponse,
  apiErrorResponse,
  apiGetSessionUser,
  apiParseJsonBody,
  apiUnauthorizedResponse,
} from "@/lib/api/server";
import { prisma } from "@/lib/prisma";
import { schemaUserEmailBody } from "@/lib/schemas";
import type { ResPostUserEmail } from "@/types/api/user/email";

/** ログインユーザーのメールアドレスを即時変更する */
export async function POST(request: Request) {
  const user = await apiGetSessionUser();
  if (!user) return apiUnauthorizedResponse();

  const body = await apiParseJsonBody(request, schemaUserEmailBody);
  if (!body) return apiBadRequestResponse();

  const email = body.email.toLowerCase();
  const duplicated = await prisma.user.findFirst({ where: { email, NOT: { id: user.id } }, select: { id: true } });
  if (duplicated)
    return apiErrorResponse(
      409,
      "EMAIL_TAKEN",
      "このメールアドレスは既に使用されています。別のメールアドレスを入力してください",
    );

  const saved = await prisma.user.update({ where: { id: user.id }, data: { email } });
  return NextResponse.json<ResPostUserEmail>({ email: saved.email });
}
