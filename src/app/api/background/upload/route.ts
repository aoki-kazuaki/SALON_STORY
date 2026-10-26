import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { BACKGROUND_ACCEPT_CONTENT_TYPES, BACKGROUND_MAX_FILE_BYTES } from "@/constants/app";
import { mapperBackgroundSlot } from "@/lib/api/mapper";
import { apiBadRequestResponse, apiErrorResponse, apiGetSessionUser, apiUnauthorizedResponse } from "@/lib/api/server";
import { prisma } from "@/lib/prisma";
import { s3DeleteObject, s3PutObject } from "@/lib/s3";
import { schemaBackgroundUploadSlotNumber } from "@/lib/schemas";
import type { ResPostBackgroundUpload } from "@/types/api/background/upload";

/** MIME タイプごとの拡張子 */
const CONTENT_TYPE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** 背景画像をアップロードし、スロットに登録する (上書き時は旧画像を物理削除) */
export async function POST(request: Request) {
  const user = await apiGetSessionUser();
  if (!user) return apiUnauthorizedResponse();

  const formData = await request.formData().catch(() => null);
  if (!formData) return apiBadRequestResponse();

  const slotNumber = schemaBackgroundUploadSlotNumber.safeParse(formData.get("slotNumber"));
  if (!slotNumber.success) return apiBadRequestResponse();

  const file = formData.get("file");
  if (!(file instanceof File)) return apiBadRequestResponse();
  if (!BACKGROUND_ACCEPT_CONTENT_TYPES.includes(file.type)) {
    return apiErrorResponse(
      400,
      "INVALID_FILE_TYPE",
      "この形式の画像は登録できません。JPEG / PNG / WebP の画像を選択してください",
    );
  }
  if (file.size > BACKGROUND_MAX_FILE_BYTES) {
    return apiErrorResponse(
      400,
      "FILE_TOO_LARGE",
      "画像のファイルサイズが大きすぎます (4MB まで)。別の画像を選択してください",
    );
  }

  // 同一キーの上書きはブラウザキャッシュで旧画像が残るため、アップロードごとに新しいキーを発行する
  const objectKey = `backgrounds/${user.id}/slot${slotNumber.data}-${randomUUID()}.${CONTENT_TYPE_EXTENSIONS[file.type]}`;
  await s3PutObject(objectKey, new Uint8Array(await file.arrayBuffer()), file.type);

  const where = { userId_slotNumber: { userId: user.id, slotNumber: slotNumber.data } };
  const previous = await prisma.backgroundSlot.findUnique({ where });
  const saved = await prisma.backgroundSlot.upsert({
    where,
    create: { userId: user.id, slotNumber: slotNumber.data, objectKey, contentType: file.type },
    update: { objectKey, contentType: file.type },
  });
  if (previous) await s3DeleteObject(previous.objectKey);

  return NextResponse.json<ResPostBackgroundUpload>({ slot: await mapperBackgroundSlot(saved) });
}
