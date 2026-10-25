import type { ReactNode } from "react";

import Container from "@/components/molecules/Container";

/** DashboardLayout の Props */
type Props = {
  /** 固定ヘッダー */
  header: ReactNode;
  /** マウント時の共通初期化 (描画なし) */
  initializer: ReactNode;
  /** パンくずリスト */
  breadcrumb: ReactNode;
  /** ページ本文 */
  children: ReactNode;
};

/** ダッシュボード配下の共通レイアウト (固定ヘッダー ＋ パンくず ＋ 本文) */
const DashboardLayout = ({ header, initializer, breadcrumb, children }: Props) => (
  <>
    {initializer}
    {header}
    <main className="flex-1 pt-20 pb-16">
      <Container>
        <div className="mb-4">{breadcrumb}</div>
        {children}
      </Container>
    </main>
  </>
);

export default DashboardLayout;
