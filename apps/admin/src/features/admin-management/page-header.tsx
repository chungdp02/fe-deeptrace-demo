import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type HeaderIcon = LucideIcon;

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description: string;
  icon?: HeaderIcon;
  action?: ReactNode;
}) {
  return (
    <header className="admin-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon aria-hidden="true" className="size-5 shrink-0 text-primary" />
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        </div>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {action && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {action}
        </div>
      )}
    </header>
  );
}
