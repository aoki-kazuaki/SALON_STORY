"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import CButton from "@/components/atoms/CButton";
import CInput from "@/components/atoms/CInput";
import CTextarea from "@/components/atoms/CTextarea";
import CConfirmDialog from "@/components/molecules/CConfirmDialog";
import CDialog from "@/components/molecules/CDialog";
import CFormField from "@/components/molecules/CFormField";
import { SCHEDULE_MEMO_MAX_LENGTH, SCHEDULE_MEMO_MAX_LINE_LENGTH, SCHEDULE_MEMO_MAX_LINES } from "@/constants/app";
import { apiGet, apiPost } from "@/lib/api/client";
import { schemaBuildMemoForm, type schemaMemoForm } from "@/lib/schemas";
import { useEditorStore } from "@/stores/editorStore";
import { useMemoInputStore } from "@/stores/memoInputStore";
import type { DateKey, ScheduleMemo } from "@/types";
import type { ResGetScheduleList } from "@/types/api/schedule/list";
import type { ResPostScheduleSave, ResPostScheduleSaveConflict } from "@/types/api/schedule/save";
import { dateFormatBadgeLabel, dateFormatKey } from "@/utils/date";

/** メモ入力フォームの値 */
type MemoFormValues = z.infer<typeof schemaMemoForm>;

/** MemoEditDialog の Props */
type Props = {
  /** 表示状態 */
  open: boolean;
  /** 表示状態の変更時に呼ばれる */
  onOpenChange: (open: boolean) => void;
  /** ダイアログ見出し */
  title: string;
  /** 初期表示する日付 */
  initialDateKey: DateKey;
  /** 初期表示する本文 */
  initialContent: string;
  /** 日付を固定する (月別一覧からの編集・追加) か */
  isDateLocked: boolean;
  /** 選択可能な最小日付 ("" は制限なし) */
  minDateKey: DateKey;
  /** 選択可能な最大日付 ("" は制限なし。新規登録時は今月から3か月先の月末) */
  maxDateKey: DateKey;
  /** 既存メモを確認なしで上書きする (編集時) か */
  isOverwrite: boolean;
  /** 保存完了時に呼ばれる */
  onSaved: (memo: ScheduleMemo, isCreated: boolean) => void;
};

/** 409 重複時に新旧比較ダイアログへ渡す情報 */
type ConflictState = {
  /** 保存しようとした内容 */
  values: MemoFormValues;
  /** 登録済みの既存メモ */
  existingMemo: ScheduleMemo;
};

/**
 * スケジュールメモの入力・編集ダイアログ
 * - 入力済みの日付に新規保存しようとした場合 (409) は、新旧比較の上書き確認ダイアログを表示
 * - 日付固定時 (登録済みメモの編集・月別一覧からの追加) は入力欄を disabled にする (iOS Safari は readonly の date 入力でもピッカーを開くため)。
 *   disabled の入力欄は送信値に含まれないため、値は hidden 入力で保持する。
 *   また表示時にメモ欄へ自動フォーカスしない (iOS でキーボードが勝手に開き、入力しづらくなるため)
 * - 日付選択時 (ダッシュボードからの新規入力) は、選んだ日付に登録済みのメモがあればメモ欄に読み込む。
 *   ただしユーザーが手入力した内容は上書きしない
 */
