"use client";

import { CalendarDaysIcon, CalendarRangeIcon } from "lucide-react";

import CButton from "@/components/atoms/CButton";
import CInput from "@/components/atoms/CInput";
import CLabel from "@/components/atoms/CLabel";
import CSelect, { type CSelectOption } from "@/components/atoms/CSelect";
import CSwitch from "@/components/atoms/CSwitch";
import CCard from "@/components/molecules/CCard";
import { EDITOR_PERIOD_DAY_PRESETS } from "@/constants/app";
import { useEditorStore } from "@/stores/editorStore";
import type { EditorRangeMode } from "@/types";

/** EditorRangePanel の Props */
type Props = {
  /** 月指定で選択できる登録済み月 */
  monthOptions: CSelectOption[];
  /** 今日の日付キー (期間指定の開始日未選択時の表示に利用) */
  todayKey: string;
};

/** 選択方式の切り替えボタン */
const RANGE_MODE_OPTIONS: { value: EditorRangeMode; label: string; icon: typeof CalendarDaysIcon }[] = [
  { value: "month", label: "月指定", icon: CalendarDaysIcon },
  { value: "period", label: "期間指定", icon: CalendarRangeIcon },
];

/** ① 期間・日付の選択 (月指定: 登録済み月 ＋ 過去日トグル / 期間指定: 開始日 ＋ 日数プリセット) */
const EditorRangePanel = ({ monthOptions, todayKey }: Props) => {
  const rangeMode = useEditorStore((state) => state.rangeMode);
  const targetMonth = useEditorStore((state) => state.targetMonth);
  const includePastDates = useEditorStore((state) => state.includePastDates);
  const periodStartDate = useEditorStore((state) => state.periodStartDate);
  const periodDays = useEditorStore((state) => state.periodDays);
  const setRangeMode = useEditorStore((state) => state.setRangeMode);
  const setTargetMonth = useEditorStore((state) => state.setTargetMonth);
  const setIncludePastDates = useEditorStore((state) => state.setIncludePastDates);
  const setPeriodStartDate = useEditorStore((state) => state.setPeriodStartDate);
  const setPeriodDays = useEditorStore((state) => state.setPeriodDays);

  /** 月指定モードかどうかの判定フラグ */
  const isMonthMode: boolean = rangeMode === "month";
  /** 期間指定モードかどうかの判定フラグ */
  const isPeriodMode: boolean = rangeMode === "period";
  /** 選択できる登録済み月が存在するかどうかの判定フラグ */
  const hasMonthOptions: boolean = monthOptions.length > 0;

  return (
    <CCard title="① 期間・日付を選択">
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-2">
          {RANGE_MODE_OPTIONS.map((option) => {
            const variant = rangeMode === option.value ? "default" : "outline";
            return (
              <CButton key={option.value} variant={variant} onClick={() => setRangeMode(option.value)}>
                <option.icon />
                {option.label}
              </CButton>
            );
          })}
        </div>

        {isMonthMode && (
          <div className="grid gap-3">
            {hasMonthOptions && (
              <CSelect
                aria-label="対象月"
                options={monthOptions}
                value={targetMonth}
                onChange={(event) => setTargetMonth(event.target.value)}
              />
            )}
            {!hasMonthOptions && (
              <p className="text-muted-foreground text-sm">登録済みのメモがありません。先にメモを入力してください。</p>
            )}
            <div className="bg-muted flex items-center justify-between rounded-lg px-3 py-2">
              <CLabel htmlFor="editor-include-past">過去日を含める</CLabel>
              <CSwitch id="editor-include-past" checked={includePastDates} onCheckedChange={setIncludePastDates} />
            </div>
          </div>
        )}

        {isPeriodMode && (
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <CLabel htmlFor="editor-period-start">開始日</CLabel>
              <CInput
                id="editor-period-start"
                type="date"
                value={periodStartDate ?? todayKey}
                onChange={(event) => setPeriodStartDate(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <p className="text-sm font-medium">日数 (最大{EDITOR_PERIOD_DAY_PRESETS.at(-1)}日)</p>
              <div className="grid grid-cols-4 gap-2">
                {EDITOR_PERIOD_DAY_PRESETS.map((days) => {
                  const variant = periodDays === days ? "default" : "outline";
                  return (
                    <CButton key={days} size="sm" variant={variant} onClick={() => setPeriodDays(days)}>
                      {days}日
                    </CButton>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </CCard>
  );
};

export default EditorRangePanel;
