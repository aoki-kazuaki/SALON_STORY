import CapsuleBadge from "@/components/atoms/CapsuleBadge";
import LegendCard from "@/components/molecules/LegendCard";
import type { StoryBadgeItem } from "@/types";

/** StoryCanvas の Props */
type Props = {
  /** 背景画像URL ("" の場合はグラデーション背景のみ) */
  backgroundImageUrl: string;
  /** 見出し上部の小見出し (例: "AVAILABLE") */
  subTitle: string;
  /** 見出し (例: "10月の空き状況") */
  title: string;
  /** 左右2列に並べるカプセルバッジ一覧 (左列→右列の順に配置) */
  items: StoryBadgeItem[];
  /** 凡例カードの見出し */
  legendTitle: string;
  /** 凡例カードの本文 (改行を含む) */
  legendText: string;
};

/**
 * Instagram ストーリーズ (9:16) の告知キャンバス
 * - 背景画像 ＋ 左右2列カプセルバッジ ＋ 下部凡例カードで構成
 * - コンテナクエリ (@container / cqw) により表示幅に比例して全要素が拡大縮小する
 */
const StoryCanvas = ({ backgroundImageUrl, subTitle, title, items, legendTitle, legendText }: Props) => {
  /** 背景画像を描画するかどうかの判定フラグ */
  const hasBackgroundImage: boolean = !(backgroundImageUrl === "");

  return (
    <div
      data-testid="story-canvas"
      className="@container relative aspect-[9/16] w-full overflow-hidden bg-linear-to-b from-stone-400 via-stone-500 to-stone-700"
    >
      {hasBackgroundImage && (
        <div
          data-testid="story-canvas-background"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${backgroundImageUrl}")` }}
        />
      )}
      <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/5 to-black/25" />

      <div className="relative flex h-full flex-col px-[6cqw] pt-[14cqw] pb-[9cqw]">
        <header className="text-center text-white drop-shadow-md">
          <p className="text-[3.2cqw] font-semibold tracking-[0.4em]">{subTitle}</p>
          <h2 className="mt-[1.5cqw] text-[8cqw] leading-tight font-bold tracking-wider">{title}</h2>
        </header>

        <ul className="mt-[7cqw] min-h-0 flex-1 columns-2 gap-x-[3.5cqw]">
          {items.map((item) => (
            <li key={item.dateKey} className="mb-[2.6cqw] break-inside-avoid">
              <CapsuleBadge label={item.label} markText={item.markText} variant={item.variant} />
            </li>
          ))}
        </ul>

        <LegendCard title={legendTitle} text={legendText} />
      </div>
    </div>
  );
};

export default StoryCanvas;
