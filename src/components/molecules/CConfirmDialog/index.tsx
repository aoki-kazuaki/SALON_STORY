import type { ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/zShadcnBase/alert-dialog";

/** CConfirmDialog の Props */
type Props = {
  /** 表示状態 */
  open: boolean;
  /** 表示状態の変更時に呼ばれる (キャンセル・背景クリック時は false) */
  onOpenChange: (open: boolean) => void;
  /** 見出し */
  title: string;
  /** 説明文 */
  description: string;
  /** 確定ボタンのラベル */
  confirmLabel?: string;
  /** 確定ボタンを破壊的操作の配色にするか */
  isDestructive?: boolean;
  /** 確定ボタン押下時に呼ばれる */
  onConfirm: () => void;
  /** 説明文の下に表示する追加内容 (新旧比較など) */
  children?: ReactNode;
};

/** 確定操作の前に表示する確認ダイアログ */
const CConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "OK",
  isDestructive = false,
  onConfirm,
  children = null,
}: Props) => {
  const confirmVariant = isDestructive ? "destructive" : "default";

  return (
    <div className="contents">
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-wrap">{description}</AlertDialogDescription>
          </AlertDialogHeader>
          {children}
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction variant={confirmVariant} onClick={onConfirm}>
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CConfirmDialog;
