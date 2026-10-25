import type { ReactNode } from "react";

import { cn } from "@/lib/shadcn/utils";

/** Container の Props */
type Props = {
  /** 内容 */
  children: ReactNode;
  /** 追加のクラス名 */
  className?: string;
};

/** ページ内容の最大幅と左右余白を揃えるラッパー */
const Container = ({ children, className = "" }: Props) => (
  <div className={cn("mx-auto w-full max-w-3xl px-4", className)}>{children}</div>
);

export default Container;
