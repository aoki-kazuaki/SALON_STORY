/** api/background/delete : 背景画像の削除 (S3 / MinIO から物理削除) */
import type { BackgroundSlotNumber } from "@/types";

/** DELETE リクエストボディ */
export type ReqBodyBackgroundDelete = {
  /** 削除対象スロット番号 */
  slotNumber: BackgroundSlotNumber;
};

/** DELETE レスポンス */
export type ResDeleteBackgroundDelete = {
  /** 削除したスロット番号 */
  slotNumber: BackgroundSlotNumber;
};
