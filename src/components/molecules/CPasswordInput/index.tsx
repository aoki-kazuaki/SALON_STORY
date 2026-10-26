"use client";

import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, useState } from "react";

import CInput from "@/components/atoms/CInput";
import { cn } from "@/lib/shadcn/utils";

/** CPasswordInput の Props (type 以外は CInput と同一、react-hook-form の register をそのまま展開可能) */
type Props = Omit<ComponentProps<typeof CInput>, "type">;

/**
 * パスワード入力 (右端の目アイコンで入力中のパスワードの表示・非表示を切り替え)
 * - 表示切替は見た目のみの UI 状態のため、コンポーネント内で保持する
 */
const CPasswordInput = ({ className, ...props }: Props) => {
  const [isVisible, setIsVisible] = useState(false);

  const inputType = isVisible ? "text" : "password";
  const toggleLabel = isVisible ? "パスワードを隠す" : "パスワードを表示";

  return (
    <div className="relative">
      <CInput type={inputType} className={cn("pr-10", className)} {...props} />
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
        aria-label={toggleLabel}
        aria-pressed={isVisible}
        disabled={props.disabled}
        onClick={() => setIsVisible((current) => !current)}
      >
        {isVisible && <EyeOff className="size-4" aria-hidden />}
        {!isVisible && <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  );
};

export default CPasswordInput;
