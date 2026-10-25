import type { ReactNode } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/zShadcnBase/accordion";
import { cn } from "@/lib/shadcn/utils";

/** アコーディオンの1項目 */
export type CAccordionItem = {
  /** 開閉状態の識別子 */
  value: string;
  /** 見出し部分 */
  trigger: ReactNode;
  /** 開いたときの内容 */
  content: ReactNode;
};

/** CAccordion の Props */
type Props = {
  /** 項目一覧 */
  items: CAccordionItem[];
  /** 開いている項目の value 一覧 */
  value: string[];
  /** 開閉状態の変更時に呼ばれる */
  onValueChange: (value: string[]) => void;
  /** 追加のクラス名 */
  className?: string;
};

/** 複数同時に開閉できるアコーディオン (開閉状態は親で管理) */
const CAccordion = ({ items, value, onValueChange, className = "" }: Props) => (
  <div className={cn("bg-card rounded-xl border px-4 shadow-sm", className)}>
    <Accordion type="multiple" value={value} onValueChange={onValueChange}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger className="items-center hover:no-underline">{item.trigger}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

export default CAccordion;
