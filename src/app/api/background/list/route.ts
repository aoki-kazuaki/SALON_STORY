import { NextResponse } from "next/server";

import { BACKGROUND_SLOT_NUMBERS } from "@/constants/app";
import { mapperBackgroundSlot } from "@/lib/api/mapper";
import { apiGetSessionUser, apiUnauthorizedResponse } from "@/lib/api/server";
import { prisma } from "@/lib/prisma";
import type { ResGetBackgroundList } from "@/types/api/background/list";

/** 登録済みの背景画像スロットを、表示用署名付きURL付きで取得する */
export async function GET() {
  const user = await apiGetSessionUser();
  if (!user) return apiUnauthorizedResponse();

  // スロット数の上限を減らした場合に、上限を超える旧スロットのデータは返さない (選択中だった場合はスロット1へフォールバック)
  const rows = await prisma.backgroundSlot.findMany({
    where: { userId: user.id, slotNumber: { lte: BACKGROUND_SLOT_NUMBERS.length } },
    orderBy: { slotNumber: "asc" },
  });
  const slots = await Promise.all(rows.map(mapperBackgroundSlot));
  return NextResponse.json<ResGetBackgroundList>({ slots });
}
