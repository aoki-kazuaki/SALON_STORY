import { Suspense, type ReactNode } from "react";

import AppBreadcrumb from "@/components/organisms/App/AppBreadcrumb";
import AppHeader from "@/components/organisms/App/AppHeader";
import AppInitializer from "@/components/organisms/App/AppInitializer";
import DashboardLayout from "@/components/template/DashboardLayout";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <DashboardLayout
      initializer={
        <Suspense>
          <AppInitializer />
        </Suspense>
      }
      header={
        <Suspense>
          <AppHeader />
        </Suspense>
      }
      breadcrumb={
        <Suspense>
          <AppBreadcrumb />
        </Suspense>
      }
    >
      {children}
    </DashboardLayout>
  );
}
