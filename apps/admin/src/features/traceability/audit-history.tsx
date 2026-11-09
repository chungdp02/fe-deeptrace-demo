import type { TraceState } from "../../modules/traceability/model";
import { eventLabels, unitLabels } from "../../modules/traceability/model";
import { formatVietnamDateTime } from "../../lib/format";
import { TraceStatus } from "./ui";

const labels: Record<string, string> = {
  batchCode: "Mã lô", productId: "Sản phẩm", materialId: "Nguyên liệu", lotType: "Loại lô",
  initialQuantity: "Số lượng ban đầu", unit: "Đơn vị tính", productionDate: "Ngày sản xuất",
  expirationDate: "Hạn sử dụng", status: "Trạng thái", originLocationId: "Địa điểm nguồn",
  responsiblePartnerId: "Đơn vị phụ trách", sourceNote: "Thông tin nguồn", requiredEvents: "Các bước bắt buộc",
  requiresQuality: "Yêu cầu kiểm định", createdAt: "Thời gian tạo", updatedAt: "Thời gian cập nhật",
};
export function LotAuditEntry({ record, partners }: { record: TraceState["audit"][number]; partners: TraceState["partners"] }) {
  let before: Record<string, unknown>, after: Record<string, unknown>;
  try {
    before = JSON.parse(record.before) ?? {};
    after = JSON.parse(record.after) ?? {};
    if (typeof before !== "object" || typeof after !== "object" || Array.isArray(before) || Array.isArray(after)) throw new Error("Dữ liệu lịch sử không hợp lệ.");
  } catch {
    return <p className="text-sm text-muted-foreground">Không thể hiển thị chi tiết bản ghi lịch sử này.</p>;
  }
  const keys = Object.keys(labels).filter(key => JSON.stringify(before[key]) !== JSON.stringify(after[key]));
  function value(key: string, input: unknown) {
    if (input === null || input === undefined || input === "") return "Chưa có thông tin";
    if (key === "status" || key === "lotType") return <TraceStatus value={String(input)} />;
    if (key === "responsiblePartnerId") return partners.find(item => item.id === input)?.name ?? "Không tìm thấy đơn vị";
    if (key === "requiredEvents" && Array.isArray(input)) return input.map(item => eventLabels[String(item)] ?? "Bước khác").join(", ") || "Không yêu cầu";
    if (typeof input === "boolean") return input ? "Có" : "Không";
    if (key === "unit") return unitLabels[String(input)] ?? String(input);
    if (key === "createdAt" || key === "updatedAt") return Number.isNaN(new Date(String(input)).getTime()) ? "Thời gian không hợp lệ" : formatVietnamDateTime(String(input));
    if (key === "productionDate" || key === "expirationDate") return String(input).split("-").reverse().join("/");
    return String(input);
  }
  return <details className="rounded border p-3 text-sm"><summary className="cursor-pointer font-medium">{formatVietnamDateTime(record.changedAt)} · {record.entity === "lot-quality-hold" ? "Tạm giữ lô sau kiểm định" : "Chỉnh sửa thông tin lô"}</summary><div className="mt-3 space-y-3">{keys.map(key => <div key={key}><p className="mb-1 text-xs font-medium text-muted-foreground">{labels[key]}</p><dl className="grid gap-2 sm:grid-cols-2"><div className="min-w-0 rounded bg-muted/40 p-2"><dt className="mb-1 text-xs text-muted-foreground">Trước</dt><dd className="break-words">{value(key, before[key])}</dd></div><div className="min-w-0 rounded border p-2"><dt className="mb-1 text-xs text-muted-foreground">Sau</dt><dd className="break-words">{value(key, after[key])}</dd></div></dl></div>)}{!keys.length && <p>Không có thay đổi thông tin lô.</p>}</div></details>;
}
