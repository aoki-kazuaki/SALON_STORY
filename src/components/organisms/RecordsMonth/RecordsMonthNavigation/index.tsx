import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import CBadge from "@/components/atoms/CBadge";
import CButton from "@/components/atoms/CButton";
import { cn } from "@/lib/shadcn/utils";

/** RecordsMonthNavigation の Props */
type Props = {
  /** 表示中の年月ラベル (例: "2026年10月") */
  label: string;
  /** 表示中の月が今月かどうか */
  isCurrentMonth: boolean;
  /** 前の月のラベル (例: "9月") */
  prevLabel: string;
  /** 前の月の遷移先 ("" は非活性) */
  prevHref: string;
  /** 次の月のラベル (例: "11月") */
  nextLabel: string;
  /** 次の月の遷移先 ("" は非活性。今月から3か月先に到達済みの場合) */
  nextHref: string;
};

/** 月別一覧の前の月・次の月の切り替えバー (今月表示中は背景色を変えて強調する) */
const RecordsMonthNavigation = ({ label, isCurrentMonth, prevLabel, prevHref, nextLabel, nextHref }: Props) => {
  /** 前の月へ遷移できるかどうかの判定フラグ */
  const hasPrev: boolean = !(prevHref === "");
  /** 次の月へ遷移できるかどうかの判定フラグ */
  const hasNext: boolean = !(nextHref === "");
  const colorClassName = isCurrentMonth ? "border-blue-300 bg-blue-50" : "bg-background";

  return (
    <nav
      aria-label="月の切り替え"
      className={cn("flex items-center justify-between gap-2 rounded-lg border p-2", colorClassName)}
    >
      {hasPrev && (
        <CButton asChild variant="outline" size="sm">
          <Link href={prevHref}>
            <ChevronLeftIcon />
            {prevLabel}
          </Link>
        </CButton>
      )}
      {!hasPrev && (
        <CButton variant="outline" size="sm" disabled>
          <ChevronLeftIcon />
          {prevLabel}
        </CButton>
      )}
      <span className="flex items-center gap-2 font-bold">
        {label}
        {isCurrentMonth && <CBadge tone="blue">今月</CBadge>}
      </span>
      {hasNext && (
        <CButton asChild variant="outline" size="sm">
          <Link href={nextHref}>
            {nextLabel}
            <ChevronRightIcon />
          </Link>
        </CButton>
      )}
      {!hasNext && (
        <CButton variant="outline" size="sm" disabled>
          {nextLabel}
          <ChevronRightIcon />
        </CButton>
      )}
    </nav>
  );
};

export default RecordsMonthNavigation;
