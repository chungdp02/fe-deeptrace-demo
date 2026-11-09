import type { CSSProperties } from "react";
import { SidebarToggle } from "./sidebar-toggle";
import { Outlet } from "react-router";
import {
  SidebarProvider,
  SidebarInset,
} from "@workspace/ui/components/sidebar";
import { AppSidebar } from "./app-sidebar";
import { useTraceability } from "../../app/providers/traceability-provider";

export function DashboardLayout() {
  const { storageError, warning } = useTraceability();

  return (
    <SidebarProvider
      className="admin-shell min-h-svh"
      style={{ "--sidebar-width-icon": "4.5rem" } as CSSProperties}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-md focus:bg-background focus:p-3 focus:ring-2"
      >
        Bỏ qua menu, đến nội dung
      </a>
      <AppSidebar />
      <SidebarInset
        id="main-content"
        tabIndex={-1}
        className="min-w-0 bg-background shadow-none"
      >
        <div
          data-slot="page-content"
          className="min-w-0 flex-1 p-4 sm:p-6 lg:p-7"
        >
          <div className="mb-4 md:hidden">
            <SidebarToggle />
          </div>
          {(storageError || warning) && (
            <p
              role="alert"
              className="mb-5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {storageError || warning}
            </p>
          )}
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
