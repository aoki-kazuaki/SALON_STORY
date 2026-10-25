import Link from "next/link";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/zShadcnBase/breadcrumb";
import type { BreadcrumbItem as BreadcrumbItemType } from "@/types";

/** CBreadcrumb の Props */
type Props = {
  /** パンくず一覧 (末尾が現在ページ) */
  items: BreadcrumbItemType[];
};

/** パンくずリスト (末尾は現在ページとしてリンクなしで表示) */
const CBreadcrumb = ({ items }: Props) => (
  <div>
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          /** 現在ページ (末尾) かどうかの判定フラグ */
          const isCurrentPage: boolean = index === items.length - 1;
          /** 区切り記号を表示するかどうかの判定フラグ */
          const hasSeparator: boolean = index > 0;
          return (
            <Fragment key={item.href}>
              {hasSeparator && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isCurrentPage && <BreadcrumbPage>{item.label}</BreadcrumbPage>}
                {!isCurrentPage && (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  </div>
);

export default CBreadcrumb;
