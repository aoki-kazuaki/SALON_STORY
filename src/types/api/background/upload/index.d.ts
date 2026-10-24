/** api/background/upload : 背景画像アップロード用 Presigned URL の発行 (新規・上書き共通) */
import type { BackgroundSlot, BackgroundSlotNumber } from "@/types";

/** POST リクエストボディ */
export type ReqBodyBackgroundUpload = {
  /** アップロード先スロット番号 */
  slotNumber: BackgroundSlotNumber;
  /** 画像の MIME タイプ (例: "image/jpeg") */
  contentType: string;
};

/** POST レスポンス */
export type ResPostBackgroundUpload = {
  /** PUT 送信先の署名付きURL */
  uploadUrl: string;
  /** 登録後のスロット情報 */
  slot: BackgroundSlot;
};
