import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import type { ResGetPasswordResetDetail } from "@/types/api/password-reset/detail";

/** 無効トークン時のレスポンス */
const INVALID_RESPONSE: ResGetPasswordResetDetail = { email: "", isValid: false };

/** PWリセットトークンに紐づくメールアドレスを取得する (BetterAuth の verification テーブルを参照) */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (token === "") return NextResponse.json<ResGetPasswordResetDetail>(INVALID_RESPONSE);

  const verification = await prisma.verification.findFirst({ where: { identifier: `reset-password:${token}` } });
  if (!verification) return NextResponse.json<ResGetPasswordResetDetail>(INVALID_RESPONSE);
  if (verification.expiresAt < new Date()) return NextResponse.json<ResGetPasswordResetDetail>(INVALID_RESPONSE);

  const user = await prisma.user.findUnique({ where: { id: verification.value }, select: { email: true } });
  if (!user) return NextResponse.json<ResGetPasswordResetDetail>(INVALID_RESPONSE);
  return NextResponse.json<ResGetPasswordResetDetail>({ email: user.email, isValid: true });
}
