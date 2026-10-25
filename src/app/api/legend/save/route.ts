import { NextResponse } from "next/server";

import { apiBadRequestResponse, apiGetSessionUser, apiParseJsonBody, apiUnauthorizedResponse } from "@/lib/api/server";
import { prisma } from "@/lib/prisma";
import { schemaLegendSaveBody } from "@/lib/schemas";
import type { ResPostLegendSave } from "@/types/api/legend/save";

/** 凡例テキストを保存する */
export async function POST(request: Request) {
  const user = await apiGetSessionUser();
  if (!user) return apiUnauthorizedResponse();

  const body = await apiParseJsonBody(request, schemaLegendSaveBody);
  if (!body) return apiBadRequestResponse();

  const saved = await prisma.legendText.upsert({
    where: { userId: user.id },
    create: { userId: user.id, content: body.content },
    update: { content: body.content },
  });
  return NextResponse.json<ResPostLegendSave>({
    legend: { content: saved.content, updatedAt: saved.updatedAt.toISOString() },
  });
}
