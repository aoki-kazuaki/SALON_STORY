import { NextResponse, type NextRequest } from "next/server";

import { mapperDateKeyToDbDate, mapperScheduleMemo } from "@/lib/api/mapper";
import { apiBadRequestResponse, apiGetSessionUser, apiUnauthorizedResponse } from "@/lib/api/server";
import { prisma } from "@/lib/prisma";
import { schemaScheduleListParams } from "@/lib/schemas";
import type { ResGetScheduleList } from "@/types/api/schedule/list";

/** 期間内の入力済みメモ (本文が空でないもの) を日付昇順で取得する */
export async function GET(request: NextRequest) {
  const user = await apiGetSessionUser();
  if (!user) return apiUnauthorizedResponse();

  const params = schemaScheduleListParams.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!params.success) return apiBadRequestResponse();

  const rows = await prisma.scheduleMemo.findMany({
    where: {
      userId: user.id,
      NOT: { content: "" },
      date: { gte: mapperDateKeyToDbDate(params.data.startDate), lte: mapperDateKeyToDbDate(params.data.endDate) },
    },
    orderBy: { date: "asc" },
  });
  return NextResponse.json<ResGetScheduleList>({ memos: rows.map(mapperScheduleMemo) });
}
