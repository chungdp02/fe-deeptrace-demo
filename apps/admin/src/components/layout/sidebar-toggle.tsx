import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useSidebar } from "@workspace/ui/components/sidebar";

export function SidebarToggle() {
  const { state, toggleSidebar, isMobile, openMobile } = useSidebar();
  const expanded = isMobile ? openMobile : state === "expanded";
  const label = expanded ? "Thu gọn menu" : "Mở menu";
  return (
    <Button
      variant="ghost"
      size="icon"
      className="admin-sidebar-toggle shrink-0"
      aria-label="Mở hoặc đóng menu"
      title={label}
      aria-expanded={expanded}
      onClick={toggleSidebar}
    >
      {expanded ? (
        <PanelLeftClose aria-hidden="true" />
      ) : (
        <PanelLeftOpen aria-hidden="true" />
      )}
    </Button>
  );
}
