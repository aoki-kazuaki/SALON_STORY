import { NextResponse } from "next/server";

import { mapperDateKeyToDbDate, mapperScheduleMemo } from "@/lib/api/mapper";
import { apiBadRequestResponse, apiGetSessionUser, apiParseJsonBody, apiUnauthorizedResponse } from "@/lib/api/server";
import { prisma } from "@/lib/prisma";
import { schemaScheduleClearBody } from "@/lib/schemas";
import type { ResDeleteScheduleClear } from "@/types/api/schedule/clear";

/** スケジュールメモの本文を空文字で更新する */
export async function DELETE(request: Request) {
  const user = await apiGetSessionUser();
  if (!user) return apiUnauthorizedResponse();

  const body = await apiParseJsonBody(request, schemaScheduleClearBody);
  if (!body) return apiBadRequestResponse();

  const date = mapperDateKeyToDbDate(body.dateKey);
  const saved = await prisma.scheduleMemo.upsert({
    where: { userId_date: { userId: user.id, date } },
    create: { userId: user.id, date, content: "" },
    update: { content: "" },
  });
  return NextResponse.json<ResDeleteScheduleClear>({ memo: mapperScheduleMemo(saved) });
}
