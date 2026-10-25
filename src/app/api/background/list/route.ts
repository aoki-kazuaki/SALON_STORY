import { NextResponse } from "next/server";

import { mapperBackgroundSlot } from "@/lib/api/mapper";
import { apiGetSessionUser, apiUnauthorizedResponse } from "@/lib/api/server";
import { prisma } from "@/lib/prisma";
import type { ResGetBackgroundList } from "@/types/api/background/list";

/** 登録済みの背景画像スロットを、表示用署名付きURL付きで取得する */
export async function GET() {
  const user = await apiGetSessionUser();
  if (!user) return apiUnauthorizedResponse();

  const rows = await prisma.backgroundSlot.findMany({ where: { userId: user.id }, orderBy: { slotNumber: "asc" } });
  const slots = await Promise.all(rows.map(mapperBackgroundSlot));
  return NextResponse.json<ResGetBackgroundList>({ slots });
}
