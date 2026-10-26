"use client";

import { EyeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import CButton from "@/components/atoms/CButton";
import CTabs from "@/components/molecules/CTabs";
import EditorBackgroundPicker from "@/components/organisms/Editor/EditorBackgroundPicker";
import EditorFullscreen from "@/components/organisms/Editor/EditorFullscreen";
import EditorPreviewPanel from "@/components/organisms/Editor/EditorPreviewPanel";
import EditorRangePanel from "@/components/organisms/Editor/EditorRangePanel";
import EditorSlotList from "@/components/organisms/Editor/EditorSlotList";
import DashboardPageLayout from "@/components/template/DashboardPageLayout";
import { FALLBACK_BACKGROUND_IMAGE_URL } from "@/constants/sample";
import { apiGet } from "@/lib/api/client";
import { useEditorStore } from "@/stores/editorStore";
import type { BackgroundSlot, ScheduleYearSummary } from "@/types";
import type { ResGetBackgroundList } from "@/types/api/background/list";
import type { ResGetEditorSetting } from "@/types/api/editor/setting";
import type { ResGetLegendDetail } from "@/types/api/legend/detail";
import type { ResGetScheduleList } from "@/types/api/schedule/list";
import type { ResGetScheduleSummary } from "@/types/api/schedule/summary";
import { arrayBuildMonthOptions, arrayBuildStoryBadgeItems } from "@/utils/array";
import { dateTodayKey } from "@/utils/date";
import { objectBuildEditorRange } from "@/utils/object";
import { stringResolveBackgroundUrl, stringResolveDefaultTargetMonth } from "@/utils/string";

/** エディタのタブ識別子 */
type EditorTab = "edit" | "preview";

/** ストーリーズ画像エディタ */
const EditorPage = () => {
  const [activeTab, setActiveTab] = useState<EditorTab>("edit");
  const [todayKey, setTodayKey] = useState("");
  const [years, setYears] = useState<ScheduleYearSummary[]>([]);
  const [slots, setSlots] = useState<BackgroundSlot[]>([]);
  const [legendText, setLegendText] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const rangeMode = useEditorStore((state) => state.rangeMode);
  const targetMonth = useEditorStore((state) => state.targetMonth);
  const includePastDates = useEditorStore((state) => state.includePastDates);
  const periodStartDate = useEditorStore((state) => state.periodStartDate);
  const periodDays = useEditorStore((state) => state.periodDays);
  const excludedDateKeys = useEditorStore((state) => state.excludedDateKeys);
  const selectedSlotNumber = useEditorStore((state) => state.selectedSlotNumber);
  const memos = useEditorStore((state) => state.memos);
  const fetchedRangeKey = useEditorStore((state) => state.fetchedRangeKey);
  const setMemos = useEditorStore((state) => state.setMemos);

  // 初期化: 登録済み月・背景スロット・選択中の背景・凡例テキストを並列取得
  useEffect(() => {
    const initialize = async () => {
      const today = dateTodayKey();
      const [summary, backgrounds, setting, legend] = await Promise.all([
        apiGet<ResGetScheduleSummary>("/api/schedule/summary", {}),
        apiGet<ResGetBackgroundList>("/api/background/list", {}),
        apiGet<ResGetEditorSetting>("/api/editor/setting", {}),
        apiGet<ResGetLegendDetail>("/api/legend/detail", {}),
      ]);
      setTodayKey(today);
      if (backgrounds.ok) setSlots(backgrounds.data.slots);
      if (legend.ok) setLegendText(legend.data.legend.content);
      if (setting.ok) useEditorStore.getState().setSelectedSlotNumber(setting.data.selectedSlotNumber);
      if (!summary.ok) {
        toast.error(summary.error.message);
        return;
      }
      setYears(summary.data.years);
      if (!(useEditorStore.getState().targetMonth === "")) return;
      const monthKeys = arrayBuildMonthOptions(summary.data.years).map((option) => option.value);
      useEditorStore.getState().setTargetMonth(stringResolveDefaultTargetMonth(monthKeys, today));
    };
    initialize();
  }, []);

  const range = objectBuildEditorRange(
    { rangeMode, targetMonth, includePastDates, periodStartDate, periodDays },
    todayKey,
  );
  const rangeKey = `${range.startDate}_${range.endDate}`;
  /** 抽出期間が確定しているかどうかの判定フラグ */
  const hasRange: boolean = !(todayKey === "") && !(range.startDate === "");

  // 差分比較: 取得済みの抽出期間と同一なら通信せず、ローカルの State で即時描画する
  useEffect(() => {
    if (!hasRange) return;
    if (fetchedRangeKey === rangeKey) return;
    const fetchMemos = async () => {
      const result = await apiGet<ResGetScheduleList>("/api/schedule/list", {
        startDate: range.startDate,
        endDate: range.endDate,
      });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      setMemos(rangeKey, result.data.memos);
    };
    fetchMemos();
  }, [hasRange, fetchedRangeKey, rangeKey, range.startDate, range.endDate, setMemos]);

  /** メモを取得中かどうかの判定フラグ */
  const isMemoLoading: boolean = hasRange && !(fetchedRangeKey === rangeKey);
  const visibleMemos = memos.filter((memo) => memo.dateKey >= range.startDate && memo.dateKey <= range.endDate);
  const backgroundImageUrl = stringResolveBackgroundUrl(slots, selectedSlotNumber, FALLBACK_BACKGROUND_IMAGE_URL);
  const canvas = {
    backgroundImageUrl,
    items: arrayBuildStoryBadgeItems(visibleMemos, excludedDateKeys, todayKey),
    legendTitle: "",
    legendText,
  };

  return (
    <DashboardPageLayout
      title="ストーリーズエディタ"
      description="空き枠と背景を選んで、Instagram ストーリーズ (9:16) の告知画像を作成します。"
    >
      <CTabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as EditorTab)}
        items={[
          {
            value: "edit",
            label: "編集・選択",
            content: (
              <div className="grid gap-4">
                <EditorRangePanel monthOptions={arrayBuildMonthOptions(years)} todayKey={todayKey} />
                <EditorSlotList memos={visibleMemos} isLoading={isMemoLoading} />
                <EditorBackgroundPicker slots={slots} activeImageUrl={backgroundImageUrl} />
                <CButton size="lg" onClick={() => setActiveTab("preview")}>
                  <EyeIcon />
                  プレビューを見る
                </CButton>
              </div>
            ),
          },
          {
            value: "preview",
            label: "プレビュー・保存",
            content: <EditorPreviewPanel canvas={canvas} onOpenFullscreen={() => setIsFullscreen(true)} />,
          },
        ]}
      />
      {isFullscreen && <EditorFullscreen canvas={canvas} onClose={() => setIsFullscreen(false)} />}
    </DashboardPageLayout>
  );
};

export default EditorPage;
