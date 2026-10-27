import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/zShadcnBase/dialog";

/** CDialog の Props */
type Props = {
  /** 表示状態 */
  open: boolean;
  /** 表示状態の変更時に呼ばれる */
  onOpenChange: (open: boolean) => void;
  /** 見出し */
  title: string;
  /** 説明文 */
  description: string;
  /** 本文 (フォーム等) */
  children: ReactNode;
  /** フッター (操作ボタン等) */
  footer?: ReactNode;
  /** 表示時に先頭の入力欄へ自動フォーカスしないか (iOS でキーボード・ピッカーが勝手に開くのを防ぐ) */
  isAutoFocusDisabled?: boolean;
};

/**
 * 表示時の初回フォーカスの制御
 * - true: 入力欄ではなくダイアログ自体にフォーカスする (フォーカスはダイアログ内に保ちつつ、キーボードを開かない)
 * - false: 既定動作 (先頭の入力欄にフォーカス)
 */
const OPEN_AUTO_FOCUS_HANDLERS: Record<"true" | "false", (event: Event) => void> = {
  true: (event) => {
    event.preventDefault();
    (event.currentTarget as HTMLElement | null)?.focus();
  },
  false: () => {},
};

/** 入力フォーム等を表示する汎用ダイアログ */
const CDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer = null,
  isAutoFocusDisabled = false,
}: Props) => (
  <div className="contents">
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto"
        onOpenAutoFocus={OPEN_AUTO_FOCUS_HANDLERS[String(isAutoFocusDisabled) as "true" | "false"]}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
);

export default CDialog;
