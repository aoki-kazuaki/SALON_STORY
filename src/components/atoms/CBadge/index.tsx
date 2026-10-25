import type { ReactNode } from "react";

import { Badge } from "@/components/zShadcnBase/badge";
import { cn } from "@/lib/shadcn/utils";

/** バッジの配色 (blue: 入力済み / gray: 未入力 / green: NEW / orange: UPDATED / dark: 強調) */
export type CBadgeTone = "blue" | "gray" | "green" | "orange" | "dark";

/** CBadge の Props */
type Props = {
  /** 表示内容 */
  children: ReactNode;
  /** 配色 */
  tone: CBadgeTone;
  /** 追加のクラス名 */
  className?: string;
};

/** 配色ごとのクラス名 */
const TONE_CLASS_NAMES: Record<CBadgeTone, string> = {
  blue: "border-transparent bg-blue-600 text-white",
  gray: "border-transparent bg-stone-200 text-stone-600",
  green: "border-transparent bg-emerald-500 text-white",
  orange: "border-transparent bg-orange-500 text-white",
  dark: "border-transparent bg-stone-900 text-white",
};

/** 状態表示用の小さなラベル */
const CBadge = ({ children, tone, className = "" }: Props) => (
  <Badge data-tone={tone} className={cn(TONE_CLASS_NAMES[tone], className)}>
    {children}
  </Badge>
);

export default CBadge;
