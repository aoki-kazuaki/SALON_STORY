"use client";

import { PencilIcon } from "lucide-react";
import { useState } from "react";

import CBadge from "@/components/atoms/CBadge";
import CButton from "@/components/atoms/CButton";
import CCheckbox from "@/components/atoms/CCheckbox";
import CCard from "@/components/molecules/CCard";
import MemoEditDialog from "@/components/organisms/App/MemoEditDialog";
import { SCHEDULE_OPERATION_BADGE_TONES, SCHEDULE_SAVED_BADGES } from "@/constants/app";
import { cn } from "@/lib/shadcn/utils";
import { useEditorStore } from "@/stores/editorStore";
import type { DateKey, ScheduleMemo, ScheduleOperationBadge } from "@/types";
import { dateFormatBadgeLabel } from "@/utils/date";

/** EditorSlotList の Props */
type Props = {
  /** 抽出期間内の入力済みメモ */
  memos: ScheduleMemo[];
  /** 読み込み中かどうか */
  isLoading: boolean;
  /** 直前に操作した日のバッジ */
  operationBadges: Record<DateKey, ScheduleOperationBadge>;
  /** メモの保存後に呼ばれる */
  onMemoChanged: (memo: ScheduleMemo, badge: ScheduleOperationBadge) => void;
};

/**
 * ② 抽出された空き枠リスト
 * - チェックOFFでグレーアウトし、キャンバスから除外
 * - 各行の編集ボタンからメモを編集でき、保存した行には NEW / UPDATED バッジを表示
 */
const EditorSlotList = ({ memos, isLoading, operationBadges, onMemoChanged }: Props) => {
  const [editTarget, setEditTarget] = useState<ScheduleMemo | null>(null);
  const excludedDateKeys = useEditorStore((state) => state.excludedDateKeys);
  const setDateIncluded = useEditorStore((state) => state.setDateIncluded);
  const setAllDatesIncluded = useEditorStore((state) => state.setAllDatesIncluded);

  const dateKeys = memos.map((memo) => memo.dateKey);
  /** 空き枠が存在するかどうかの判定フラグ */
  const hasMemos: boolean = memos.length > 0;
  /** 読み込み完了後に空き枠が0件かどうかの判定フラグ */
  const isEmpty: boolean = !isLoading && !hasMemos;
  /** 編集ダイアログを表示するかどうかの判定フラグ */
  const isEditDialogOpen: boolean = Boolean(editTarget);
  const includedCount = dateKeys.filter((dateKey) => !excludedDateKeys.has(dateKey)).length;

  return (
    <CCard title="② 空き枠を選択" description={`${memos.length}件中 ${includedCount}件をキャンバスに表示します`}>
      <div className="grid gap-3">
        <div className="flex gap-2">
          <CButton size="sm" variant="outline" disabled={!hasMemos} onClick={() => setAllDatesIncluded(dateKeys, true)}>
            全選択
          </CButton>
          <CButton
            size="sm"
            variant="outline"
            disabled={!hasMemos}
            onClick={() => setAllDatesIncluded(dateKeys, false)}
          >
            全解除
          </CButton>
        </div>

        {isLoading && <p className="text-muted-foreground text-sm">読み込み中…</p>}
        {isEmpty && <p className="text-muted-foreground text-sm">選択した期間に入力済みのメモがありません。</p>}

        <ul className="grid gap-2">
          {memos.map((memo) => {
            /** キャンバスに表示する (チェックON) かどうかの判定フラグ */
            const isIncluded: boolean = !excludedDateKeys.has(memo.dateKey);
            const operationBadge = operationBadges[memo.dateKey] ?? "";
            /** 操作バッジ (NEW / UPDATED) を表示するかどうかの判定フラグ */
            const hasOperationBadge: boolean = !(operationBadge === "");
            const rowStateClass = isIncluded ? "bg-background" : "bg-muted";
            const contentStateClass = isIncluded ? "opacity-100" : "opacity-50";
            const checkboxId = `editor-slot-${memo.dateKey}`;
            const dateLabel = dateFormatBadgeLabel(memo.dateKey);
            return (
              <li
                key={memo.dateKey}
                className={cn("flex items-start gap-2 rounded-lg border py-1.5 pr-1.5 pl-3", rowStateClass)}
              >
                <label
                  htmlFor={checkboxId}
                  className={cn("flex flex-1 cursor-pointer items-start gap-3 py-1", contentStateClass)}
                >
                  <CCheckbox
                    id={checkboxId}
                    className="mt-0.5"
                    checked={isIncluded}
                    onCheckedChange={(checked) => setDateIncluded(memo.dateKey, checked)}
                  />
                  <span className="grid w-20 shrink-0 justify-items-start gap-1">
                    <span className="text-sm font-bold tabular-nums">{dateLabel}</span>
                    {hasOperationBadge && (
                      <CBadge
                        tone={SCHEDULE_OPERATION_BADGE_TONES[operationBadge as Exclude<ScheduleOperationBadge, "">]}
                      >
                        {operationBadge}
                      </CBadge>
                    )}
                  </span>
                  <span className="text-sm whitespace-pre-wrap">{memo.content}</span>
                </label>
                {/* チェックの切り替えと誤操作しないよう、label の外に配置する */}
                <CButton
                  size="icon-sm"
                  variant="ghost"
                  className="text-muted-foreground shrink-0"
                  aria-label={`${dateLabel} のメモを編集`}
                  onClick={() => setEditTarget(memo)}
                >
                  <PencilIcon />
                </CButton>
              </li>
            );
          })}
        </ul>
      </div>

      <MemoEditDialog
        open={isEditDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setEditTarget(null);
        }}
        title="メモを編集"
        initialDateKey={editTarget?.dateKey ?? ""}
        initialContent={editTarget?.content ?? ""}
        isDateLocked
        minDateKey=""
        isOverwrite
        onSaved={(memo, isCreated) => onMemoChanged(memo, SCHEDULE_SAVED_BADGES[String(isCreated) as "true" | "false"])}
      />
    </CCard>
  );
};

export default EditorSlotList;
