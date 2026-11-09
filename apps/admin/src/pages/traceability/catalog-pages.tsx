import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Building2, MapPin, PackageSearch, Sprout, Plus, Pencil, Eye, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@workspace/ui/components/alert-dialog";
import { useTraceability } from "../../app/providers/traceability-provider";
import { useProducts } from "../../app/providers/product-provider";
import { PageHeader } from "../../features/admin-management/page-header";
import { ManagementSelect } from "../../features/admin-management/management-select";
import { LotForm } from "../../features/traceability/lot-form";
import { TracePanel, TraceTable, TraceSearch, TraceForm, TraceStatus, read, newId, quantityText, lotName, partnerOptions } from "../../features/traceability/ui";
import { normalizeSearch } from "../../lib/search";
import { type TraceLot, type Partner, type Location, unitLabels } from "../../modules/traceability/model";

export function LotsPage({ raw = false }: { raw?: boolean }) {
  const navigate = useNavigate();
  const { state, execute } = useTraceability();
  const { products } = useProducts();
  const [query, setQuery] = useState("");
  const [product, setProduct] = useState("all"), [status, setStatus] = useState("all"), [location, setLocation] = useState("all");
  const [draft, setDraft] = useState<{ lot?: TraceLot } | null>(null);
  const [selected, setSelected] = useState<TraceLot | null>(null), [error, setError] = useState<string | null>(null);
  const rows = state.lots.filter(item => (raw ? item.lotType === "raw" : item.lotType !== "raw") && (product === "all" || item.productId === product) && (status === "all" || item.status === status) && (location === "all" || item.originLocationId === location) && normalizeSearch(item.batchCode + " " + lotName(state, products, item)).includes(normalizeSearch(query)));
  return <section className="space-y-6"><PageHeader title={raw ? "Nguyên liệu" : "Lô sản xuất"} description={raw ? "Theo dõi nguồn, số lượng và lịch sử sử dụng của các lô nguyên liệu." : "Quản lý lô bán thành phẩm, thành phẩm và theo dõi nguồn gốc."} icon={raw ? Sprout : PackageSearch} action={<Button onClick={() => setDraft({})}><Plus />{raw ? "Tạo lô nguyên liệu" : "Tạo lô sản xuất"}</Button>} />
    <TracePanel title={raw ? "Các lô nguyên liệu" : "Danh sách lô"}><div className="admin-filter-toolbar"><TraceSearch value={query} onChange={setQuery} label="Tìm mã lô hoặc tên" />{!raw && <ManagementSelect label="Lọc sản phẩm" value={product} onChange={setProduct} options={[{ value: "all", label: "Tất cả sản phẩm" }, ...products.map(item => ({ value: item.id, label: item.name }))]} />}<ManagementSelect label="Lọc trạng thái lô" value={status} onChange={setStatus} options={[{ value: "all", label: "Tất cả trạng thái" }, { value: "active", label: "Hoạt động" }, { value: "hold", label: "Tạm giữ" }, { value: "closed", label: "Đã đóng" }]} /><ManagementSelect label="Lọc địa điểm nguồn" value={location} onChange={setLocation} options={[{ value: "all", label: "Tất cả địa điểm" }, ...state.locations.map(item => ({ value: item.id, label: item.name }))]} /></div>
      <TraceTable key={query + product + status + location} rows={rows} columns={[{ label: "Mã lô", render: item => <Link className="font-medium text-primary hover:underline" to={"/lots/" + item.id}>{item.batchCode}</Link> }, { label: raw ? "Nguyên liệu" : "Sản phẩm", render: item => lotName(state, products, item) }, { label: "Loại", render: item => <TraceStatus value={item.lotType} /> }, { label: "Lượng ban đầu", render: item => quantityText(item.initialQuantity) + " " + unitLabels[item.unit] }, { label: "Ngày sản xuất / nguồn", render: item => item.productionDate ?? "Chưa ghi nhận" }, { label: "Trạng thái", render: item => <TraceStatus value={item.status} /> }]} actions={item => [{ label: "Xem hồ sơ lô", icon: <Eye />, onSelect: () => { navigate("/lots/" + item.id); } }, { label: "Chỉnh sửa", icon: <Pencil />, onSelect: () => setDraft({ lot: item }) }, { label: "Xóa lô", icon: <Trash2 />, destructive: true, onSelect: () => { setSelected(item); setError(null); } }]} />
    </TracePanel>
    {draft && <LotForm lot={draft.lot} raw={raw} onClose={() => setDraft(null)} />}
    <AlertDialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Xóa lô?</AlertDialogTitle><AlertDialogDescription>Chỉ có thể xóa lô chưa có sự kiện, giao nhận, sự cố hoặc liên kết với lô khác.</AlertDialogDescription></AlertDialogHeader>{error && <p role="alert" className="text-destructive">{error}</p>}<AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={event => { if (!selected) return; const message = execute({ kind: "deleteLot", id: selected.id }); setError(message); if (message) event.preventDefault(); else setSelected(null); }}>Xóa lô</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>;
}
export function MaterialsPage() { return <LotsPage raw />; }

