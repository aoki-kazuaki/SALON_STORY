/** api/legend/detail : 凡例テキスト取得 */
import type { LegendText } from "@/types";

/** GET リクエストパラメータ (ログインユーザーの凡例を対象とするため指定項目なし) */
export type ReqParamsLegendDetail = Record<string, never>;

/** GET レスポンス */
export type ResGetLegendDetail = {
  /** 凡例テキスト (未保存の場合は content: "", updatedAt: null) */
  legend: LegendText;
};
