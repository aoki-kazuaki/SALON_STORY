"use client";

import CapsuleBadge from "@/components/atoms/CapsuleBadge";
import LegendCard from "@/components/molecules/LegendCard";
import { useFitScale } from "@/hooks/useFitScale";
import { cn } from "@/lib/shadcn/utils";
import type { StoryBadgeItem, StoryDensity } from "@/types";
import { stringResolveStoryDensity } from "@/utils/string";

/** StoryCanvas の Props */
type Props = {
  /** 背景画像URL ("" の場合はグラデーション背景のみ) */
  backgroundImageUrl: string;
  /** カプセルバッジ一覧 (2列表示時は左列→右列の順に配置) */
  items: StoryBadgeItem[];
  /** 凡例カードの見出し ("" の場合は非表示) */
  legendTitle: string;
  /** 凡例カードの本文 (改行を含む、空の場合はカードごと非表示) */
  legendText: string;
  /** 自動縮小の下限まで縮めても収まらない状態になった / 解消したときに呼ばれる */
  onOverflowChange?: (isOverflowing: boolean) => void;
};

/** onOverflowChange 未指定時の既定値 (何もしない) */
const noop = () => {};

/** 自動縮小の下限 (これ以上小さくすると文字が読めなくなるため) */
const MIN_FIT_SCALE = 0.55;

/** 表示密度ごとのバッジ一覧の列構成 (lg: 1列 / md・sm: 左右2列、間隔も自動縮小率に連動) */
const DENSITY_LIST_CLASS_NAMES: Record<StoryDensity, { list: string; item: string }> = {
  lg: { list: "columns-1", item: "mb-[calc(var(--u)*3)]" },
  md: { list: "columns-2 gap-x-[calc(var(--u)*3)]", item: "mb-[calc(var(--u)*2.2)]" },
  sm: { list: "columns-2 gap-x-[calc(var(--u)*2.4)]", item: "mb-[calc(var(--u)*1.6)]" },
};

/**
 * Instagram ストーリーズ (9:16) の告知キャンバス
 * - 背景画像 ＋ カプセルバッジ一覧 ＋ 下部凡例カードで構成し、1画面に収める
 * - バッジ件数に応じて列数・文字サイズを切り替え (6件以下: 1列・大 / 12件以下: 2列・中 / それ以上: 2列・小)
 * - それでも高さが足りない場合は、収まるまでバッジ一覧全体を自動縮小 (下限 55%)
 * - 上下は Instagram のプロフィール表示・返信欄と重ならないよう余白を確保
 * - コンテナクエリ (@container / cqw) により表示幅に比例して全要素が拡大縮小する
 */
const StoryCanvas = ({ backgroundImageUrl, items, legendTitle, legendText, onOverflowChange = noop }: Props) => {
  /** 背景画像を描画するかどうかの判定フラグ */
  const hasBackgroundImage: boolean = !(backgroundImageUrl === "");
  /** 凡例カードを表示するかどうかの判定フラグ (本文が空白のみの場合も非表示) */
  const hasLegend: boolean = !(legendText.trim() === "");
  const density = stringResolveStoryDensity(items.length);
  /** 表示内容が変わったときに自動縮小を再計算するためのキー */
  const fitContentKey = JSON.stringify([items, legendTitle, legendText]);
  const fitAreaRef = useFitScale<HTMLDivElement>(MIN_FIT_SCALE, fitContentKey, onOverflowChange);

  return (
    <div
      data-testid="story-canvas"
      data-density={density}
      className="@container relative aspect-[9/16] w-full overflow-hidden bg-linear-to-b from-stone-400 via-stone-500 to-stone-700"
    >
      {hasBackgroundImage && (
        <div
          data-testid="story-canvas-background"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${backgroundImageUrl}")` }}
        />
      )}
      <div className="absolute inset-0 bg-linear-to-b from-black/25 via-black/5 to-black/25" />

      <div className="relative flex h-full flex-col gap-[4cqw] px-[5cqw] pt-[18cqw] pb-[12cqw]">
        <div
          ref={fitAreaRef}
          data-testid="story-canvas-fit-area"
          className="flex min-h-0 flex-1 flex-col overflow-hidden [--u:calc(1cqw*var(--fit-scale,1))]"
        >
          <ul className={cn("my-auto", DENSITY_LIST_CLASS_NAMES[density].list)}>
            {items.map((item) => (
              <li key={item.dateKey} className={cn("break-inside-avoid", DENSITY_LIST_CLASS_NAMES[density].item)}>
                <CapsuleBadge
                  label={item.label}
                  descriptionLines={item.descriptionLines}
                  markText={item.markText}
                  variant={item.variant}
                  density={density}
                />
              </li>
            ))}
          </ul>
        </div>

        {hasLegend && <LegendCard title={legendTitle} text={legendText} />}
      </div>
    </div>
  );
};

export default StoryCanvas;
