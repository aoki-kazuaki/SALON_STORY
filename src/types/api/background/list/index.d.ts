/** api/background/list : 背景画像スロット一覧取得 */
import type { BackgroundSlot } from "@/types";

/** GET リクエストパラメータ (ログインユーザーの全スロットを対象とするため指定項目なし) */
export type ReqParamsBackgroundList = Record<string, never>;

/** GET レスポンス */
export type ResGetBackgroundList = {
  /** 登録済みスロット (スロット番号昇順、0枚の場合は []) */
  slots: BackgroundSlot[];
};
