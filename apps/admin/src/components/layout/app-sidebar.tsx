import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SidebarToggle } from "./sidebar-toggle";
import { NavLink, useLocation } from "react-router";
import { adminNavigation } from "../../lib/navigation";
import {
  Sidebar,
  useSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";

function AppSidebarLink({
  path,
  label,
  icon: Icon,
}: (typeof adminNavigation)[number]) {
  const { setOpenMobile } = useSidebar();
  const { pathname } = useLocation();
  const isActive =
    path === "/"
      ? pathname === "/"
      : pathname === path || pathname.startsWith(`${path}/`);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={label}
        isActive={isActive}
        render={
          <NavLink
            to={path}
            aria-label={label}
            end
            onClick={() => setOpenMobile(false)}
          />
        }
      >
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const { state, isMobile } = useSidebar();
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const menuId = useId();
  const iconRail = state === "collapsed" && !isMobile;
  const groups = [...new Set(adminNavigation.map((item) => item.group))];
  return (
    <Sidebar collapsible="icon" className="admin-sidebar border-0">
      <SidebarHeader className="admin-sidebar-header shrink-0 flex-row items-center justify-between border-b px-4 py-4 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-3 group-data-[collapsible=icon]:px-0">
        <NavLink
          to="/"
          onClick={() => setOpenMobile(false)}
          aria-label="DeepPro — Tổng quan DeepTrace"
          className="flex min-w-0 flex-col gap-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <img
            src="/brand/deeppro-logo-dark.png"
            alt="DeepPro"
            className="h-auto w-34 max-w-full object-contain group-data-[collapsible=icon]:hidden"
          />
          <img
            src="/brand/deeppro-symbol-dark.png"
            alt="DeepPro"
            className="hidden size-8 shrink-0 object-contain group-data-[collapsible=icon]:block"
          />
          <span className="text-xs font-medium text-inherit opacity-75 group-data-[collapsible=icon]:hidden">
            DeepTrace Quản trị
          </span>
        </NavLink>
        <SidebarToggle />
      </SidebarHeader>
      <SidebarContent
        id="admin-navigation"
        className="admin-sidebar-content px-3 py-3"
      >
        {groups.map((group) => (
          <SidebarGroup key={group} className="admin-nav-group px-0 py-2">
            <button
              type="button"
              aria-expanded={!closed[group]}
              aria-controls={menuId + "-" + groups.indexOf(group)}
              onClick={() =>
                setClosed((previous) => ({
                  ...previous,
                  [group]: !previous[group],
                }))
              }
              className="mb-1 flex min-h-9 w-full items-center justify-between gap-2 rounded px-3 text-left text-xs font-semibold text-inherit opacity-80 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-ring group-data-[collapsible=icon]:hidden"
            >
              <span>{group}</span>
              <ChevronDown
                aria-hidden="true"
                className={
                  "size-3.5 shrink-0 transition-transform " +
                  (closed[group] ? "-rotate-90" : "")
                }
              />
            </button>
            <div
              id={menuId + "-" + groups.indexOf(group)}
              hidden={!iconRail && Boolean(closed[group])}
            >
              <SidebarMenu className="border-l border-white/15 pl-2 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:pl-0">
                {adminNavigation
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <AppSidebarLink key={item.id} {...item} />
                  ))}
              </SidebarMenu>
            </div>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
