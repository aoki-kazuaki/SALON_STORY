"use client";

import { SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import CButton from "@/components/atoms/CButton";
import BackgroundsSlotCard from "@/components/organisms/Backgrounds/BackgroundsSlotCard";
import DashboardPageLayout from "@/components/template/DashboardPageLayout";
import { BACKGROUND_SLOT_NUMBERS } from "@/constants/app";
import { apiGet } from "@/lib/api/client";
import type { BackgroundSlot, BackgroundSlotNumber } from "@/types";
import type { ResGetBackgroundList } from "@/types/api/background/list";

/** 背景画像管理 (1〜5番の固定スロット) */
const BackgroundsPage = () => {
  const [slots, setSlots] = useState<BackgroundSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      const result = await apiGet<ResGetBackgroundList>("/api/background/list", {});
      setIsLoading(false);
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      setSlots(result.data.slots);
    };
    fetchSlots();
  }, []);

  const handleChanged = (slotNumber: BackgroundSlotNumber, slot: BackgroundSlot | null) => {
    setSlots((current) => [
      ...current.filter((item) => !(item.slotNumber === slotNumber)),
      ...[slot].filter((item): item is BackgroundSlot => Boolean(item)),
    ]);
  };

  return (
    <DashboardPageLayout
      title="背景画像管理"
      description="ストーリーズの背景を最大5枚登録できます (JPEG / PNG / WebP・10MBまで、縦長 9:16 推奨)。"
      footer={
        <CButton asChild variant="outline">
          <Link href="/dashboard/editor">
            <SparklesIcon />
            ストーリーズエディタへ
          </Link>
        </CButton>
      }
    >
      {isLoading && <p className="text-muted-foreground text-sm">読み込み中…</p>}
      {!isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {BACKGROUND_SLOT_NUMBERS.map((slotNumber) => (
            <BackgroundsSlotCard
              key={slotNumber}
              slotNumber={slotNumber}
              slot={slots.find((slot) => slot.slotNumber === slotNumber) ?? null}
              onChanged={handleChanged}
            />
          ))}
        </div>
      )}
    </DashboardPageLayout>
  );
};

export default BackgroundsPage;
