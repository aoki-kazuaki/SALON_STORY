import { NextResponse } from "next/server";

import { apiBadRequestResponse, apiGetSessionUser, apiParseJsonBody, apiUnauthorizedResponse } from "@/lib/api/server";
import { prisma } from "@/lib/prisma";
import { schemaEditorSettingBody } from "@/lib/schemas";
import type { BackgroundSlotNumber } from "@/types";
import type { ResGetEditorSetting, ResPostEditorSetting } from "@/types/api/editor/setting";

/** 選択中の背景スロット番号を取得する */
export async function GET() {
  const user = await apiGetSessionUser();
  if (!user) return apiUnauthorizedResponse();

  const row = await prisma.editorSetting.findUnique({ where: { userId: user.id } });
  return NextResponse.json<ResGetEditorSetting>({
    selectedSlotNumber: (row?.selectedSlotNumber ?? null) as BackgroundSlotNumber | null,
  });
}

/** 選択中の背景スロット番号を保存する */
export async function POST(request: Request) {
  const user = await apiGetSessionUser();
  if (!user) return apiUnauthorizedResponse();

  const body = await apiParseJsonBody(request, schemaEditorSettingBody);
  if (!body) return apiBadRequestResponse();

  const saved = await prisma.editorSetting.upsert({
    where: { userId: user.id },
    create: { userId: user.id, selectedSlotNumber: body.selectedSlotNumber },
    update: { selectedSlotNumber: body.selectedSlotNumber },
  });
  return NextResponse.json<ResPostEditorSetting>({
    selectedSlotNumber: saved.selectedSlotNumber as BackgroundSlotNumber | null,
  });
}