export function PartnersPage() {
  const { state, execute } = useTraceability();
  const [query, setQuery] = useState(""), [draft, setDraft] = useState<{ value?: Partner } | null>(null);
  const types = [{ value: "supplier", label: "Nhà cung cấp" }, { value: "producer", label: "Nhà sản xuất" }, { value: "processor", label: "Cơ sở chế biến" }, { value: "distributor", label: "Nhà phân phối" }, { value: "other", label: "Khác" }];
  const rows = state.partners.filter(item => normalizeSearch(item.name + " " + item.address).includes(normalizeSearch(query)));
  const old = draft?.value;
  return <section className="space-y-6"><PageHeader title="Đối tác chuỗi cung ứng" description="Quản lý các đơn vị cung cấp, sản xuất, chế biến và phân phối trong chuỗi cung ứng." icon={Building2} action={<Button onClick={() => setDraft({})}><Plus />Thêm đối tác</Button>} /><TracePanel title="Danh sách đối tác"><TraceSearch value={query} onChange={setQuery} label="Tìm đối tác" /><TraceTable key={query} rows={rows} columns={[{ label: "Đơn vị", render: item => item.name }, { label: "Vai trò", render: item => types.find(type => type.value === item.partnerType)?.label }, { label: "Liên hệ", render: item => item.contact }, { label: "Địa chỉ", render: item => item.address }, { label: "Trạng thái", render: item => <TraceStatus value={item.status} /> }]} actions={item => [{ label: "Chỉnh sửa", icon: <Pencil />, onSelect: () => setDraft({ value: item }) }]} /></TracePanel>
    {draft && <TraceForm submitLabel={old ? "Lưu thay đổi" : "Lưu thông tin"} title={old ? "Chỉnh sửa đối tác" : "Thêm đối tác"} onClose={() => setDraft(null)} initial={{ name: old?.name ?? "", partnerType: old?.partnerType ?? "supplier", contact: old?.contact ?? "", address: old?.address ?? "", status: old?.status ?? "active" }} fields={[{ name: "name", label: "Tên đối tác", required: true }, { name: "partnerType", label: "Vai trò đối tác", kind: "select", options: types, required: true }, { name: "contact", label: "Liên hệ", required: true }, { name: "address", label: "Địa chỉ", required: true }, { name: "status", label: "Trạng thái", kind: "select", options: [{ value: "active", label: "Hoạt động" }, { value: "inactive", label: "Ngừng hoạt động" }] }]} onSave={values => execute({ kind: "partner", editing: Boolean(old), value: { id: old?.id ?? newId("PARTNER"), name: read(values, "name"), partnerType: read(values, "partnerType") as Partner["partnerType"], contact: read(values, "contact"), address: read(values, "address"), status: read(values, "status") as Partner["status"] } })} />}
  </section>;
}
export function LocationsPage() {
  const { state, execute } = useTraceability();
  const [query, setQuery] = useState(""), [draft, setDraft] = useState<{ value?: Location } | null>(null);
  const types = [{ value: "farm", label: "Vùng trồng" }, { value: "collection", label: "Điểm thu mua" }, { value: "factory", label: "Cơ sở chế biến" }, { value: "warehouse", label: "Kho" }, { value: "reception", label: "Điểm tiếp nhận" }];
  const rows = state.locations.filter(item => normalizeSearch(item.name + " " + item.address).includes(normalizeSearch(query)));
  const old = draft?.value;
  return <section className="space-y-6"><PageHeader title="Cơ sở & địa điểm" description="Địa chỉ và đơn vị phụ trách các điểm trong chuỗi hành trình lô." icon={MapPin} action={<Button onClick={() => setDraft({})}><Plus />Thêm địa điểm</Button>} /><TracePanel title="Danh sách địa điểm"><TraceSearch value={query} onChange={setQuery} label="Tìm địa điểm" /><TraceTable key={query} rows={rows} columns={[{ label: "Địa điểm", render: item => item.name }, { label: "Loại", render: item => types.find(type => type.value === item.type)?.label }, { label: "Đơn vị", render: item => state.partners.find(partner => partner.id === item.partnerId)?.name }, { label: "Địa chỉ", render: item => item.address }, { label: "Trạng thái", render: item => <TraceStatus value={item.status} /> }]} actions={item => [{ label: "Chỉnh sửa", icon: <Pencil />, onSelect: () => setDraft({ value: item }) }]} /></TracePanel>
    {draft && <TraceForm submitLabel={old ? "Lưu thay đổi" : "Lưu thông tin"} title={old ? "Chỉnh sửa địa điểm" : "Thêm địa điểm"} onClose={() => setDraft(null)} initial={{ name: old?.name ?? "", type: old?.type ?? "warehouse", address: old?.address ?? "", partnerId: old?.partnerId ?? "", status: old?.status ?? "active" }} fields={[{ name: "name", label: "Tên địa điểm", required: true }, { name: "type", label: "Loại địa điểm", kind: "select", options: types, required: true }, { name: "partnerId", label: "Đơn vị quản lý", kind: "select", options: partnerOptions(state), required: true }, { name: "address", label: "Địa chỉ", required: true }, { name: "status", label: "Trạng thái", kind: "select", options: [{ value: "active", label: "Hoạt động" }, { value: "inactive", label: "Ngừng hoạt động" }] }]} onSave={values => execute({ kind: "location", editing: Boolean(old), value: { id: old?.id ?? newId("LOC"), name: read(values, "name"), type: read(values, "type") as Location["type"], address: read(values, "address"), partnerId: read(values, "partnerId"), status: read(values, "status") as Location["status"] } })} />}
  </section>;
}
