import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import CBadge from "@/components/atoms/CBadge";
import CAccordion from "@/components/molecules/CAccordion";
import { cn } from "@/lib/shadcn/utils";
import type { DateKey, ScheduleYearSummary } from "@/types";
import { boolIsCurrentMonth } from "@/utils/boolean";
import { dateFormatMonthLabel } from "@/utils/date";

/** RecordsYearAccordion の Props */
type Props = {
  /** 表示する年 (降順。データが存在する月 ＋ 今月から3か月先までの月) */
  years: ScheduleYearSummary[];
  /** 今月を強調表示するための今日の日付キー (読み込み前は "") */
  todayKey: DateKey;
  /** 展開中の年 */
  openYears: string[];
  /** 展開状態の変更時に呼ばれる */
  onOpenYearsChange: (openYears: string[]) => void;
};

/** 年別アコーディオン (中身は月のリンク一覧。今月は背景色を変えて強調する) */
const RecordsYearAccordion = ({ years, todayKey, openYears, onOpenYearsChange }: Props) => (
  <CAccordion
    value={openYears}
    onValueChange={onOpenYearsChange}
    items={years.map((yearSummary) => {
      /** 入力済みの日が1日以上ある月の数 */
      const filledMonthCount: number = yearSummary.months.filter((monthSummary) => monthSummary.count > 0).length;
      return {
        value: String(yearSummary.year),
        trigger: (
          <span className="flex items-baseline gap-2">
            <span className="text-lg font-bold">{yearSummary.year}年</span>
            <span className="text-muted-foreground text-xs">{filledMonthCount}か月分</span>
          </span>
        ),
        content: (
          <ul className="grid gap-2 sm:grid-cols-2">
            {yearSummary.months.map((monthSummary) => {
              /** 今月かどうかの判定フラグ */
              const isCurrentMonth: boolean = boolIsCurrentMonth(yearSummary.year, monthSummary.month, todayKey);
              /** 入力済みの日が1日以上ある月かどうかの判定フラグ */
              const hasFilledDays: boolean = monthSummary.count > 0;
              const linkColorClassName = isCurrentMonth ? "border-blue-300 bg-blue-50" : "bg-background";
              const ariaCurrent = isCurrentMonth ? "date" : "false";
              const statusLabel = hasFilledDays ? `${monthSummary.count}件入力済` : "未入力";
              return (
                <li key={monthSummary.month}>
                  <Link
                    href={`/dashboard/records/${yearSummary.year}/${monthSummary.month}`}
                    aria-current={ariaCurrent}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-4 py-3 transition hover:border-stone-400",
                      linkColorClassName,
                    )}
                  >
                    <span className="w-16 font-bold">{dateFormatMonthLabel(monthSummary.month)}</span>
                    <span className="text-muted-foreground flex-1 text-sm">
                      {monthSummary.month}月・{statusLabel}
                    </span>
                    {isCurrentMonth && <CBadge tone="blue">今月</CBadge>}
                    <ChevronRightIcon className="text-muted-foreground size-4" />
                  </Link>
                </li>
              );
            })}
          </ul>
        ),
      };
    })}
  />
);

export default RecordsYearAccordion;
