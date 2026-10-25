"use client";

import { CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";

import CButton from "@/components/atoms/CButton";
import CCard from "@/components/molecules/CCard";
import CConfirmDialog from "@/components/molecules/CConfirmDialog";
import { dateFormatRelative } from "@/utils/date";

/** 承認待ち1件分 */
export type AdminApprovalItem = {
  /** 識別子 (ユーザーID または申請ID) */
  id: string;
  /** ログインID */
  username: string;
  /** メールアドレス */
  email: string;
  /** 登録・申請日時 */
  createdAt: string | null;
};

/** AdminApprovalList の Props */
type Props = {
  /** 見出し */
  title: string;
  /** 説明 */
  description: string;
  /** 承認待ち一覧 */
  items: AdminApprovalItem[];
  /** 相対日時表示の基準日時 */
  baseDateTime: string;
  /** 承認ボタンの確認文言 */
  approveMessage: string;
  /** 承認・却下の確定時に呼ばれる */
  onDecide: (id: string, approve: boolean) => void;
};

/** 確認ダイアログの対象 */
type DecisionTarget = {
  /** 対象の承認待ち */
  item: AdminApprovalItem;
  /** true: 承認 / false: 却下 */
  approve: boolean;
};

/** 承認待ち一覧 (新規登録・PWリセット申請で共通利用) */
const AdminApprovalList = ({ title, description, items, baseDateTime, approveMessage, onDecide }: Props) => {
  const [target, setTarget] = useState<DecisionTarget | null>(null);

  /** 承認待ちが0件かどうかの判定フラグ */
  const isEmpty: boolean = items.length === 0;
  /** 確認ダイアログを表示するかどうかの判定フラグ */
  const isConfirmOpen: boolean = Boolean(target);
  const confirmTitle = target?.approve ? "承認しますか？" : "却下しますか？";
  const confirmLabel = target?.approve ? "承認する" : "却下する";

  const handleConfirm = () => {
    if (!target) return;
    onDecide(target.item.id, target.approve);
    setTarget(null);
  };

  return (
    <CCard title={title} description={description}>
      {isEmpty && <p className="text-muted-foreground text-sm">承認待ちはありません。</p>}
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="font-bold">{item.username}</p>
              <p className="text-muted-foreground truncate text-sm">{item.email}</p>
              <p className="text-muted-foreground text-xs">{dateFormatRelative(item.createdAt ?? "", baseDateTime)}</p>
            </div>
            <div className="flex gap-2">
              <CButton size="sm" onClick={() => setTarget({ item, approve: true })}>
                <CheckIcon />
                承認
              </CButton>
              <CButton size="sm" variant="outline" onClick={() => setTarget({ item, approve: false })}>
                <XIcon />
                却下
              </CButton>
            </div>
          </li>
        ))}
      </ul>
      <CConfirmDialog
        open={isConfirmOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setTarget(null);
        }}
        title={confirmTitle}
        description={`${target?.item.username ?? ""} (${target?.item.email ?? ""})\n${approveMessage}`}
        confirmLabel={confirmLabel}
        isDestructive={!(target?.approve ?? false)}
        onConfirm={handleConfirm}
      />
    </CCard>
  );
};

export default AdminApprovalList;
