import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import CAccordion from "@/components/molecules/CAccordion";
import type { ScheduleYearSummary } from "@/types";
import { dateFormatMonthLabel } from "@/utils/date";

/** RecordsYearAccordion の Props */
type Props = {
  /** データが存在する年 (降順) */
  years: ScheduleYearSummary[];
  /** 展開中の年 */
  openYears: string[];
  /** 展開状態の変更時に呼ばれる */
  onOpenYearsChange: (openYears: string[]) => void;
};

/** 年別アコーディオン (中身はデータが存在する月のリンク一覧) */
const RecordsYearAccordion = ({ years, openYears, onOpenYearsChange }: Props) => (
  <CAccordion
    value={openYears}
    onValueChange={onOpenYearsChange}
    items={years.map((yearSummary) => ({
      value: String(yearSummary.year),
      trigger: (
        <span className="flex items-baseline gap-2">
          <span className="text-lg font-bold">{yearSummary.year}年</span>
          <span className="text-muted-foreground text-xs">{yearSummary.months.length}か月分</span>
        </span>
      ),
      content: (
        <ul className="grid gap-2 sm:grid-cols-2">
          {yearSummary.months.map((monthSummary) => (
            <li key={monthSummary.month}>
              <Link
                href={`/dashboard/records/${yearSummary.year}/${monthSummary.month}`}
                className="bg-background flex items-center gap-3 rounded-lg border px-4 py-3 transition hover:border-stone-400"
              >
                <span className="w-16 font-bold">{dateFormatMonthLabel(monthSummary.month)}</span>
                <span className="text-muted-foreground flex-1 text-sm">
                  {monthSummary.month}月・{monthSummary.count}件入力済
                </span>
                <ChevronRightIcon className="text-muted-foreground size-4" />
              </Link>
            </li>
          ))}
        </ul>
      ),
    }))}
  />
);

export default RecordsYearAccordion;
