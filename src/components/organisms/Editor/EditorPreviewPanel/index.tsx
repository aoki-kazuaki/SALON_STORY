"use client";

import { MaximizeIcon, TriangleAlertIcon } from "lucide-react";
import { useState, type ComponentProps } from "react";

import CButton from "@/components/atoms/CButton";
import StoryCanvas from "@/components/molecules/StoryCanvas";

/** EditorPreviewPanel の Props */
type Props = {
  /** キャンバスに渡す Props */
  canvas: ComponentProps<typeof StoryCanvas>;
  /** 全画面プレビューを開く */
  onOpenFullscreen: () => void;
};

/**
 * プレビュー・保存タブ (キャンバス ＋ 全画面プレビュー導線)
 * - 自動縮小の下限でも収まりきらない場合は、表示できていない日がある旨を警告する
 */
const EditorPreviewPanel = ({ canvas, onOpenFullscreen }: Props) => {
  const [isOverflowing, setIsOverflowing] = useState(false);

  return (
    <div className="grid justify-items-center gap-4">
      {isOverflowing && (
        <p
          role="alert"
          className="flex w-full max-w-[340px] items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"
        >
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
          空き枠が多すぎて、下の方の日付が1画面に表示しきれていません。「編集・選択」で表示する日のチェックを外すか、期間指定で日数を減らしてください。
        </p>
      )}
      <div className="w-full max-w-[340px] overflow-hidden rounded-2xl shadow-xl">
        <StoryCanvas {...canvas} onOverflowChange={setIsOverflowing} />
      </div>
      <CButton size="lg" className="w-full max-w-[340px]" onClick={onOpenFullscreen}>
        <MaximizeIcon />
        全画面プレビュー
      </CButton>
      <p className="text-muted-foreground max-w-[340px] text-center text-xs">
        全画面表示中に端末のスクリーンショットを撮影し、Instagram
        ストーリーズに投稿してください。画面をタップすると全画面表示を解除します。
      </p>
    </div>
  );
};

export default EditorPreviewPanel;
