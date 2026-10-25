"use client";

import { SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import CButton from "@/components/atoms/CButton";
import CCard from "@/components/molecules/CCard";
import RecordsMonthDayList from "@/components/organisms/RecordsMonth/RecordsMonthDayList";
import RecordsMonthToolbar from "@/components/organisms/RecordsMonth/RecordsMonthToolbar";
import DashboardPageLayout from "@/components/template/DashboardPageLayout";
import { apiGet } from "@/lib/api/client";
import { useEditorStore } from "@/stores/editorStore";
import type { DateKey, ScheduleMemo, ScheduleOperationBadge } from "@/types";
import type { ResGetScheduleList } from "@/types/api/schedule/list";
import { arrayBuildMonthDays } from "@/utils/array";
import { boolIsValidYearMonth } from "@/utils/boolean";
import { dateCurrentTimeStamp } from "@/utils/date";
import { objectBuildMonthRange } from "@/utils/object";

/** 月別一覧 (当月の日別アコーディオン) */
const RecordsMonthPage = () => {
  const params = useParams<{ year: string; month: string }>();
  const year = Number(params.year);
  const month = Number(params.month);
  /** URL の年・月が有効かどうかの判定フラグ */
  const isValidYearMonth: boolean = boolIsValidYearMonth(year, month);

  const [memos, setMemos] = useState<ScheduleMemo[]>([]);
  const [openDateKeys, setOpenDateKeys] = useState<DateKey[]>([]);
  const [operationBadges, setOperationBadges] = useState<Record<DateKey, ScheduleOperationBadge>>({});
  const [baseDateTime, setBaseDateTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const setRangeMode = useEditorStore((state) => state.setRangeMode);
  const setTargetMonth = useEditorStore((state) => state.setTargetMonth);

  useEffect(() => {
    if (!isValidYearMonth) return;
    const fetchMemos = async () => {
      const result = await apiGet<ResGetScheduleList>("/api/schedule/list", objectBuildMonthRange(year, month));
      setIsLoading(false);
      setBaseDateTime(dateCurrentTimeStamp());
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      setMemos(result.data.memos);
      setOpenDateKeys(result.data.memos.map((memo) => memo.dateKey));
    };
    fetchMemos();
  }, [isValidYearMonth, year, month]);

  const days = arrayBuildMonthDays(year, month, memos);
  const filledDateKeys = days.filter((day) => !(day.content === "")).map((day) => day.dateKey);

  const handleMemoChanged = (memo: ScheduleMemo, badge: ScheduleOperationBadge) => {
    setMemos((current) => [...current.filter((item) => !(item.dateKey === memo.dateKey)), memo]);
    setOperationBadges((current) => ({ ...current, [memo.dateKey]: badge }));
    setOpenDateKeys((current) => [...new Set([...current, memo.dateKey])]);
    setBaseDateTime(dateCurrentTimeStamp());
  };

  const handleOpenEditor = () => {
    setRangeMode("month");
    setTargetMonth(`${year}-${String(month).padStart(2, "0")}`);
  };

  if (!isValidYearMonth) {
    return (
      <CCard>
        <p className="text-muted-foreground text-sm">指定された年月が正しくありません。</p>
      </CCard>
    );
  }

  return (
    <DashboardPageLayout
      title={`${year}年${month}月の登録データ`}
      description={`入力済み ${filledDateKeys.length}日 / ${days.length}日`}
      actions={
        <RecordsMonthToolbar
          onExpandFilled={() => setOpenDateKeys(filledDateKeys)}
          onCollapseAll={() => setOpenDateKeys([])}
        />
      }
      footer={
        <CButton asChild variant="outline">
          <Link href="/dashboard/editor" onClick={handleOpenEditor}>
            <SparklesIcon />
            この月でストーリーズを作成
          </Link>
        </CButton>
      }
    >
      {isLoading && <p className="text-muted-foreground text-sm">読み込み中…</p>}
      {!isLoading && (
        <RecordsMonthDayList
          days={days}
          openDateKeys={openDateKeys}
          onOpenDateKeysChange={setOpenDateKeys}
          operationBadges={operationBadges}
          baseDateTime={baseDateTime}
          onMemoChanged={handleMemoChanged}
        />
      )}
    </DashboardPageLayout>
  );
};

export default RecordsMonthPage;
