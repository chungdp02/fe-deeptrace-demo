import { useTraceability } from "../../app/providers/traceability-provider";
import { useProducts } from "../../app/providers/product-provider";
import {
  eventLabels,
  eventTypes,
  units,
  unitLabels,
  type TraceLot,
} from "../../modules/traceability/model";
import {
  TraceForm,
  newId,
  read,
  list,
  yes,
  partnerOptions,
  locationOptions,
  type FieldSpec,
  type Values,
} from "./ui";
import { formatVietnamDateInput } from "../../lib/format";

export function LotForm({
  lot,
  raw = false,
  onClose,
}: {
  lot?: TraceLot;
  raw?: boolean;
  onClose: () => void;
}) {
  const { state, execute } = useTraceability();
  const { products } = useProducts();
  const time = new Date().toISOString();
  const initial: Values = {
    batchCode: lot?.batchCode ?? "",
    productId: lot?.productId ?? "",
    materialId: lot?.materialId ?? "",
    materialName: "",
    lotType: lot?.lotType ?? (raw ? "raw" : "finished"),
    quantity: String(lot?.initialQuantity ?? ""),
    unit: lot?.unit ?? "kg",
    productionDate: lot?.productionDate ?? formatVietnamDateInput(time),
    expirationDate: lot?.expirationDate ?? "",
    status: lot?.status ?? "active",
    originLocationId: lot?.originLocationId ?? "",
    responsiblePartnerId: lot?.responsiblePartnerId ?? "",
    sourceNote: lot?.sourceNote ?? "",
    requiredEvents:
      lot?.requiredEvents ?? (raw ? ["collected"] : ["processed", "packaged"]),
    requiresQuality: lot?.requiresQuality ?? !raw,
  };
  const fields: FieldSpec[] = [
    { name: "batchCode", label: "Mã lô", required: true },
    ...(!lot
      ? raw
        ? [
            {
              name: "materialId",
              label: "Nguyên liệu hiện có",
              kind: "select" as const,
              options: state.materials.map((item) => ({
                value: item.id,
                label: item.name,
              })),
            },
            {
              name: "materialName",
              label: "Hoặc tên nguyên liệu mới",
              help: "Khi nhập tên mới, danh mục nguyên liệu và lô được lưu cùng một thao tác.",
            },
          ]
        : [
            {
              name: "productId",
              label: "Sản phẩm",
              kind: "select" as const,
              required: true,
              options: products.map((item) => ({
                value: item.id,
                label: item.id + " · " + item.name,
              })),
            },
            {
              name: "lotType",
              label: "Loại lô",
              kind: "select" as const,
              required: true,
              options: [
                { value: "semi", label: "Bán thành phẩm" },
                { value: "finished", label: "Thành phẩm" },
              ],
            },
          ]
      : []),
    ...(!lot
      ? [
          {
            name: "quantity",
            label: "Số lượng ban đầu",
            kind: "number" as const,
            required: true,
            help: "Tồn hiện tại được tính từ tiêu hao và giao nhận, không chỉnh trực tiếp ở đây.",
          },
          {
            name: "unit",
            label: "Đơn vị",
            kind: "select" as const,
            required: true,
            options: units.map((value) => ({
              value,
              label: unitLabels[value],
            })),
          },
          {
            name: "originLocationId",
            label: "Địa điểm nguồn",
            kind: "select" as const,
            required: true,
            options: locationOptions(state),
          },
        ]
      : []),
    {
      name: "responsiblePartnerId",
      label: "Đơn vị phụ trách",
      kind: "select",
      required: true,
      options: partnerOptions(state),
    },
    {
      name: "productionDate",
      label: raw ? "Ngày thu hoạch / tiếp nhận nguồn" : "Ngày sản xuất",
      kind: "date",
    },
    { name: "expirationDate", label: "Hạn sử dụng", kind: "date" },
    {
      name: "status",
      label: "Trạng thái lô",
      kind: "select",
      required: true,
      options: [
        { value: "active", label: "Hoạt động" },
        { value: "hold", label: "Tạm giữ" },
        { value: "closed", label: "Đã đóng" },
      ],
    },
    {
      name: "sourceNote",
      label: "Nguồn đầu vào / lý do không dùng lô đầu vào",
      kind: "textarea",
    },
    {
      name: "requiredEvents",
      label: "Các bước bắt buộc cho lô này",
      kind: "multi",
      options: eventTypes.map((value) => ({
        value,
        label: eventLabels[value],
      })),
    },
    {
      name: "requiresQuality",
      label: "Yêu cầu kiểm định đạt trước khi xuất giao",
      kind: "checkbox",
    },
  ];
  return (
    <TraceForm
      submitLabel={lot ? "Lưu thay đổi" : "Lưu thông tin"}
      title={
        lot ? "Chỉnh sửa lô" : raw ? "Tạo lô nguyên liệu" : "Tạo lô sản xuất"
      }
      description="Sản phẩm/nguyên liệu, loại lô, số lượng ban đầu, đơn vị tính và địa điểm nguồn được giữ nguyên sau khi tạo. Các chỉnh sửa được lưu trong lịch sử."
      fields={fields}
      initial={initial}
      onClose={onClose}
      onSave={(values) => {
        const material =
          !lot && raw && read(values, "materialName").trim()
            ? { id: newId("MAT"), name: read(values, "materialName") }
            : undefined;
        const value: TraceLot = {
          id: lot?.id ?? newId("LOT"),
          batchCode: read(values, "batchCode").trim().toUpperCase(),
          productId: lot
            ? lot.productId
            : raw
              ? null
              : read(values, "productId") || null,
          materialId: lot
            ? lot.materialId
            : raw
              ? (material?.id ?? (read(values, "materialId") || null))
              : null,
          lotType:
            lot?.lotType ?? (read(values, "lotType") as TraceLot["lotType"]),
          initialQuantity:
            lot?.initialQuantity ?? Number(read(values, "quantity")),
          unit: lot?.unit ?? (read(values, "unit") as TraceLot["unit"]),
          originLocationId:
            lot?.originLocationId ?? read(values, "originLocationId"),
          responsiblePartnerId: read(values, "responsiblePartnerId"),
          productionDate: read(values, "productionDate") || null,
          expirationDate: read(values, "expirationDate") || null,
          status: read(values, "status") as TraceLot["status"],
          sourceNote: read(values, "sourceNote"),
          requiredEvents: list(
            values,
            "requiredEvents",
          ) as TraceLot["requiredEvents"],
          requiresQuality: yes(values, "requiresQuality"),
          createdAt: lot?.createdAt ?? time,
          updatedAt: time,
        };
        return execute({ kind: "lot", value, material, editing: Boolean(lot) });
      }}
    />
  );
}
