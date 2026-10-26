import { create } from "zustand";

import { createInitialEditorSelection } from "@/constants/initialValue";
import type { BackgroundSlotNumber, DateKey, EditorRangeMode, EditorSelection, ScheduleMemo } from "@/types";

/** エディタの State */
type EditorState = EditorSelection & {
  /** 現在の抽出期間で取得済みのメモ */
  memos: ScheduleMemo[];
  /** memos を取得した抽出期間のキー ("開始日_終了日"、未取得は "") */
  fetchedRangeKey: string;
  /** 選択方式を変更する */
  setRangeMode: (rangeMode: EditorRangeMode) => void;
  /** 月指定の対象年月を変更する */
  setTargetMonth: (targetMonth: string) => void;
  /** 月指定で過去日を含めるかを変更する */
  setIncludePastDates: (includePastDates: boolean) => void;
  /** 期間指定の開始日を変更する */
  setPeriodStartDate: (periodStartDate: DateKey | null) => void;
  /** 期間指定の日数を変更する */
  setPeriodDays: (periodDays: number) => void;
  /** 指定日のチェック状態を切り替える (OFF で除外) */
  setDateIncluded: (dateKey: DateKey, isIncluded: boolean) => void;
  /** 指定日をまとめて選択・解除する */
  setAllDatesIncluded: (dateKeys: DateKey[], isIncluded: boolean) => void;
  /** 背景スロットを選択する */
  setSelectedSlotNumber: (slotNumber: BackgroundSlotNumber | null) => void;
  /** 取得したメモを抽出期間のキーとともに保存する */
  setMemos: (rangeKey: string, memos: ScheduleMemo[]) => void;
  /** メモ更新時に取得済みデータを破棄し、次回表示で再取得させる */
  invalidateMemos: () => void;
  /** エディタ上で保存したメモを取得済みデータへ反映する (再取得せず即時にキャンバスへ反映) */
  upsertMemo: (rangeKey: string, memo: ScheduleMemo) => void;
};

/** ストーリーズエディタの選択状態 (画面遷移を跨いで保持) */
export const useEditorStore = create<EditorState>()((set) => ({
  ...createInitialEditorSelection(),
  memos: [],
  fetchedRangeKey: "",
  setRangeMode: (rangeMode) => set({ rangeMode }),
  setTargetMonth: (targetMonth) => set({ targetMonth }),
  setIncludePastDates: (includePastDates) => set({ includePastDates }),
  setPeriodStartDate: (periodStartDate) => set({ periodStartDate }),
  setPeriodDays: (periodDays) => set({ periodDays }),
  setDateIncluded: (dateKey, isIncluded) =>
    set((state) => {
      const excludedDateKeys = new Set(state.excludedDateKeys);
      if (isIncluded) excludedDateKeys.delete(dateKey);
      if (!isIncluded) excludedDateKeys.add(dateKey);
      return { excludedDateKeys };
    }),
  setAllDatesIncluded: (dateKeys, isIncluded) =>
    set((state) => {
      const excludedDateKeys = new Set(state.excludedDateKeys);
      dateKeys.forEach((dateKey) => {
        if (isIncluded) excludedDateKeys.delete(dateKey);
        if (!isIncluded) excludedDateKeys.add(dateKey);
      });
      return { excludedDateKeys };
    }),
  setSelectedSlotNumber: (selectedSlotNumber) => set({ selectedSlotNumber }),
  setMemos: (fetchedRangeKey, memos) => set({ fetchedRangeKey, memos }),
  invalidateMemos: () => set({ fetchedRangeKey: "" }),
  upsertMemo: (fetchedRangeKey, memo) =>
    set((state) => ({
      fetchedRangeKey,
      memos: [...state.memos.filter((item) => !(item.dateKey === memo.dateKey)), memo].sort((a, b) =>
        a.dateKey.localeCompare(b.dateKey),
      ),
    })),
}));
