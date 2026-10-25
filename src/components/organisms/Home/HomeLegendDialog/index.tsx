"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import CButton from "@/components/atoms/CButton";
import CTextarea from "@/components/atoms/CTextarea";
import CDialog from "@/components/molecules/CDialog";
import CFormField from "@/components/molecules/CFormField";
import LegendCard from "@/components/molecules/LegendCard";
import { LEGEND_MAX_LENGTH } from "@/constants/app";
import { apiGet, apiPost } from "@/lib/api/client";
import { schemaLegendForm } from "@/lib/schemas";
import type { ResGetLegendDetail } from "@/types/api/legend/detail";
import type { ResPostLegendSave } from "@/types/api/legend/save";

/** 凡例テキスト編集フォームの値 */
type LegendFormValues = z.infer<typeof schemaLegendForm>;

/** HomeLegendDialog の Props */
type Props = {
  /** 表示状態 */
  open: boolean;
  /** 表示状態の変更時に呼ばれる */
  onOpenChange: (open: boolean) => void;
};

/** ストーリーズ下部の凡例テキストを編集するダイアログ (開くたびに DB から最新を取得) */
const HomeLegendDialog = ({ open, onOpenChange }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LegendFormValues>({ resolver: zodResolver(schemaLegendForm), defaultValues: { content: "" } });

  useEffect(() => {
    if (!open) return;
    const fetchLegend = async () => {
      setIsLoading(true);
      const result = await apiGet<ResGetLegendDetail>("/api/legend/detail", {});
      setIsLoading(false);
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      reset({ content: result.data.legend.content });
    };
    fetchLegend();
  }, [open, reset]);

  const onSubmit = async (values: LegendFormValues) => {
    const result = await apiPost<ResPostLegendSave>("/api/legend/save", values);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success("凡例テキストを保存しました");
    onOpenChange(false);
  };

  const content = useWatch({ control, name: "content" });
  /** 保存ボタンを非活性にするかどうかの判定フラグ (送信中・読み込み中) */
  const isSaveDisabled: boolean = isSubmitting || isLoading;

  return (
    <CDialog
      open={open}
      onOpenChange={onOpenChange}
      title="凡例テキストを編集"
      description="ストーリーズ下部の半透明カードに表示されます。改行もそのまま反映されます。"
      footer={
        <CButton type="submit" form="legend-edit-form" disabled={isSaveDisabled}>
          保存する
        </CButton>
      }
    >
      <form id="legend-edit-form" className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <CFormField
          htmlFor="legend-content"
          label="凡例テキスト"
          error={errors.content?.message ?? ""}
          hint={`${LEGEND_MAX_LENGTH}文字まで`}
        >
          <CTextarea
            id="legend-content"
            rows={5}
            disabled={isLoading}
            placeholder={"例) ◎ 空きあり　△ 残りわずか\nご予約はDMからどうぞ"}
            {...register("content")}
          />
        </CFormField>
        <div className="@container rounded-lg bg-stone-500 p-3">
          <p className="mb-2 text-xs text-white">プレビュー</p>
          <LegendCard title="" text={content} />
        </div>
      </form>
    </CDialog>
  );
};

export default HomeLegendDialog;
