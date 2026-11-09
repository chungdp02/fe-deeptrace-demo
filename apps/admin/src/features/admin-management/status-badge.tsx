import type { ReactNode } from "react";
import { Badge } from "@workspace/ui/components/badge";

const tones = {
  active: "status-badge status-badge--active border-emerald-200 bg-emerald-50 text-emerald-800",
  pending: "status-badge status-badge--pending border-amber-200 bg-amber-50 text-amber-800",
  inactive: "status-badge status-badge--inactive border-slate-300 bg-slate-100 text-slate-700",
  danger: "status-badge status-badge--danger border-red-200 bg-red-50 text-red-800",
  info: "status-badge status-badge--info border-blue-200 bg-blue-50 text-blue-800",
} as const;

export function StatusBadge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: keyof typeof tones;
}) {
  return (
    <Badge variant="outline" className={tones[tone]}>
      {children}
    </Badge>
  );
}
