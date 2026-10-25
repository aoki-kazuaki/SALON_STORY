import { NextResponse } from "next/server";

import { apiGetSessionUser, apiUnauthorizedResponse } from "@/lib/api/server";
import { prisma } from "@/lib/prisma";
import type { ResGetLegendDetail } from "@/types/api/legend/detail";

/** 凡例テキストを取得する (未保存の場合は空文字) */
export async function GET() {
  const user = await apiGetSessionUser();
  if (!user) return apiUnauthorizedResponse();

  const row = await prisma.legendText.findUnique({ where: { userId: user.id } });
  if (!row) return NextResponse.json<ResGetLegendDetail>({ legend: { content: "", updatedAt: null } });
  return NextResponse.json<ResGetLegendDetail>({
    legend: { content: row.content, updatedAt: row.updatedAt.toISOString() },
  });
}
