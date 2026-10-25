import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/zShadcnBase/tabs";

/** タブの1項目 */
export type CTabsItem = {
  /** 識別子 */
  value: string;
  /** タブのラベル */
  label: string;
  /** タブの内容 */
  content: ReactNode;
};

/** CTabs の Props */
type Props = {
  /** タブ一覧 */
  items: CTabsItem[];
  /** 選択中のタブ */
  value: string;
  /** タブ切り替え時に呼ばれる */
  onValueChange: (value: string) => void;
};

/** 横幅いっぱいに並ぶタブ切り替え */
const CTabs = ({ items, value, onValueChange }: Props) => (
  <div>
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList className="w-full">
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.value} value={item.value} className="mt-4">
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  </div>
);

export default CTabs;
