import { NextResponse } from "next/server";

import { mapperDateKeyToDbDate, mapperScheduleMemo } from "@/lib/api/mapper";
import { apiBadRequestResponse, apiGetSessionUser, apiParseJsonBody, apiUnauthorizedResponse } from "@/lib/api/server";
import { prisma } from "@/lib/prisma";
import { schemaScheduleSaveBody } from "@/lib/schemas";
import type { ResPostScheduleSave, ResPostScheduleSaveConflict } from "@/types/api/schedule/save";
import { arraySplitLines } from "@/utils/array";

/** スケジュールメモを新規登録・上書きする (overwrite=false で入力済みの場合は 409) */
export async function POST(request: Request) {
  const user = await apiGetSessionUser();
  if (!user) return apiUnauthorizedResponse();

  const body = await apiParseJsonBody(request, schemaScheduleSaveBody);
  if (!body) return apiBadRequestResponse();

  // 空行・各行の前後の空白を除去した形で保存する
  const content = arraySplitLines(body.content).join("\n");
  const where = { userId_date: { userId: user.id, date: mapperDateKeyToDbDate(body.dateKey) } };
  const existing = await prisma.scheduleMemo.findUnique({ where });

  /** 入力済み (本文が空でない) の既存メモがあるかどうか */
  const hasFilledMemo: boolean = Boolean(existing) && !(existing?.content === "");
  if (hasFilledMemo && !body.overwrite && existing) {
    return NextResponse.json<ResPostScheduleSaveConflict>(
      {
        code: "CONFLICT",
        message: "この日付には既にメモが登録されています",
        existingMemo: mapperScheduleMemo(existing),
      },
      { status: 409 },
    );
  }

  const saved = await prisma.scheduleMemo.upsert({
    where,
    create: { userId: user.id, date: mapperDateKeyToDbDate(body.dateKey), content },
    update: { content },
  });
  return NextResponse.json<ResPostScheduleSave>({ memo: mapperScheduleMemo(saved), isCreated: !hasFilledMemo });
}
