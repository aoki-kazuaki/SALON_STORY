import type { ReactNode } from "react";

import CLabel from "@/components/atoms/CLabel";

/** CFormField の Props */
type Props = {
  /** 入力欄の id (ラベルとの関連付けに利用) */
  htmlFor: string;
  /** ラベル */
  label: string;
  /** 入力欄 */
  children: ReactNode;
  /** エラーメッセージ ("" の場合は非表示) */
  error?: string;
  /** 補足説明 ("" の場合は非表示) */
  hint?: string;
};

/** ラベル・入力欄・エラーメッセージをまとめたフォーム項目 */
const CFormField = ({ htmlFor, label, children, error = "", hint = "" }: Props) => {
  /** エラーメッセージを表示するかどうかの判定フラグ */
  const hasError: boolean = !(error === "");
  /** 補足説明を表示するかどうかの判定フラグ */
  const hasHint: boolean = !(hint === "");

  return (
    <div className="grid gap-1.5">
      <CLabel htmlFor={htmlFor}>{label}</CLabel>
      {children}
      {hasHint && <p className="text-muted-foreground text-xs">{hint}</p>}
      {hasError && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
};

export default CFormField;
