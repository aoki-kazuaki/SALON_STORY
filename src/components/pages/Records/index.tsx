"use client";

import { SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import CButton from "@/components/atoms/CButton";
import CCard from "@/components/molecules/CCard";
import RecordsYearAccordion from "@/components/organisms/Records/RecordsYearAccordion";
import DashboardPageLayout from "@/components/template/DashboardPageLayout";
import { RECORDS_DEFAULT_OPEN_YEAR_COUNT } from "@/constants/app";
import { apiGet } from "@/lib/api/client";
import type { ScheduleYearSummary } from "@/types";
import type { ResGetScheduleSummary } from "@/types/api/schedule/summary";

/** 登録データ一覧 (年別アコーディオン → 月リスト) */
const RecordsPage = () => {
  const [years, setYears] = useState<ScheduleYearSummary[]>([]);
  const [openYears, setOpenYears] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      const result = await apiGet<ResGetScheduleSummary>("/api/schedule/summary", {});
      setIsLoading(false);
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      setYears(result.data.years);
      setOpenYears(result.data.years.slice(0, RECORDS_DEFAULT_OPEN_YEAR_COUNT).map((year) => String(year.year)));
    };
    fetchSummary();
  }, []);

  /** 読み込み完了後にデータが0件かどうかの判定フラグ */
  const isEmpty: boolean = !isLoading && years.length === 0;

  return (
    <DashboardPageLayout
      title="登録データ一覧"
      description="メモが入力されている年月のみ表示しています。月をタップすると日別の一覧を開きます。"
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
      <RecordsYearAccordion years={years} openYears={openYears} onOpenYearsChange={setOpenYears} />
    </DashboardPageLayout>
  );
};

export default RecordsPage;