const MemoEditDialog = ({
  open,
  onOpenChange,
  title,
  initialDateKey,
  initialContent,
  isDateLocked,
  minDateKey,
  maxDateKey,
  isOverwrite,
  onSaved,
}: Props) => {
  const [conflict, setConflict] = useState<ConflictState | null>(null);
  const setLastInputDateKey = useMemoInputStore((state) => state.setLastInputDateKey);
  const invalidateMemos = useEditorStore((state) => state.invalidateMemos);
  /** 直前に登録済みメモから読み込んだ本文 (手入力との判別用。未読み込みは "") */
  const loadedContentRef = useRef("");
  const [loadedContent, setLoadedContent] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MemoFormValues>({
    resolver: zodResolver(schemaBuildMemoForm(maxDateKey)),
    defaultValues: { dateKey: initialDateKey, content: initialContent },
  });
  const selectedDateKey = useWatch({ control, name: "dateKey" });
  const currentContent = useWatch({ control, name: "content" });

  useEffect(() => {
    if (!open) return;
    loadedContentRef.current = "";
    reset({ dateKey: initialDateKey, content: initialContent });
  }, [open, initialDateKey, initialContent, reset]);

  // 選択中の日付に登録済みのメモがあればメモ欄に読み込む (日付選択時のみ。切り替え時に古い応答は破棄する)
  useEffect(() => {
    if (!open) return;
    if (isDateLocked) return;
    if (selectedDateKey === "") return;
    if (!(dateFormatKey(selectedDateKey) === selectedDateKey)) return;
    let isStale = false;
    const loadExistingMemo = async () => {
      const result = await apiGet<ResGetScheduleList>("/api/schedule/list", {
        startDate: selectedDateKey,
        endDate: selectedDateKey,
      });
      if (isStale) return;
      if (!result.ok) return;
      const typedContent = getValues("content");
      /** ユーザーが手入力した内容があるか (空でも、直前に読み込んだ内容のままでもない) */
      const hasTypedContent: boolean = !(typedContent === "") && !(typedContent === loadedContentRef.current);
      if (hasTypedContent) return;
      const existingContent = result.data.memos[0]?.content ?? "";
      loadedContentRef.current = existingContent;
      setLoadedContent(existingContent);
      setValue("content", existingContent);
    };
    loadExistingMemo();
    return () => {
      isStale = true;
    };
  }, [open, isDateLocked, selectedDateKey, getValues, setValue]);

  /** 登録済みメモを読み込んだ内容のまま表示しているかどうかの判定フラグ */
  const isShowingExistingMemo: boolean = !isDateLocked && !(loadedContent === "") && currentContent === loadedContent;

  /** 保存 API を呼び出す (409 の場合は比較ダイアログを開く) */
  const save = async (values: MemoFormValues, overwrite: boolean) => {
    const result = await apiPost<ResPostScheduleSave, ResPostScheduleSaveConflict>("/api/schedule/save", {
      ...values,
      overwrite,
    });
    if (result.status === 409 && result.error) {
      setConflict({ values, existingMemo: result.error.existingMemo });
      return;
    }
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success(`${dateFormatBadgeLabel(values.dateKey)} のメモを保存しました`);
    setLastInputDateKey(values.dateKey);
    invalidateMemos();
    onSaved(result.data.memo, result.data.isCreated);
    onOpenChange(false);
  };

  const handleOverwriteConfirm = async () => {
    if (!conflict) return;
    const { values } = conflict;
    setConflict(null);
    await save(values, true);
  };

  /** 比較ダイアログを表示するかどうかの判定フラグ */
  const isConflictOpen: boolean = Boolean(conflict);

  return (
    <>
      <CDialog
        open={open}
        onOpenChange={onOpenChange}
        isAutoFocusDisabled={isDateLocked}
        title={title}
        description="空き枠の時間帯などを入力してください。入力した内容は改行も含めてそのままストーリーズのバッジに表示されます。"
        footer={
          <CButton type="submit" form="memo-edit-form" disabled={isSubmitting}>
            保存する
          </CButton>
        }
      >
        <form id="memo-edit-form" className="grid gap-4" onSubmit={handleSubmit((values) => save(values, isOverwrite))}>
          <CFormField htmlFor="memo-date" label="日付" error={errors.dateKey?.message ?? ""}>
            {isDateLocked && (
              <>
                <CInput
                  id="memo-date"
                  type="date"
                  value={initialDateKey}
                  disabled
                  className="disabled:bg-muted disabled:opacity-100"
                />
                <input type="hidden" {...register("dateKey")} />
              </>
            )}
            {!isDateLocked && (
              <CInput id="memo-date" type="date" min={minDateKey} max={maxDateKey} {...register("dateKey")} />
            )}
          </CFormField>
          <CFormField
            htmlFor="memo-content"
            label="メモ"
            error={errors.content?.message ?? ""}
            hint={`最大${SCHEDULE_MEMO_MAX_LINES}行・1行${SCHEDULE_MEMO_MAX_LINE_LENGTH}文字まで (時間帯ごとに改行がおすすめ。長いメモはストーリーズ上で文字が自動的に小さくなります)`}
          >
            {isShowingExistingMemo && (
              <p className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-800">
                この日付の登録済みメモを表示しています。保存すると、登録済みの内容と比較して上書きするか確認します。
              </p>
            )}
            <CTextarea
              id="memo-content"
              rows={SCHEDULE_MEMO_MAX_LINES}
              maxLength={SCHEDULE_MEMO_MAX_LENGTH}
              placeholder={"例)\n10:00\n13:15"}
              {...register("content")}
            />
          </CFormField>
        </form>
      </CDialog>

      <CConfirmDialog
        open={isConflictOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setConflict(null);
        }}
        title="既存のメモを上書きしますか？"
        description="この日付には既にメモが登録されています。"
        confirmLabel="上書きする"
        onConfirm={handleOverwriteConfirm}
      >
        <div className="grid gap-2 text-sm">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-muted-foreground text-xs font-bold">登録済み</p>
            <p className="mt-1 whitespace-pre-wrap">{conflict?.existingMemo.content ?? ""}</p>
          </div>
          <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-3">
            <p className="text-xs font-bold text-orange-700">今回の入力</p>
            <p className="mt-1 whitespace-pre-wrap">{conflict?.values.content ?? ""}</p>
          </div>
        </div>
      </CConfirmDialog>
    </>
  );
};

export default MemoEditDialog;
