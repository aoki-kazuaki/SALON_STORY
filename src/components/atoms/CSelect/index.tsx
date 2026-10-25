import type { ComponentProps } from "react";

import { cn } from "@/lib/shadcn/utils";

/** セレクトの選択肢 */
export type CSelectOption = {
  /** 値 */
  value: string;
  /** 表示ラベル */
  label: string;
};

/** CSelect の Props */
type Props = Omit<ComponentProps<"select">, "children"> & {
  /** 選択肢一覧 */
  options: CSelectOption[];
};

/** ネイティブのセレクトボックス (iOS ではドラムロールピッカーで選択) */
const CSelect = ({ options, className = "", ...props }: Props) => (
  <select
    className={cn(
      "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export default CSelect;
