export interface MetricItem {
  label: string;
  value: string | number;
  detail?: string;
}

export function MetricStrip({ items }: { items: MetricItem[] }) {
  return (
    <dl
      data-columns={items.length === 4 ? 4 : items.length === 2 ? 2 : 3}
      className="admin-metrics grid grid-cols-1 gap-3 min-[390px]:grid-cols-2"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="min-w-0 rounded-xl border bg-card p-4 sm:p-5"
        >
          <dt className="text-sm text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 break-words text-xl font-semibold sm:text-2xl tabular-nums text-foreground">
            {item.value}
          </dd>
          {item.detail && (
            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
          )}
        </div>
      ))}
    </dl>
  );
}
