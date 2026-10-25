"use client";

import { useEffect, type ComponentProps } from "react";

import StoryCanvas from "@/components/molecules/StoryCanvas";

/** EditorFullscreen の Props */
type Props = {
  /** キャンバスに渡す Props */
  canvas: ComponentProps<typeof StoryCanvas>;
  /** 全画面表示を解除する */
  onClose: () => void;
};

/**
 * 端末スクリーンショット用の全画面プレビュー
 * - 画面に収まる最大サイズの 9:16 キャンバスを黒背景の中央に表示
 * - シングルタップ (または Esc キー) で解除
 */
const EditorFullscreen = ({ canvas, onClose }: Props) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label="全画面プレビュー (タップで解除)"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={onClose}
    >
      <div style={{ width: "min(100vw, calc(100dvh * 9 / 16))" }}>
        <StoryCanvas {...canvas} />
      </div>
    </div>
  );
};

export default EditorFullscreen;
