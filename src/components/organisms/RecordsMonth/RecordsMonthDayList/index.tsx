"use client";

import { EraserIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import CBadge from "@/components/atoms/CBadge";
import CButton from "@/components/atoms/CButton";
import CAccordion from "@/components/molecules/CAccordion";
import CConfirmDialog from "@/components/molecules/CConfirmDialog";
import MemoEditDialog from "@/components/organisms/App/MemoEditDialog";
import {
  SCHEDULE_MEMO_FUTURE_MONTH_COUNT,
  SCHEDULE_OPERATION_BADGE_TONES,
  SCHEDULE_SAVED_BADGES,
} from "@/constants/app";
import { apiDelete } from "@/lib/api/client";
import { useEditorStore } from "@/stores/editorStore";
import type { DateKey, ScheduleMemo, ScheduleOperationBadge } from "@/types";
import type { ResDeleteScheduleClear } from "@/types/api/schedule/clear";
import { dateFormatBadgeLabel, dateFormatRelative, dateMaxRegistrableKey, dateTodayKey } from "@/utils/date";

/** RecordsMonthDayList の Props */
type Props = {
  /** 当月の全日分のメモ (未入力日は content が "") */
  days: ScheduleMemo[];
  /** 展開中の日付キー */
  openDateKeys: DateKey[];
  /** 展開状態の変更時に呼ばれる */
  onOpenDateKeysChange: (openDateKeys: DateKey[]) => void;
  /** 直前に操作した日のバッジ */
  operationBadges: Record<DateKey, ScheduleOperationBadge>;
  /** 相対日時表示の基準日時 */
  baseDateTime: string;
  /** メモの保存・クリア後に呼ばれる */
  onMemoChanged: (memo: ScheduleMemo, badge: ScheduleOperationBadge) => void;
};

/** 編集ダイアログの対象 */
type EditTarget = {
  /** 対象日 */
  dateKey: DateKey;
  /** 編集前の本文 */
  content: string;
  /** 入力済みメモの編集かどうか (false はメモ追加) */
  isEdit: boolean;
  /** 登録可能な最終日 (メモ追加時のみ今月から3か月先の月末、編集時は "") */
  maxDateKey: DateKey;
};

/** 当月の日別アコーディオン一覧 (入力済: 青バッジ・編集/クリア / 未入力: グレーバッジ・メモ追加) */
const RecordsMonthDayList = ({
  days,
  openDateKeys,
  onOpenDateKeysChange,
  operationBadges,
  baseDateTime,
  onMemoChanged,
}: Props) => {
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [clearTargetDateKey, setClearTargetDateKey] = useState<DateKey>("");
  const invalidateMemos = useEditorStore((state) => state.invalidateMemos);

  const handleClear = async () => {
    const dateKey = clearTargetDateKey;
    setClearTargetDateKey("");
    const result = await apiDelete<ResDeleteScheduleClear>("/api/schedule/clear", { dateKey });
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success(`${dateFormatBadgeLabel(dateKey)} のメモをクリアしました`);
    invalidateMemos();
    onMemoChanged(result.data.memo, "UPDATED");
  };

  /** 編集ダイアログを表示するかどうかの判定フラグ */
  const isEditDialogOpen: boolean = Boolean(editTarget);
  /** クリア確認ダイアログを表示するかどうかの判定フラグ */
  const isClearDialogOpen: boolean = !(clearTargetDateKey === "");
  const editDialogTitle = editTarget?.isEdit ? "メモを編集" : "メモを追加";

  return (
    <>
      <CAccordion
        value={openDateKeys}
        onValueChange={onOpenDateKeysChange}
        items={days.map((day) => {
          /** 入力済みかどうかの判定フラグ */
          const isFilled: boolean = !(day.content === "");
          const operationBadge = operationBadges[day.dateKey] ?? "";
          /** 操作バッジ (NEW / UPDATED) を表示するかどうかの判定フラグ */
          const hasOperationBadge: boolean = !(operationBadge === "");
          const statusTone = isFilled ? "blue" : "gray";
          const statusLabel = isFilled ? "入力済" : "未入力";
          return {
            value: day.dateKey,
            trigger: (
              <span className="flex flex-wrap items-center gap-2">
                <span className="w-24 font-bold tabular-nums">{dateFormatBadgeLabel(day.dateKey)}</span>
                <CBadge tone={statusTone}>{statusLabel}</CBadge>
                {hasOperationBadge && (
                  <CBadge tone={SCHEDULE_OPERATION_BADGE_TONES[operationBadge as Exclude<ScheduleOperationBadge, "">]}>
                    {operationBadge}
                  </CBadge>
                )}
              </span>
            ),
            content: (
              <div className="grid gap-3">
                {isFilled && (
                  <>
                    <p className="bg-muted rounded-lg px-3 py-2 whitespace-pre-wrap">{day.content}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-muted-foreground text-xs">
                        最終更新: {dateFormatRelative(day.updatedAt ?? "", baseDateTime)}
                      </span>
                      <span className="flex gap-2">
                        <CButton
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEditTarget({ dateKey: day.dateKey, content: day.content, isEdit: true, maxDateKey: "" })
                          }
                        >
                          <PencilIcon />
                          編集
                        </CButton>
                        <CButton size="sm" variant="outline" onClick={() => setClearTargetDateKey(day.dateKey)}>
                          <EraserIcon />
                          クリア
                        </CButton>
                      </span>
                    </div>
                  </>
                )}
                {!isFilled && (
                  <CButton
                    size="sm"
                    variant="outline"
                    className="justify-self-start"
                    onClick={() =>
                      setEditTarget({
                        dateKey: day.dateKey,
                        content: "",
                        isEdit: false,
                        maxDateKey: dateMaxRegistrableKey(dateTodayKey(), SCHEDULE_MEMO_FUTURE_MONTH_COUNT),
                      })
                    }
                  >
                    <PlusIcon />
                    メモを追加
                  </CButton>
                )}
              </div>
            ),
          };
        })}
      />

      <MemoEditDialog
        open={isEditDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setEditTarget(null);
        }}
        title={editDialogTitle}
        initialDateKey={editTarget?.dateKey ?? ""}
        initialContent={editTarget?.content ?? ""}
        isDateLocked
        minDateKey=""
        maxDateKey={editTarget?.maxDateKey ?? ""}
        isOverwrite={editTarget?.isEdit ?? false}
        onSaved={(memo, isCreated) => onMemoChanged(memo, SCHEDULE_SAVED_BADGES[String(isCreated) as "true" | "false"])}
      />

      <CConfirmDialog
        open={isClearDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setClearTargetDateKey("");
        }}
        title={`${dateFormatBadgeLabel(clearTargetDateKey)} のメモをクリアしますか？`}
        description="メモの本文を空にします。"
        confirmLabel="クリア"
        isDestructive
        onConfirm={handleClear}
      />
    </>
  );
};

export default RecordsMonthDayList;
