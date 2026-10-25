import { NextResponse } from "next/server";

import { apiBadRequestResponse, apiGetSessionUser, apiParseJsonBody, apiUnauthorizedResponse } from "@/lib/api/server";
import { prisma } from "@/lib/prisma";
import { s3DeleteObject } from "@/lib/s3";
import { schemaBackgroundDeleteBody } from "@/lib/schemas";
import type { BackgroundSlotNumber } from "@/types";
import type { ResDeleteBackgroundDelete } from "@/types/api/background/delete";

/** 背景画像を S3 / MinIO から物理削除し、スロット登録を解除する */
export async function DELETE(request: Request) {
  const user = await apiGetSessionUser();
  if (!user) return apiUnauthorizedResponse();

  const body = await apiParseJsonBody(request, schemaBackgroundDeleteBody);
  if (!body) return apiBadRequestResponse();

  const where = { userId_slotNumber: { userId: user.id, slotNumber: body.slotNumber } };
  const existing = await prisma.backgroundSlot.findUnique({ where });
  if (existing) {
    await s3DeleteObject(existing.objectKey);
    await prisma.backgroundSlot.delete({ where });
  }
  return NextResponse.json<ResDeleteBackgroundDelete>({ slotNumber: body.slotNumber as BackgroundSlotNumber });
}
