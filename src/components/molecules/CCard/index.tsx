import type { ReactNode } from "react";

import { cn } from "@/lib/shadcn/utils";

/** CCard の Props */
type Props = {
  /** 見出し ("" の場合は非表示) */
  title?: string;
  /** 説明文 ("" の場合は非表示) */
  description?: string;
  /** 本文 */
  children: ReactNode;
  /** 追加のクラス名 */
  className?: string;
};

/** 白背景・角丸の汎用カード */
const CCard = ({ title = "", description = "", children, className = "" }: Props) => {
  /** 見出しを表示するかどうかの判定フラグ */
  const hasTitle: boolean = !(title === "");
  /** 説明文を表示するかどうかの判定フラグ */
  const hasDescription: boolean = !(description === "");

  return (
    <div className={cn("bg-card text-card-foreground rounded-xl border p-5 shadow-sm", className)}>
      {hasTitle && <h2 className="text-base font-bold">{title}</h2>}
      {hasDescription && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      <div className="mt-4 first:mt-0">{children}</div>
    </div>
  );
};

export default CCard;
