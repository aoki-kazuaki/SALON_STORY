import { s3CreatePresignedGetUrl } from "@/lib/s3";
import type { BackgroundSlot, BackgroundSlotNumber, DateKey, ScheduleMemo } from "@/types";

/** 日付キーを DB の DATE 型 (UTC 0時) に変換する */
export const mapperDateKeyToDbDate = (dateKey: DateKey): Date => new Date(`${dateKey}T00:00:00.000Z`);

/** DB の DATE 型を日付キーに変換する */
export const mapperDbDateToDateKey = (date: Date): DateKey => date.toISOString().slice(0, 10);

/** schedule_memo テーブルの行をレスポンス用に変換する */
export const mapperScheduleMemo = (row: {
  id: string;
  date: Date;
  content: string;
  updatedAt: Date;
}): ScheduleMemo => ({
  id: row.id,
  dateKey: mapperDbDateToDateKey(row.date),
  content: row.content,
  updatedAt: row.updatedAt.toISOString(),
});

/** background_slot テーブルの行を、表示用署名付きURL付きでレスポンス用に変換する */
export const mapperBackgroundSlot = async (row: {
  slotNumber: number;
  objectKey: string;
  updatedAt: Date;
}): Promise<BackgroundSlot> => ({
  slotNumber: row.slotNumber as BackgroundSlotNumber,
  objectKey: row.objectKey,
  imageUrl: await s3CreatePresignedGetUrl(row.objectKey),
  updatedAt: row.updatedAt.toISOString(),
});
