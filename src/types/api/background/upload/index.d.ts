/** api/background/upload : 背景画像のアップロード (新規・上書き共通、multipart/form-data でサーバー経由で S3 / MinIO へ保存) */
import type { BackgroundSlot } from "@/types";

/** POST リクエストボディ (FormData のフィールド) */
export type ReqBodyBackgroundUpload = {
  /** アップロード先スロット番号 ("1"〜"5") */
  slotNumber: string;
  /** 画像ファイル (JPEG / PNG / WebP、10MB まで) */
  file: File;
};

/** POST レスポンス */
export type ResPostBackgroundUpload = {
  /** 登録後のスロット情報 (表示用の署名付きURLを含む) */
  slot: BackgroundSlot;
};
