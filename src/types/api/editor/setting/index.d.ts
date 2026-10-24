/** api/editor/setting : エディタ設定 (選択中の背景スロット) の取得・保存 */
import type { BackgroundSlotNumber } from "@/types";

/** GET リクエストパラメータ (ログインユーザーの設定を対象とするため指定項目なし) */
export type ReqParamsEditorSetting = Record<string, never>;

/** GET レスポンス */
export type ResGetEditorSetting = {
  /** 選択中の背景スロット番号 (未選択は null) */
  selectedSlotNumber: BackgroundSlotNumber | null;
};

/** POST リクエストボディ */
export type ReqBodyEditorSetting = {
  /** 選択する背景スロット番号 (null で選択解除) */
  selectedSlotNumber: BackgroundSlotNumber | null;
};

/** POST レスポンス */
export type ResPostEditorSetting = {
  /** 保存後の背景スロット番号 */
  selectedSlotNumber: BackgroundSlotNumber | null;
};
