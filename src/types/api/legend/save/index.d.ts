/** api/legend/save : 凡例テキスト保存 */
import type { LegendText } from "@/types";

/** POST リクエストボディ */
export type ReqBodyLegendSave = {
  /** 凡例本文 (改行を含む) */
  content: string;
};

/** POST レスポンス */
export type ResPostLegendSave = {
  /** 保存後の凡例テキスト */
  legend: LegendText;
};
