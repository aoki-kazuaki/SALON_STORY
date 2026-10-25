"use client";

import { usePathname } from "next/navigation";

import CBreadcrumb from "@/components/molecules/CBreadcrumb";
import { arrayBuildBreadcrumbs } from "@/utils/array";

/** 現在のパスから生成したパンくずリスト */
const AppBreadcrumb = () => {
  const pathname = usePathname();
  return <CBreadcrumb items={arrayBuildBreadcrumbs(pathname)} />;
};

export default AppBreadcrumb;
