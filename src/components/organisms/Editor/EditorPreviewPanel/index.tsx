import { MaximizeIcon } from "lucide-react";
import type { ComponentProps } from "react";

import CButton from "@/components/atoms/CButton";
import StoryCanvas from "@/components/molecules/StoryCanvas";

/** EditorPreviewPanel の Props */
type Props = {
  /** キャンバスに渡す Props */
  canvas: ComponentProps<typeof StoryCanvas>;
  /** 全画面プレビューを開く */
  onOpenFullscreen: () => void;
};

/** プレビュー・保存タブ (キャンバス ＋ 全画面プレビュー導線) */
const EditorPreviewPanel = ({ canvas, onOpenFullscreen }: Props) => (
  <div className="grid justify-items-center gap-4">
    <div className="w-full max-w-[340px] overflow-hidden rounded-2xl shadow-xl">
      <StoryCanvas {...canvas} />
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

export default EditorPreviewPanel;
