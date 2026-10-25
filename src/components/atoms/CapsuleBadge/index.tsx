import { cn } from "@/lib/shadcn/utils";
import type { StoryBadgeVariant } from "@/types";

/** CapsuleBadge の Props */
type Props = {
  /** ピル内に表示する日付ラベル (例: "10/25(日)") */
  label: string;
  /** 左端の丸バッジ内に表示する記号 (例: "◎", "残1") */
  markText: string;
  /** 表示バリアント (current: 当月 / future: 次月以降) */
  variant: StoryBadgeVariant;
};

/** バリアントごとの配色クラス (current: 白背景黒文字 / future: 黒背景白文字、丸バッジは反転配色) */
const VARIANT_CLASS_NAMES: Record<StoryBadgeVariant, { pill: string; mark: string }> = {
  current: { pill: "bg-white text-black", mark: "bg-black text-white" },
  future: { pill: "bg-black text-white", mark: "bg-white text-black" },
};

/**
 * 空き枠1件を表す角丸ピル形状のカプセルバッジ
 * - サイズは親コンテナ幅基準 (cqw) で指定し、キャンバスの拡大縮小に追従する
 */
const CapsuleBadge = ({ label, markText, variant }: Props) => (
  <span
    data-variant={variant}
    className={cn(
      "inline-flex w-full items-center gap-[1.6cqw] rounded-full py-[1.3cqw] pr-[2.6cqw] pl-[1.3cqw] shadow-md",
      VARIANT_CLASS_NAMES[variant].pill,
    )}
  >
    <span
      className={cn(
        "flex size-[6.4cqw] shrink-0 items-center justify-center rounded-full text-[3cqw] leading-none font-bold",
        VARIANT_CLASS_NAMES[variant].mark,
      )}
    >
      {markText}
    </span>
    <span className="truncate text-[3.6cqw] font-semibold">{label}</span>
  </span>
);

export default CapsuleBadge;
