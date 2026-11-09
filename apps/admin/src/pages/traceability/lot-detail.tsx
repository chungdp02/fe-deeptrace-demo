import { LotAuditEntry } from "../../features/traceability/audit-history";
import { TraceTimeline } from "../../features/traceability/timeline";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, GitBranch, Link2, Plus, ShieldCheck, Pencil } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { PageHeader } from "../../features/admin-management/page-header";
import { useTraceability } from "../../app/providers/traceability-provider";
import { useProducts } from "../../app/providers/product-provider";
import { useOrganization } from "../../app/providers/organization-provider";
import { TracePanel, TraceForm, TraceStatus, read, newId, lotOptions, locationOptions, quantityText, lotName } from "../../features/traceability/ui";
import { LotForm } from "../../features/traceability/lot-form";
import { EventForm, QualityForm } from "../../features/traceability/event-forms";
import { traceLots, completeness, lotBalances, unitLabels, type TraceLot } from "../../modules/traceability/model";
import { formatVietnamDateTime } from "../../lib/format";

export function LotProfile({ lot, editable = false }: { lot: TraceLot; editable?: boolean }) {
  const { state, execute } = useTraceability();
  const { products } = useProducts();
  const { employees } = useOrganization();
  const [form, setForm] = useState<"event" | "input" | "quality" | "metadata" | null>(null);
  const missing = completeness(state, lot);
  const backward = traceLots(state, lot.id, "backward"), forward = traceLots(state, lot.id, "forward");
  const lotLink = (id: string) => <Link className="text-primary hover:underline" to={"/lots/" + id}>{state.lots.find(item => item.id === id)?.batchCode ?? id}</Link>;
  return <div className="space-y-5">
    <TracePanel title="Thông tin lô" description="Mức đầy đủ hồ sơ được đánh giá theo cấu hình của lô; không đồng nghĩa đã kiểm chứng độc lập.">
      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div><dt className="text-xs text-muted-foreground">Mã lô</dt><dd className="font-semibold">{lot.batchCode}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Sản phẩm / nguyên liệu</dt><dd>{lotName(state, products, lot)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Loại / trạng thái</dt><dd className="flex flex-wrap gap-2"><TraceStatus value={lot.lotType} /><TraceStatus value={lot.status} /></dd></div>
        <div><dt className="text-xs text-muted-foreground">Số lượng ban đầu</dt><dd>{quantityText(lot.initialQuantity)} {unitLabels[lot.unit]}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Nguồn / đơn vị phụ trách</dt><dd>{state.locations.find(item => item.id === lot.originLocationId)?.name}<span className="block text-xs text-muted-foreground">{state.partners.find(item => item.id === lot.responsiblePartnerId)?.name}</span></dd></div>
        <div><dt className="text-xs text-muted-foreground">Ngày sản xuất / hạn dùng</dt><dd>{lot.productionDate ?? "Chưa ghi nhận"} / {lot.expirationDate ?? "Không áp dụng"}</dd></div>
      </dl>
      <p className="text-sm">{lot.sourceNote || "Nguồn được liên kết qua các lô đầu vào."}</p>
      <div className="rounded border bg-muted/40 p-3 text-sm"><strong>{missing.length ? "Hồ sơ còn thiếu" : "Đủ dữ liệu theo cấu hình lô (tự khai)"}</strong>{missing.length > 0 && <ul className="mt-2 list-inside list-disc">{missing.map(item => <li key={item}>{item}</li>)}</ul>}</div>
      {editable && <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setForm("metadata")}><Pencil />Chỉnh sửa</Button><Button onClick={() => setForm("event")}><Plus />Ghi nhận sự kiện</Button><Button variant="outline" onClick={() => setForm("input")}><Link2 />Liên kết đầu vào</Button><Button variant="outline" onClick={() => setForm("quality")}><ShieldCheck />Kiểm định lô</Button></div>}
    </TracePanel>
    <div className="grid min-w-0 gap-4 xl:grid-cols-2">
      <TracePanel title="Truy ngược nguồn đầu vào"><p className="text-sm text-muted-foreground">Tất cả lô nguồn trực tiếp và gián tiếp, không lặp node.</p><ul className="space-y-2">{backward.map(item => <li key={item.id} className="text-sm">{lotLink(item.id)} · {lotName(state, products, item)} · {state.partners.find(partner => partner.id === item.responsiblePartnerId)?.name}</li>)}{!backward.length && <li className="text-sm text-muted-foreground">Không có lô đầu vào được liên kết. {lot.sourceNote}</li>}</ul></TracePanel>
      <TracePanel title="Truy xuôi ảnh hưởng"><p className="text-sm text-muted-foreground">Các lô đầu ra trực tiếp và gián tiếp có sử dụng nguồn này.</p><ul className="space-y-2">{forward.map(item => <li key={item.id} className="text-sm">{lotLink(item.id)} · {lotName(state, products, item)}</li>)}{!forward.length && <li className="text-sm text-muted-foreground">Chưa liên kết lô đầu ra.</li>}</ul></TracePanel>
    </div>
    <TracePanel title="Quan hệ lô trực tiếp"><ul className="space-y-3 text-sm">{state.inputs.filter(item => item.inputLotId === lot.id || item.outputLotId === lot.id).map(item => <li key={item.id} className="flex flex-wrap items-center gap-2"><GitBranch aria-hidden="true" className="size-4 text-primary" />{lotLink(item.inputLotId)}<span>đầu vào cho</span>{lotLink(item.outputLotId)}<span>· {quantityText(item.quantity)} {unitLabels[item.unit]} · {state.locations.find(place => place.id === item.fromLocationId)?.name}</span></li>)}</ul>{!state.inputs.some(item => item.inputLotId === lot.id || item.outputLotId === lot.id) && <p className="text-sm text-muted-foreground">Chưa có liên kết trực tiếp.</p>}</TracePanel>
    <TracePanel title="Hành trình truy xuất"><TraceTimeline state={state} lotId={lot.id} employees={employees} /></TracePanel>
    <div className="grid min-w-0 gap-4 xl:grid-cols-2"><TracePanel title="Kiểm định của lô"><ul className="space-y-3">{state.quality.filter(item => item.lotId === lot.id).map(item => <li key={item.id} className="space-y-1 text-sm"><p className="font-medium">{item.checkType}</p><TraceStatus value={item.result} /><p>{item.inspector} · {formatVietnamDateTime(item.checkedAt)}</p><p>{item.notes}</p></li>)}</ul>{!state.quality.some(item => item.lotId === lot.id) && <p className="text-sm text-muted-foreground">Chưa ghi nhận kiểm định.</p>}</TracePanel><TracePanel title="Tồn khả dụng và giao nhận"><ul className="space-y-2 text-sm">{[...lotBalances(state, lot.id)].map(([place, amount]) => <li key={place}>{state.locations.find(item => item.id === place)?.name}: <strong>{quantityText(amount)} {unitLabels[lot.unit]}</strong></li>)}</ul><ul className="space-y-3 border-t pt-3 text-sm">{state.handovers.filter(item => item.lotId === lot.id).map(item => <li key={item.id}><p>{item.id} · {quantityText(item.quantity)} {unitLabels[item.unit]}</p><p>{state.locations.find(place => place.id === item.fromLocationId)?.name} đến {state.locations.find(place => place.id === item.toLocationId)?.name}</p><TraceStatus value={item.status} /></li>)}</ul><Link className="inline-flex text-sm text-primary hover:underline" to="/shipments">Mở giao nhận</Link></TracePanel></div>
    <TracePanel title="Lịch sử chỉnh sửa"><p className="text-xs text-muted-foreground">Lịch sử được lưu trên trình duyệt và chưa được đối chiếu độc lập.</p>{state.audit.filter(item => item.entityId === lot.id).map(item => <LotAuditEntry key={item.id} record={item} partners={state.partners} />)}</TracePanel>
    {form === "event" && <EventForm lotId={lot.id} onClose={() => setForm(null)} />}
    {form === "quality" && <QualityForm lotId={lot.id} onClose={() => setForm(null)} />}
    {form === "metadata" && <LotForm lot={lot} raw={lot.lotType === "raw"} onClose={() => setForm(null)} />}
    {form === "input" && <TraceForm title="Liên kết lô đầu vào" description="Số lượng này được tiêu hao khỏi tồn tại địa điểm chọn. Không hỗ trợ chuyển đổi đơn vị tự động; đơn vị lấy theo lô đầu vào." onClose={() => setForm(null)} initial={{ inputLotId: "", locationId: "", quantity: "" }} fields={[{ name: "inputLotId", label: "Lô đầu vào", kind: "select", required: true, options: lotOptions(state).filter(item => item.value !== lot.id) }, { name: "locationId", label: "Địa điểm lấy nguyên liệu", kind: "select", required: true, options: locationOptions(state) }, { name: "quantity", label: "Số lượng sử dụng", kind: "number", required: true }]} onSave={values => execute({ kind: "input", value: { id: newId("INPUT"), inputLotId: read(values, "inputLotId"), outputLotId: lot.id, fromLocationId: read(values, "locationId"), quantity: Number(read(values, "quantity")), unit: state.lots.find(item => item.id === read(values, "inputLotId"))?.unit ?? "kg", createdAt: new Date().toISOString() } })} />}
  </div>;
}
export function LotDetailPage() {
  const { lotId } = useParams();
  const { state } = useTraceability();
  const lot = state.lots.find(item => item.id === lotId);
  return <section className="space-y-5"><Link className="inline-flex items-center gap-2 text-sm text-primary" to={lot?.lotType === "raw" ? "/materials" : "/lots"}><ArrowLeft className="size-4" />Danh sách lô</Link><PageHeader title={lot?.batchCode ?? "Không tìm thấy lô"} description="Hồ sơ nguồn, các sự kiện, kiểm định và quan hệ đầu vào/đầu ra." icon={GitBranch} />{lot ? <LotProfile lot={lot} editable /> : <p>Không tìm thấy lô trong dữ liệu hiện tại. Hãy kiểm tra mã lô hoặc quay lại danh sách.</p>}</section>;
}
