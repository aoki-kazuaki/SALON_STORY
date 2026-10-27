"use client";

import { SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import CButton from "@/components/atoms/CButton";
import CCard from "@/components/molecules/CCard";
import RecordsYearAccordion from "@/components/organisms/Records/RecordsYearAccordion";
import DashboardPageLayout from "@/components/template/DashboardPageLayout";
import { RECORDS_DEFAULT_OPEN_YEAR_COUNT, SCHEDULE_MEMO_FUTURE_MONTH_COUNT } from "@/constants/app";
import { apiGet } from "@/lib/api/client";
import type { ScheduleYearSummary } from "@/types";
import type { ResGetScheduleSummary } from "@/types/api/schedule/summary";
import { arrayMergeUpcomingMonths } from "@/utils/array";
import { dateTodayKey } from "@/utils/date";

/**
 * 登録データ一覧 (年別アコーディオン → 月リスト)
 * - 今月から3か月先までの月は、未入力でもクライアント側で補完して常に選択可能にする (DB にはレコードを作らない)
 */
const RecordsPage = () => {
  const [years, setYears] = useState<ScheduleYearSummary[]>([]);
  const [openYears, setOpenYears] = useState<string[]>([]);
  const [todayKey, setTodayKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      const result = await apiGet<ResGetScheduleSummary>("/api/schedule/summary", {});
      const currentTodayKey = dateTodayKey();
      setIsLoading(false);
      setTodayKey(currentTodayKey);
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      const mergedYears = arrayMergeUpcomingMonths(
        result.data.years,
        currentTodayKey,
        SCHEDULE_MEMO_FUTURE_MONTH_COUNT,
      );
      setYears(mergedYears);
      setOpenYears(mergedYears.slice(0, RECORDS_DEFAULT_OPEN_YEAR_COUNT).map((year) => String(year.year)));
    };
    fetchSummary();
  }, []);

  /** 読み込み完了後にデータが0件かどうかの判定フラグ */
  const isEmpty: boolean = !isLoading && years.length === 0;

  return (
    <DashboardPageLayout
      title="登録データ一覧"
      description={`メモが入力されている年月と、今月から${SCHEDULE_MEMO_FUTURE_MONTH_COUNT}か月先までの月を表示しています。月をタップすると日別の一覧を開きます。`}
      footer={
        <CButton asChild variant="outline">
          <Link href="/dashboard/editor">
            <SparklesIcon />
            ストーリーズエディタへ
          </Link>
        </CButton>
      }
    >
      {isLoading && <p className="text-muted-foreground text-sm">読み込み中…</p>}
      {isEmpty && (
        <CCard>
          <p className="text-muted-foreground text-sm">
            まだメモが登録されていません。ダッシュボードの「メモを入力」から登録してください。
          </p>
        </CCard>
      )}
      <RecordsYearAccordion years={years} todayKey={todayKey} openYears={openYears} onOpenYearsChange={setOpenYears} />
    </DashboardPageLayout>
  );
};

export default RecordsPage;
