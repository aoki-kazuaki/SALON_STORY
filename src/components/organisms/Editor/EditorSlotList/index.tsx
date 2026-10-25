"use client";

import CButton from "@/components/atoms/CButton";
import CCheckbox from "@/components/atoms/CCheckbox";
import CCard from "@/components/molecules/CCard";
import { cn } from "@/lib/shadcn/utils";
import { useEditorStore } from "@/stores/editorStore";
import type { ScheduleMemo } from "@/types";
import { dateFormatBadgeLabel } from "@/utils/date";

/** EditorSlotList の Props */
type Props = {
  /** 抽出期間内の入力済みメモ */
  memos: ScheduleMemo[];
  /** 読み込み中かどうか */
  isLoading: boolean;
};

/** ② 抽出された空き枠リスト (チェックOFFでグレーアウトし、キャンバスから除外) */
const EditorSlotList = ({ memos, isLoading }: Props) => {
  const excludedDateKeys = useEditorStore((state) => state.excludedDateKeys);
  const setDateIncluded = useEditorStore((state) => state.setDateIncluded);
  const setAllDatesIncluded = useEditorStore((state) => state.setAllDatesIncluded);

  const dateKeys = memos.map((memo) => memo.dateKey);
  /** 空き枠が存在するかどうかの判定フラグ */
  const hasMemos: boolean = memos.length > 0;
  /** 読み込み完了後に空き枠が0件かどうかの判定フラグ */
  const isEmpty: boolean = !isLoading && !hasMemos;
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
            const rowStateClass = isIncluded ? "bg-background" : "bg-muted opacity-50";
            const checkboxId = `editor-slot-${memo.dateKey}`;
            return (
              <li key={memo.dateKey}>
                <label
                  htmlFor={checkboxId}
                  className={cn("flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5", rowStateClass)}
                >
                  <CCheckbox
                    id={checkboxId}
                    className="mt-0.5"
                    checked={isIncluded}
                    onCheckedChange={(checked) => setDateIncluded(memo.dateKey, checked)}
                  />
                  <span className="w-20 shrink-0 text-sm font-bold tabular-nums">
                    {dateFormatBadgeLabel(memo.dateKey)}
                  </span>
                  <span className="text-sm whitespace-pre-wrap">{memo.content}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </CCard>
  );
};

export default EditorSlotList;
