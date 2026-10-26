"use client";

import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import CCard from "@/components/molecules/CCard";
import { apiPost } from "@/lib/api/client";
import { cn } from "@/lib/shadcn/utils";
import { useEditorStore } from "@/stores/editorStore";
import type { BackgroundSlot, BackgroundSlotNumber } from "@/types";
import type { ResPostEditorSetting } from "@/types/api/editor/setting";

/** EditorBackgroundPicker の Props */
type Props = {
  /** 登録済みの背景スロット */
  slots: BackgroundSlot[];
  /** 実際にキャンバスで使用している背景画像URL (フォールバック適用後) */
  activeImageUrl: string;
};

/** ③ 背景画像の選択 (選択結果は DB に保存し、次回以降も引き継ぐ) */
const EditorBackgroundPicker = ({ slots, activeImageUrl }: Props) => {
  const setSelectedSlotNumber = useEditorStore((state) => state.setSelectedSlotNumber);

  const handleSelect = async (slotNumber: BackgroundSlotNumber) => {
    setSelectedSlotNumber(slotNumber);
    const result = await apiPost<ResPostEditorSetting>("/api/editor/setting", { selectedSlotNumber: slotNumber });
    if (!result.ok) toast.error(result.error.message);
  };

  /** 背景画像が1枚も登録されていないかどうかの判定フラグ */
  const isEmpty: boolean = slots.length === 0;

  return (
    <CCard title="③ 背景画像を選択">
      {isEmpty && (
        <p className="text-muted-foreground text-sm">
          背景画像が未登録のため、サンプルのサロン画像を使用します。
          <Link href="/dashboard/backgrounds" className="ml-1 underline">
            背景画像を登録する
          </Link>
        </p>
      )}
      <ul className="grid grid-cols-4 gap-2">
        {slots.map((slot) => {
          /** キャンバスで使用中の背景かどうかの判定フラグ */
          const isActive: boolean = slot.imageUrl === activeImageUrl;
          const ringClass = isActive ? "ring-3 ring-stone-900 ring-offset-2" : "opacity-80 hover:opacity-100";
          return (
            <li key={slot.slotNumber}>
              <button
                type="button"
                aria-label={`スロット${slot.slotNumber}を背景にする`}
                aria-pressed={isActive}
                onClick={() => handleSelect(slot.slotNumber)}
                className={cn(
                  "relative block aspect-[9/16] w-full overflow-hidden rounded-lg bg-stone-200 bg-cover bg-center",
                  ringClass,
                )}
                style={{ backgroundImage: `url("${slot.imageUrl}")` }}
              >
                <span className="absolute top-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">
                  {slot.slotNumber}
                </span>
                {isActive && (
                  <span className="absolute inset-x-0 bottom-1 mx-auto flex size-5 items-center justify-center rounded-full bg-stone-900 text-white">
                    <CheckIcon className="size-3" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </CCard>
  );
};

export default EditorBackgroundPicker;
