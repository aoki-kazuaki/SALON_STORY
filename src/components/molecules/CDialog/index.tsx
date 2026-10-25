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
};

/** 入力フォーム等を表示する汎用ダイアログ */
const CDialog = ({ open, onOpenChange, title, description, children, footer = null }: Props) => (
  <div className="contents">
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
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
