"use client";

import { NotebookPenIcon, TextQuoteIcon } from "lucide-react";
import { useState } from "react";

import CButton from "@/components/atoms/CButton";
import CCard from "@/components/molecules/CCard";
import MemoEditDialog from "@/components/organisms/App/MemoEditDialog";
import HomeLegendDialog from "@/components/organisms/Home/HomeLegendDialog";
import { SCHEDULE_MEMO_FUTURE_MONTH_COUNT } from "@/constants/app";
import { useMemoInputStore } from "@/stores/memoInputStore";
import { dateMaxRegistrableKey, dateResolveMemoInputDefault, dateTodayKey } from "@/utils/date";

/** ダッシュボードのクイック操作 (メモ入力・凡例テキスト編集) */
const HomeActionPanel = () => {
  const [isMemoDialogOpen, setIsMemoDialogOpen] = useState(false);
  const [isLegendDialogOpen, setIsLegendDialogOpen] = useState(false);
  const [todayKey, setTodayKey] = useState("");
  const lastInputDateKey = useMemoInputStore((state) => state.lastInputDateKey);

  const openMemoDialog = () => {
    setTodayKey(dateTodayKey());
    setIsMemoDialogOpen(true);
  };

  return (
    <CCard title="空き枠を登録" description="日付ごとの空き状況メモと、ストーリーズ下部の凡例を編集できます。">
      <div className="grid gap-3 sm:grid-cols-2">
        <CButton size="lg" className="h-14 text-base" onClick={openMemoDialog}>
          <NotebookPenIcon />
          メモを入力
        </CButton>
        <CButton size="lg" variant="outline" className="h-14 text-base" onClick={() => setIsLegendDialogOpen(true)}>
          <TextQuoteIcon />
          凡例テキストを編集
        </CButton>
      </div>
      <MemoEditDialog
        open={isMemoDialogOpen}
        onOpenChange={setIsMemoDialogOpen}
        title="メモを入力"
        initialDateKey={dateResolveMemoInputDefault(lastInputDateKey, todayKey)}
        initialContent=""
        isDateLocked={false}
        minDateKey={todayKey}
        maxDateKey={dateMaxRegistrableKey(todayKey, SCHEDULE_MEMO_FUTURE_MONTH_COUNT)}
        isOverwrite={false}
        onSaved={() => {}}
      />
      <HomeLegendDialog open={isLegendDialogOpen} onOpenChange={setIsLegendDialogOpen} />
    </CCard>
  );
};

export default HomeActionPanel;
