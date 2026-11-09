import { Link } from "react-router";
import { LayoutDashboard } from "lucide-react";
import { useTraceability } from "../../app/providers/traceability-provider";
import { useProducts } from "../../app/providers/product-provider";
import { PageHeader } from "../../features/admin-management/page-header";
import { TracePanel, TraceStatus } from "../../features/traceability/ui";
import { TraceCharts, QualityChart } from "../../features/traceability/charts";
import { completeness, eventLabels, traceLots, latestQuality } from "../../modules/traceability/model";
import { formatVietnamDateTime } from "../../lib/format";

export function OverviewPage() {
  const { state } = useTraceability();
  const { products } = useProducts();
  const incomplete = state.lots.filter(item => completeness(state, item).length > 0);
  const pendingIds = new Set(state.lots.filter(lot => {
    const latest = latestQuality(state, lot.id);
    return latest?.result === "pending" || (lot.requiresQuality && !latest);
  }).map(item => item.id));
  const issueIds = new Set(state.incidents.filter(item => item.status !== "closed").flatMap(item => item.lotIds.flatMap(id => [id, ...traceLots(state, id, "forward").map(lot => lot.id)])));
  state.lots.filter(item => item.status === "hold").forEach(item => issueIds.add(item.id));
  const recent = state.events.slice().sort((a, b) => b.recordedAt.localeCompare(a.recordedAt) || a.id.localeCompare(b.id)).slice(0, 5);
  const metrics = [
    { label: "Tổng sản phẩm", value: products.length },
    { label: "Lô được quản lý", value: state.lots.length },
    { label: "Lô đủ dữ liệu", value: state.lots.length - incomplete.length },
    { label: "Lô thiếu thông tin", value: incomplete.length },
    { label: "Lô chờ kiểm định", value: pendingIds.size },
    { label: "Lô có vấn đề", value: issueIds.size },
  ];
  const activeIncidents = state.incidents.filter(item => item.status !== "closed");
  const inTransit = state.handovers.filter(item => item.status === "dispatched");
  // Một lô có thể vừa thiếu hồ sơ vừa chờ kiểm định; chỉ hiển thị một dòng công việc.
  const attention = state.lots.filter(lot => incomplete.some(item => item.id === lot.id) || pendingIds.has(lot.id) || issueIds.has(lot.id));
  return <section className="space-y-5">
    <PageHeader title="Tổng quan" description="Theo dõi sức khỏe hồ sơ truy xuất và các công việc cần xử lý." icon={LayoutDashboard} />
    <dl aria-label="Chỉ số tổng quan" className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{metrics.map(item => <div key={item.label} className="flex min-h-28 min-w-0 flex-col justify-between gap-3 rounded-md border bg-card p-4"><dt className="text-sm font-semibold leading-5 text-foreground">{item.label}</dt><dd className="text-3xl font-semibold leading-none tracking-tight tabular-nums text-foreground">{item.value}</dd></div>)}</dl>
    <TraceCharts state={state} />
    <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-3">
      <div className="min-w-0 space-y-4 xl:col-span-2">
        <TracePanel title="Cần xử lý" description={attention.length + " lô cần rà soát hồ sơ, kiểm định hoặc sự cố."}>
          <ul className="divide-y">{attention.slice(0, 5).map(lot => <li key={lot.id} className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0"><div className="min-w-0 flex-1"><Link to={"/lots/" + lot.id} className="text-sm font-semibold text-primary hover:underline">{lot.batchCode}</Link><p className="mt-1 text-xs leading-5 text-muted-foreground">{completeness(state, lot).join(", ") || "Rà soát sự cố liên quan đến lô"}</p></div><div className="flex flex-wrap gap-1.5">{pendingIds.has(lot.id) && <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">Chờ kiểm định</span>}{issueIds.has(lot.id) && <span className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-800">Có sự cố</span>}</div></li>)}</ul>
          {!attention.length && <p className="text-sm text-muted-foreground">Không có lô cần xử lý theo cấu hình hiện tại.</p>}
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t pt-3 text-sm"><Link className="text-primary hover:underline" to="/lots">Quản lý lô sản xuất</Link><Link className="text-primary hover:underline" to="/quality">Quản lý kiểm định</Link></div>
        </TracePanel>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2"><TracePanel title="Sự cố đang xử lý"><p className="text-2xl font-semibold tabular-nums">{activeIncidents.length}</p><p className="text-xs text-muted-foreground">{issueIds.size} lô thuộc phạm vi cần rà soát</p><Link className="inline-flex text-sm text-primary hover:underline" to="/incidents">Xem phạm vi ảnh hưởng</Link></TracePanel><TracePanel title="Bàn giao đang thực hiện"><p className="text-2xl font-semibold tabular-nums">{inTransit.length}</p>{inTransit.length ? <ul className="space-y-2 text-xs">{inTransit.slice(0, 2).map(item => <li key={item.id} className="break-all">{state.lots.find(lot => lot.id === item.lotId)?.batchCode} · <TraceStatus value={item.status} /></li>)}</ul> : <p className="text-xs text-muted-foreground">Không có phiếu đang giao.</p>}<Link className="inline-flex text-sm text-primary hover:underline" to="/shipments">Quản lý giao nhận</Link></TracePanel></div>
      </div>
      <div className="min-w-0 space-y-4"><QualityChart state={state} /><TracePanel title="Sự kiện gần đây"><ol className="space-y-4">{recent.map(event => <li key={event.id} className="border-l-2 border-primary/25 pl-3"><div className="flex flex-wrap gap-x-2 gap-y-1 text-xs"><Link className="font-semibold text-primary hover:underline" to={"/lots/" + event.lotId}>{state.lots.find(item => item.id === event.lotId)?.batchCode}</Link><span>{eventLabels[event.eventType]}</span></div><p className="mt-1 text-xs text-muted-foreground">{formatVietnamDateTime(event.recordedAt)}</p></li>)}</ol>{!recent.length && <p className="text-sm text-muted-foreground">Chưa ghi nhận sự kiện.</p>}<Link className="inline-flex text-sm text-primary hover:underline" to="/trace-events">Mở nhật ký truy xuất</Link></TracePanel></div>
    </div>
  </section>;
}
