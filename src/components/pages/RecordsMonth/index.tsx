"use client";

import { SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import CButton from "@/components/atoms/CButton";
import CCard from "@/components/molecules/CCard";
import RecordsMonthDayList from "@/components/organisms/RecordsMonth/RecordsMonthDayList";
import RecordsMonthNavigation from "@/components/organisms/RecordsMonth/RecordsMonthNavigation";
import RecordsMonthToolbar from "@/components/organisms/RecordsMonth/RecordsMonthToolbar";
import DashboardPageLayout from "@/components/template/DashboardPageLayout";
import { SCHEDULE_MEMO_FUTURE_MONTH_COUNT } from "@/constants/app";
import { apiGet } from "@/lib/api/client";
import { useEditorStore } from "@/stores/editorStore";
import type { DateKey, ScheduleMemo, ScheduleOperationBadge } from "@/types";
import type { ResGetScheduleList } from "@/types/api/schedule/list";
import { arrayBuildMonthDays } from "@/utils/array";
import { boolIsCurrentMonth, boolIsValidYearMonth, boolIsWithinRegistrableMonth } from "@/utils/boolean";
import { dateCurrentTimeStamp, dateTodayKey } from "@/utils/date";
import { objectBuildMonthRange, objectShiftYearMonth, type YearMonth } from "@/utils/object";

/**
 * 月の切り替え先となる月別一覧の URL を生成する
 * @param yearMonth 切り替え先の年月
 * @param isEnabled 切り替え可能かどうか
 * @returns 月別一覧のパス (切り替え不可の場合は "")
 */
const buildMonthHref = (yearMonth: YearMonth, isEnabled: boolean): string => {
  if (!isEnabled) return "";
  return `/dashboard/records/${yearMonth.year}/${yearMonth.month}`;
};

/**
 * 月別一覧 (当月の日別アコーディオン)
 * - 前の月・次の月へ切り替え可能。次の月は今月から3か月先まで (未入力の月も DB を使わずに表示する)
 */
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
  const [todayKey, setTodayKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const setRangeMode = useEditorStore((state) => state.setRangeMode);
  const setTargetMonth = useEditorStore((state) => state.setTargetMonth);

  useEffect(() => {
    if (!isValidYearMonth) return;
    const fetchMemos = async () => {
      const result = await apiGet<ResGetScheduleList>("/api/schedule/list", objectBuildMonthRange(year, month));
      setIsLoading(false);
      setBaseDateTime(dateCurrentTimeStamp());
      setTodayKey(dateTodayKey());
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

  const prevYearMonth = objectShiftYearMonth(year, month, -1);
  const nextYearMonth = objectShiftYearMonth(year, month, 1);
  /** 前の月が有効な年月かどうかの判定フラグ */
  const canMovePrev: boolean = boolIsValidYearMonth(prevYearMonth.year, prevYearMonth.month);
  /** 次の月が今月から3か月先までに収まるかどうかの判定フラグ */
  const canMoveNext: boolean = boolIsWithinRegistrableMonth(
    nextYearMonth.year,
    nextYearMonth.month,
    todayKey,
    SCHEDULE_MEMO_FUTURE_MONTH_COUNT,
  );

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
      <RecordsMonthNavigation
        label={`${year}年${month}月`}
        isCurrentMonth={boolIsCurrentMonth(year, month, todayKey)}
        prevLabel={`${prevYearMonth.month}月`}
        prevHref={buildMonthHref(prevYearMonth, canMovePrev)}
        nextLabel={`${nextYearMonth.month}月`}
        nextHref={buildMonthHref(nextYearMonth, canMoveNext)}
      />
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
