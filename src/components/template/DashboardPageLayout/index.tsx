import type { ReactNode } from "react";

/** DashboardPageLayout の Props */
type Props = {
  /** ページ見出し */
  title: string;
  /** ページ説明 */
  description: string;
  /** 見出し右側の操作 (一括操作バー等) */
  actions?: ReactNode;
  /** 本文 */
  children: ReactNode;
  /** 下部の遷移導線 */
  footer?: ReactNode;
};

/** ダッシュボード配下の各ページ共通レイアウト (見出し ＋ 本文 ＋ 下部導線) */
const DashboardPageLayout = ({ title, description, actions = null, children, footer = null }: Props) => (
  <div className="grid gap-6">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </div>
    <div className="grid gap-4">{children}</div>
    <div className="flex flex-wrap justify-center gap-3">{footer}</div>
  </div>
);

export default DashboardPageLayout;
