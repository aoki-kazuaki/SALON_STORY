"use client";

import { ImageUpIcon, Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

import CButton from "@/components/atoms/CButton";
import CConfirmDialog from "@/components/molecules/CConfirmDialog";
import { BACKGROUND_ACCEPT_CONTENT_TYPES, BACKGROUND_MAX_FILE_BYTES } from "@/constants/app";
import { apiDelete, apiPostForm } from "@/lib/api/client";
import type { BackgroundSlot, BackgroundSlotNumber } from "@/types";
import type { ResDeleteBackgroundDelete } from "@/types/api/background/delete";
import type { ResPostBackgroundUpload } from "@/types/api/background/upload";

/** BackgroundsSlotCard の Props */
type Props = {
  /** スロット番号 */
  slotNumber: BackgroundSlotNumber;
  /** 登録済みの画像 (未登録は null) */
  slot: BackgroundSlot | null;
  /** アップロード・削除後に呼ばれる (削除時は null) */
  onChanged: (slotNumber: BackgroundSlotNumber, slot: BackgroundSlot | null) => void;
};

/**
 * 背景画像スロット1枠分のカード
 * - 登録済み: 9:16 サムネイル ＋ 上書き変更・削除 (S3 / MinIO から物理削除)
 * - 未登録: 点線枠 ＋ アップロードボタン
 */
const BackgroundsSlotCard = ({ slotNumber, slot, onChanged }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!BACKGROUND_ACCEPT_CONTENT_TYPES.includes(file.type)) {
      toast.error("JPEG / PNG / WebP の画像を選択してください");
      return;
    }
    if (file.size > BACKGROUND_MAX_FILE_BYTES) {
      toast.error("10MB 以下の画像を選択してください");
      return;
    }

    const formData = new FormData();
    formData.append("slotNumber", String(slotNumber));
    formData.append("file", file);
    setIsUploading(true);
    const result = await apiPostForm<ResPostBackgroundUpload>("/api/background/upload", formData);
    setIsUploading(false);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success(`スロット${slotNumber}に画像を登録しました`);
    onChanged(slotNumber, result.data.slot);
  };

  const handleDelete = async () => {
    setIsDeleteDialogOpen(false);
    const result = await apiDelete<ResDeleteBackgroundDelete>("/api/background/delete", { slotNumber });
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success(`スロット${slotNumber}の画像を削除しました`);
    onChanged(slotNumber, null);
  };

  return (
    <div className="grid gap-2">
      <p className="text-sm font-bold">スロット {slotNumber}</p>
      <input
        ref={fileInputRef}
        type="file"
        accept={BACKGROUND_ACCEPT_CONTENT_TYPES.join(",")}
        className="hidden"
        aria-label={`スロット${slotNumber}の画像を選択`}
        onChange={handleFileChange}
      />

      {slot && (
        <>
          <div
            role="img"
            aria-label={`スロット${slotNumber}の背景画像`}
            className="relative aspect-[9/16] overflow-hidden rounded-xl border bg-stone-200 bg-cover bg-center shadow-sm"
            style={{ backgroundImage: `url("${slot.imageUrl}")` }}
          >
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                <Loader2Icon className="size-6 animate-spin" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <CButton size="sm" variant="outline" disabled={isUploading} onClick={openFilePicker}>
              <ImageUpIcon />
              上書き変更
            </CButton>
            <CButton size="sm" variant="outline" disabled={isUploading} onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2Icon />
              削除
            </CButton>
          </div>
        </>
      )}

      {!slot && (
        <button
          type="button"
          disabled={isUploading}
          onClick={openFilePicker}
          className="text-muted-foreground hover:text-foreground flex aspect-[9/16] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 text-sm transition hover:border-stone-500 disabled:opacity-60"
        >
          {isUploading && <Loader2Icon className="size-6 animate-spin" />}
          {!isUploading && <PlusIcon className="size-6" />}
          画像をアップロード
        </button>
      )}

      <CConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={`スロット${slotNumber}の画像を削除しますか？`}
        description="画像はストレージから完全に削除され、元に戻せません。"
        confirmLabel="削除"
        isDestructive
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default BackgroundsSlotCard;
