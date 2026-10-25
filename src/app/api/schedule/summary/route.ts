import { NextResponse } from "next/server";

import { mapperDbDateToDateKey } from "@/lib/api/mapper";
import { apiGetSessionUser, apiUnauthorizedResponse } from "@/lib/api/server";
import { prisma } from "@/lib/prisma";
import type { ResGetScheduleSummary } from "@/types/api/schedule/summary";
import { arrayBuildScheduleYearSummaries } from "@/utils/array";

/** データ (本文が空でないメモ) が存在する年・月の一覧を取得する */
export async function GET() {
  const user = await apiGetSessionUser();
  if (!user) return apiUnauthorizedResponse();

  const rows = await prisma.scheduleMemo.findMany({
    where: { userId: user.id, NOT: { content: "" } },
    select: { date: true },
  });
  const dateKeys = rows.map((row) => mapperDbDateToDateKey(row.date));
  return NextResponse.json<ResGetScheduleSummary>({ years: arrayBuildScheduleYearSummaries(dateKeys) });
}
