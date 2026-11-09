import { useTraceability } from "../../app/providers/traceability-provider";
import { useOrganization } from "../../app/providers/organization-provider";
import {
  eventLabels,
  eventTypes,
  type TraceEvent,
  type QualityCheck,
} from "../../modules/traceability/model";
import {
  TraceForm,
  read,
  newId,
  nowLocal,
  toIso,
  lotOptions,
  locationOptions,
} from "./ui";

export function EventForm({
  lotId = "",
  onClose,
}: {
  lotId?: string;
  onClose: () => void;
}) {
  const { state, execute } = useTraceability();
  const { employees } = useOrganization();
  return (
    <TraceForm
      title="Ghi nhận sự kiện"
      description="Nhật ký tự khai không làm thay đổi tồn kho. Dùng Giao nhận để xác nhận luân chuyển và Kiểm định để ghi kết quả chất lượng."
      onClose={onClose}
      initial={{
        lotId,
        eventType: "stored",
        occurredAt: nowLocal(),
        locationId: "",
        actorId: "",
        quantity: "",
        description: "",
        evidence: "",
      }}
      fields={[
        {
          name: "lotId",
          label: "Lô hàng",
          kind: "select",
          required: true,
          options: lotOptions(state),
        },
        {
          name: "eventType",
          label: "Loại sự kiện",
          kind: "select",
          required: true,
          options: eventTypes
            .filter(
              (type) =>
                !["quality_checked", "dispatched", "delivered"].includes(type),
            )
            .map((value) => ({ value, label: eventLabels[value] })),
        },
        {
          name: "occurredAt",
          label: "Thời gian xảy ra (giờ Việt Nam)",
          kind: "datetime-local",
          required: true,
        },
        {
          name: "locationId",
          label: "Địa điểm sự kiện",
          kind: "select",
          required: true,
          options: locationOptions(state),
          help: "Đơn vị ghi nhận được lấy từ đơn vị quản lý địa điểm.",
        },
        {
          name: "actorId",
          label: "Nhân sự ghi nhận",
          kind: "select",
          options: employees
            .filter((item) => item.status === "active")
            .map((item) => ({ value: item.id, label: item.name })),
        },
        {
          name: "quantity",
          label: "Số lượng liên quan (nếu có)",
          kind: "number",
          help: "Đơn vị lấy từ lô, chỉ dùng làm thông tin sự kiện.",
        },
        {
          name: "description",
          label: "Mô tả sự kiện",
          kind: "textarea",
          required: true,
        },
        {
          name: "evidence",
          label: "Tên hoặc mã chứng từ (mỗi dòng một mục)",
          kind: "textarea",
        },
      ]}
      onSave={(values) => {
        const target = state.lots.find(
          (item) => item.id === read(values, "lotId"),
        );
        const place = state.locations.find(
          (item) => item.id === read(values, "locationId"),
        );
        const quantity = read(values, "quantity")
          ? Number(read(values, "quantity"))
          : null;
        return execute({
          kind: "event",
          value: {
            id: newId("EV"),
            lotId: read(values, "lotId"),
            eventType: read(values, "eventType") as TraceEvent["eventType"],
            occurredAt: toIso(read(values, "occurredAt")),
            recordedAt: new Date().toISOString(),
            locationId: place?.id ?? "",
            partnerId: place?.partnerId ?? "",
            actorId: read(values, "actorId") || null,
            quantity,
            unit: quantity === null ? null : (target?.unit ?? null),
            description: read(values, "description"),
            evidence: read(values, "evidence")
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
          },
        });
      }}
    />
  );
}
export function QualityForm({
  lotId = "",
  onClose,
}: {
  lotId?: string;
  onClose: () => void;
}) {
  const { state, execute } = useTraceability();
  return (
    <TraceForm
      title="Ghi nhận kiểm định"
      description="Kết quả là đánh giá nội bộ. Không đạt sẽ tạm giữ lô; không được hiểu là chứng nhận pháp lý."
      onClose={onClose}
      initial={{
        lotId,
        locationId: "",
        checkType: "",
        checkedAt: nowLocal(),
        result: "pending",
        inspector: "",
        notes: "",
        evidence: "",
      }}
      fields={[
        {
          name: "lotId",
          label: "Lô kiểm định",
          kind: "select",
          required: true,
          options: lotOptions(state),
        },
        {
          name: "locationId",
          label: "Địa điểm kiểm định",
          kind: "select",
          required: true,
          options: locationOptions(state),
        },
        { name: "checkType", label: "Nội dung kiểm tra", required: true },
        {
          name: "checkedAt",
          label: "Thời gian kiểm tra (giờ Việt Nam)",
          kind: "datetime-local",
          required: true,
        },
        {
          name: "result",
          label: "Kết quả",
          kind: "select",
          required: true,
          options: [
            { value: "passed", label: "Đạt nội bộ" },
            { value: "failed", label: "Không đạt" },
            { value: "pending", label: "Chờ kết quả" },
          ],
        },
        {
          name: "inspector",
          label: "Người kiểm tra",
          required: true,
        },
        {
          name: "notes",
          label: "Nhận xét / ghi chú",
          kind: "textarea",
          required: true,
        },
        {
          name: "evidence",
          label: "Tên hoặc mã chứng từ (mỗi dòng một mục)",
          kind: "textarea",
        },
      ]}
      onSave={(values) => {
        const id = newId("QC");
        return execute({
          kind: "quality",
          locationId: read(values, "locationId"),
          value: {
            id,
            eventId: id + "-event",
            lotId: read(values, "lotId"),
            checkType: read(values, "checkType"),
            checkedAt: toIso(read(values, "checkedAt")),
            result: read(values, "result") as QualityCheck["result"],
            inspector: read(values, "inspector"),
            notes: read(values, "notes"),
            evidence: read(values, "evidence")
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
          },
        });
      }}
    />
  );
}
