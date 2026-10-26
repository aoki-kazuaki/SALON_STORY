import { cn } from "@/lib/shadcn/utils";
import type { StoryBadgeVariant, StoryDensity } from "@/types";

/** CapsuleBadge の Props */
type Props = {
  /** ピル内に表示する日付ラベル (例: "10/25") */
  label: string;
  /** 日付ラベルに続けて表示するメモの各行 (1行ごとに改行されないかたまりとして横に並べ、収まらなければ折り返す) */
  descriptionLines: string[];
  /** 左端の丸バッジ内に表示する記号 (例: "日") */
  markText: string;
  /** 表示バリアント (current: 当月 / future: 次月以降) */
  variant: StoryBadgeVariant;
  /** 表示密度 (lg: 大 / md: 中 / sm: 小) */
  density: StoryDensity;
};

/** バリアントごとの配色クラス (current: 白背景黒文字 / future: 黒背景白文字、丸バッジは反転配色) */
const VARIANT_CLASS_NAMES: Record<StoryBadgeVariant, { pill: string; mark: string }> = {
  current: { pill: "bg-white text-black", mark: "bg-black text-white" },
  future: { pill: "bg-black text-white", mark: "bg-white text-black" },
};

/**
 * 表示密度ごとのサイズクラス
 * - 単位 `--u` はキャンバス幅の 1% (1cqw) × 自動縮小率。キャンバス外で使う場合は 1cqw として扱う
 */
const DENSITY_CLASS_NAMES: Record<StoryDensity, { pill: string; mark: string; text: string; lines: string }> = {
  lg: {
    pill: "gap-[calc(var(--u,1cqw)*2.6)] rounded-[calc(var(--u,1cqw)*6.5)] py-[calc(var(--u,1cqw)*2)] pr-[calc(var(--u,1cqw)*4.5)] pl-[calc(var(--u,1cqw)*2)]",
    mark: "size-[calc(var(--u,1cqw)*8.6)] text-[length:calc(var(--u,1cqw)*3.8)]",
    text: "gap-x-[calc(var(--u,1cqw)*2.8)] text-[length:calc(var(--u,1cqw)*4.8)]",
    lines: "gap-x-[calc(var(--u,1cqw)*2.6)]",
  },
  md: {
    pill: "gap-[calc(var(--u,1cqw)*1.8)] rounded-[calc(var(--u,1cqw)*5)] py-[calc(var(--u,1cqw)*1.4)] pr-[calc(var(--u,1cqw)*3)] pl-[calc(var(--u,1cqw)*1.4)]",
    mark: "size-[calc(var(--u,1cqw)*6.6)] text-[length:calc(var(--u,1cqw)*3)]",
    text: "gap-x-[calc(var(--u,1cqw)*1.8)] text-[length:calc(var(--u,1cqw)*3.6)]",
    lines: "gap-x-[calc(var(--u,1cqw)*1.8)]",
  },
  sm: {
    pill: "gap-[calc(var(--u,1cqw)*1.4)] rounded-[calc(var(--u,1cqw)*4.2)] py-[calc(var(--u,1cqw)*1.1)] pr-[calc(var(--u,1cqw)*2.4)] pl-[calc(var(--u,1cqw)*1.1)]",
    mark: "size-[calc(var(--u,1cqw)*5.6)] text-[length:calc(var(--u,1cqw)*2.6)]",
    text: "gap-x-[calc(var(--u,1cqw)*1.4)] text-[length:calc(var(--u,1cqw)*3.1)]",
    lines: "gap-x-[calc(var(--u,1cqw)*1.4)]",
  },
};

/**
 * 空き枠1件を表す角丸ピル形状のカプセルバッジ
 * - メモは行単位のかたまりで横に並べ、幅が足りなければ次の段へ折り返す (文字を省略しない)
 * - 1行が長すぎる場合はかたまりの中でも折り返す
 * - サイズはキャンバス幅基準 (cqw) × 自動縮小率で指定し、キャンバスの拡大縮小に追従する
 */
const CapsuleBadge = ({ label, descriptionLines, markText, variant, density }: Props) => (
  <span
    data-variant={variant}
    data-density={density}
    className={cn(
      "flex w-full items-center shadow-md",
      VARIANT_CLASS_NAMES[variant].pill,
      DENSITY_CLASS_NAMES[density].pill,
    )}
  >
    <span
      className={cn(
        "flex shrink-0 items-center justify-center self-start rounded-full leading-none font-bold",
        VARIANT_CLASS_NAMES[variant].mark,
        DENSITY_CLASS_NAMES[density].mark,
      )}
    >
      {markText}
    </span>
    <span className={cn("flex min-w-0 flex-1 items-baseline leading-snug", DENSITY_CLASS_NAMES[density].text)}>
      <span className="shrink-0 font-bold tabular-nums">{label}</span>
      <span className={cn("flex min-w-0 flex-1 flex-wrap", DENSITY_CLASS_NAMES[density].lines)}>
        {descriptionLines.map((line, index) => (
          <span key={`${index}-${line}`} className="max-w-full font-medium break-words tabular-nums">
            {line}
          </span>
        ))}
      </span>
    </span>
  </span>
);

export default CapsuleBadge;
