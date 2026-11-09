import { z } from "zod";

const text = (max = 200) =>
  z.string().trim().min(1, "Không được để trống.").max(max);
const id = text(80);
const timestamp = z.iso.datetime();
export const units = ["kg", "unit", "l"] as const;
export const eventTypes = [
  "collected",
  "received",
  "processed",
  "packaged",
  "quality_checked",
  "stored",
  "dispatched",
  "delivered",
] as const;
export const eventLabels: Record<string, string> = {
  collected: "Thu hoạch / thu mua",
  received: "Tiếp nhận",
  processed: "Chế biến",
  packaged: "Đóng gói",
  quality_checked: "Kiểm định",
  stored: "Lưu kho",
  dispatched: "Xuất giao",
  delivered: "Nhận bàn giao",
};
export const unitLabels: Record<string, string> = {
  kg: "kg",
  unit: "đơn vị",
  l: "lít",
};
export const partnerSchema = z.object({
  id,
  name: text(),
  partnerType: z.enum([
    "supplier",
    "producer",
    "processor",
    "distributor",
    "other",
  ]),
  contact: text(),
  address: text(400),
  status: z.enum(["active", "inactive"]),
});
export const locationSchema = z.object({
  id,
  name: text(),
  type: z.enum(["farm", "collection", "factory", "warehouse", "reception"]),
  address: text(400),
  partnerId: id,
  status: z.enum(["active", "inactive"]),
});
export const materialSchema = z.object({ id, name: text() });
export const lotSchema = z
  .object({
    id,
    batchCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(
        /^[A-Z0-9_-]{2,60}$/,
        "Mã lô gồm 2–60 chữ, số, gạch ngang hoặc gạch dưới.",
      ),
    productId: id.nullable(),
    materialId: id.nullable(),
    lotType: z.enum(["raw", "semi", "finished"]),
    initialQuantity: z
      .number()
      .finite("Số lượng không hợp lệ.")
      .nonnegative("Số lượng ban đầu không được âm."),
    unit: z.enum(units),
    productionDate: z.iso.date().nullable(),
    expirationDate: z.iso.date().nullable(),
    status: z.enum(["active", "hold", "closed"]),
    originLocationId: id,
    responsiblePartnerId: id,
    sourceNote: z.string().trim().max(500),
    requiredEvents: z.array(z.enum(eventTypes)),
    requiresQuality: z.boolean(),
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  .superRefine((lot, ctx) => {
    if (
      lot.lotType === "raw"
        ? !lot.materialId || lot.productId !== null
        : !lot.productId || lot.materialId !== null
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Lô nguyên liệu phải gắn với một nguyên liệu; lô bán thành phẩm hoặc thành phẩm phải gắn với một sản phẩm.",
        path: ["productId"],
      });
    if (
      lot.productionDate &&
      lot.expirationDate &&
      lot.expirationDate < lot.productionDate
    )
      ctx.addIssue({
        code: "custom",
        message: "Hạn sử dụng không được trước ngày sản xuất.",
        path: ["expirationDate"],
      });
    if (lot.updatedAt < lot.createdAt)
      ctx.addIssue({ code: "custom", message: "Ngày cập nhật không hợp lệ." });
  });
export const inputSchema = z.object({
  id,
  inputLotId: id,
  outputLotId: id,
  fromLocationId: id,
  quantity: z
    .number()
    .finite("Số lượng không hợp lệ.")
    .positive("Số lượng phải lớn hơn 0."),
  unit: z.enum(units),
  createdAt: timestamp,
});
export const eventSchema = z.object({
  id,
  lotId: id,
  eventType: z.enum(eventTypes),
  occurredAt: timestamp,
  recordedAt: timestamp,
  locationId: id,
  partnerId: id,
  actorId: id.nullable(),
  quantity: z
    .number()
    .finite("Số lượng không hợp lệ.")
    .nonnegative("Số lượng không được âm.")
    .nullable(),
  unit: z.enum(units).nullable(),
  description: text(1500),
  evidence: z.array(text()).default([]),
});
export const qualitySchema = z.object({
  id,
  lotId: id,
  checkType: text(),
  checkedAt: timestamp,
  result: z.enum(["passed", "failed", "pending"]),
  inspector: text(),
  notes: text(1500),
  evidence: z.array(text()).default([]),
  eventId: id,
});
export const handoverSchema = z.object({
  id,
  lotId: id,
  fromLocationId: id,
  toLocationId: id,
  quantity: z
    .number()
    .finite("Số lượng không hợp lệ.")
    .positive("Số lượng phải lớn hơn 0."),
  unit: z.enum(units),
  status: z.enum(["draft", "dispatched", "received", "cancelled"]),
  dispatchedAt: timestamp.nullable(),
  receivedAt: timestamp.nullable(),
  notes: text(1000),
});
export const incidentSchema = z.object({
  id,
  title: text(),
  lotIds: z.array(id).min(1),
  severity: z.enum(["low", "high", "critical"]),
  status: z.enum(["open", "in_progress", "closed"]),
  description: text(1500),
  resolution: z.string().trim().max(1500),
  createdAt: timestamp,
  updatedAt: timestamp,
});
export const stateSchema = z.object({
  version: z.literal(1),
  partners: z.array(partnerSchema),
  locations: z.array(locationSchema),
  materials: z.array(materialSchema),
  lots: z.array(lotSchema),
  inputs: z.array(inputSchema),
  events: z.array(eventSchema),
  quality: z.array(qualitySchema),
  handovers: z.array(handoverSchema),
  incidents: z.array(incidentSchema),
  audit: z.array(
    z.object({
      id,
      entity: text(),
      entityId: id,
      changedAt: timestamp,
      before: z.string(),
      after: z.string(),
    }),
  ),
});
export type TraceState = z.infer<typeof stateSchema>;
export type TraceLot = z.infer<typeof lotSchema>;
export type TraceEvent = z.infer<typeof eventSchema>;
export type LotInput = z.infer<typeof inputSchema>;
export type Partner = z.infer<typeof partnerSchema>;
export type Location = z.infer<typeof locationSchema>;
export type QualityCheck = z.infer<typeof qualitySchema>;
export type Handover = z.infer<typeof handoverSchema>;
export type Incident = z.infer<typeof incidentSchema>;
export const TRACE_KEY = "deeptrace.admin.traceability.v1";
export interface ReferenceContext {
  productIds: Set<string>;
  actorIds: Set<string>;
}

// Duyệt đồ thị theo hướng cạnh, đánh dấu node để không lặp vô hạn hoặc lặp kết quả.
export function traceLots(
  state: Pick<TraceState, "lots" | "inputs">,
  lotId: string,
  direction: "backward" | "forward",
): TraceLot[] {
  const visited = new Set<string>([lotId]);
  const queue = [lotId];
  const result: TraceLot[] = [];
  while (queue.length) {
    const current = queue.shift()!;
    for (const edge of state.inputs) {
      const from = direction === "forward" ? edge.inputLotId : edge.outputLotId;
      const to = direction === "forward" ? edge.outputLotId : edge.inputLotId;
      if (from !== current || visited.has(to)) continue;
      visited.add(to);
      const lot = state.lots.find((item) => item.id === to);
      if (lot) {
        result.push(lot);
        queue.push(to);
      }
    }
  }
  return result;
}
export function hasCycle(state: Pick<TraceState, "lots" | "inputs">): boolean {
  const active = new Set<string>(),
    done = new Set<string>();
  function visit(id: string): boolean {
    if (active.has(id)) return true;
    if (done.has(id)) return false;
    active.add(id);
    for (const edge of state.inputs.filter((item) => item.inputLotId === id))
      if (visit(edge.outputLotId)) return true;
    active.delete(id);
    done.add(id);
    return false;
  }
  return state.lots.some((lot) => visit(lot.id));
}

// Tồn hiện tại = lượng khởi tạo - tiêu hao đầu vào - lượng đã xuất + lượng đã xác nhận nhận.
export function lotBalances(
  state: TraceState,
  lotId: string,
): Map<string, number> {
  const lot = state.lots.find((item) => item.id === lotId);
  const balances = new Map<string, number>();
  const add = (location: string, amount: number) =>
    balances.set(location, (balances.get(location) ?? 0) + amount);
  if (!lot) return balances;
  add(lot.originLocationId, lot.initialQuantity);
  state.inputs
    .filter((edge) => edge.inputLotId === lotId)
    .forEach((edge) => add(edge.fromLocationId, -edge.quantity));
  state.handovers
    .filter((item) => item.lotId === lotId)
    .forEach((item) => {
      if (item.status === "dispatched" || item.status === "received")
        add(item.fromLocationId, -item.quantity);
      if (item.status === "received") add(item.toLocationId, item.quantity);
    });
  return balances;
}
export function timeline(state: TraceState, lotId: string): TraceEvent[] {
  return state.events
    .filter((event) => event.lotId === lotId)
    .sort(
      (a, b) =>
        a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id),
    );
}
export function latestQuality(
  state: TraceState,
  lotId: string,
): QualityCheck | undefined {
  const recorded = (check: QualityCheck) =>
    state.events.find((event) => event.id === check.eventId)?.recordedAt ?? "";
  return state.quality
    .filter((check) => check.lotId === lotId)
    .reduce<
      QualityCheck | undefined
    >((latest, check) => (!latest || check.checkedAt > latest.checkedAt || (check.checkedAt === latest.checkedAt && recorded(check) >= recorded(latest)) ? check : latest), undefined);
}
export function completeness(state: TraceState, lot: TraceLot): string[] {
  const missing: string[] = [];
  if (!state.partners.some((item) => item.id === lot.responsiblePartnerId))
    missing.push("Đơn vị phụ trách");
  if (!state.locations.some((item) => item.id === lot.originLocationId))
    missing.push("Địa điểm nguồn");
  const events = timeline(state, lot.id);
  if (!events.length) missing.push("Nhật ký sự kiện");
  if (
    !state.inputs.some((item) => item.outputLotId === lot.id) &&
    !lot.sourceNote.trim()
  )
    missing.push("Nguồn đầu vào hoặc lý do không áp dụng");
  for (const type of lot.requiredEvents)
    if (!events.some((item) => item.eventType === type))
      missing.push(eventLabels[type]);
  if (lot.requiresQuality && latestQuality(state, lot.id)?.result !== "passed")
    missing.push("Kiểm định đạt");
  return [...new Set(missing)];
}
export function validateState(
  state: TraceState,
  refs: ReferenceContext,
  now = new Date().toISOString(),
): string | null {
  const parsed = stateSchema.safeParse(state);
  if (!parsed.success) return parsed.error.issues[0].message;
  state = parsed.data;
  for (const rows of [
    state.partners,
    state.locations,
    state.materials,
    state.lots,
    state.inputs,
    state.events,
    state.quality,
    state.handovers,
    state.incidents,
    state.audit,
  ]) {
    if (new Set(rows.map((item) => item.id)).size !== rows.length)
      return "Dữ liệu có mã bản ghi bị trùng.";
  }
  if (
    new Set(state.lots.map((item) => item.batchCode.toUpperCase())).size !==
    state.lots.length
  )
    return "Mã lô đã tồn tại.";
  const lot = (id: string) => state.lots.find((item) => item.id === id);
  const location = (id: string) =>
    state.locations.find((item) => item.id === id);
  for (const item of state.locations)
    if (!state.partners.some((partner) => partner.id === item.partnerId))
      return "Địa điểm tham chiếu đối tác không tồn tại.";
  for (const item of state.lots) {
    if (item.productId && !refs.productIds.has(item.productId))
      return "Sản phẩm của lô không còn trong danh mục. Hãy kiểm tra lại thông tin sản phẩm.";
    if (
      item.materialId &&
      !state.materials.some((material) => material.id === item.materialId)
    )
      return "Nguyên liệu không tồn tại.";
    if (
      !location(item.originLocationId) ||
      !state.partners.some(
        (partner) => partner.id === item.responsiblePartnerId,
      )
    )
      return "Địa điểm nguồn hoặc đơn vị phụ trách lô không hợp lệ.";
    if (
      item.productionDate &&
      item.productionDate >
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Ho_Chi_Minh",
        }).format(new Date(now))
    )
      return "Ngày sản xuất/nguồn không được ở tương lai.";
    if (item.createdAt > now || item.updatedAt > now)
      return "Thời gian lô không được ở tương lai.";
  }
  for (const edge of state.inputs) {
    const input = lot(edge.inputLotId),
      output = lot(edge.outputLotId);
    if (!input || !output || !location(edge.fromLocationId))
      return "Quan hệ lô có tham chiếu lỗi.";
    if (input.id === output.id || edge.unit !== input.unit)
      return "Không tự liên kết lô; đơn vị phải khớp lô đầu vào.";
    if (
      input.productionDate &&
      output.productionDate &&
      input.productionDate > output.productionDate
    )
      return "Nguyên liệu không thể được sản xuất sau lô đầu ra.";
  }
  if (
    new Set(
      state.inputs.map(
        (item) =>
          item.inputLotId + ":" + item.outputLotId + ":" + item.fromLocationId,
      ),
    ).size !== state.inputs.length
  )
    return "Quan hệ đầu vào bị trùng.";
  if (hasCycle(state)) return "Quan hệ lô tạo chu trình.";
  for (const event of state.events) {
    const target = lot(event.lotId),
      place = location(event.locationId);
    if (!target || !place || place.partnerId !== event.partnerId)
      return "Sự kiện tham chiếu lô/địa điểm/đối tác không hợp lệ.";
    if (event.actorId && !refs.actorIds.has(event.actorId))
      return "Người ghi nhận không tồn tại.";
    if (event.occurredAt > event.recordedAt || event.recordedAt > now)
      return "Thời gian sự kiện/ghi nhận không hợp lệ hoặc ở tương lai.";
    if (
      target.productionDate &&
      new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(
        new Date(event.occurredAt),
      ) < target.productionDate
    )
      return "Sự kiện không thể trước ngày sản xuất.";
    if (
      (event.quantity === null) !== (event.unit === null) ||
      (event.unit && event.unit !== target.unit)
    )
      return "Số lượng và đơn vị sự kiện phải đi cùng nhau và khớp lô.";
    if (event.quantity !== null && event.quantity > target.initialQuantity)
      return "Số lượng sự kiện vượt lượng khởi tạo của lô.";
    if (event.eventType === "collected" && target.lotType !== "raw")
      return "Thu hoạch/thu mua chỉ áp dụng cho lô nguyên liệu.";
    if (
      (event.eventType === "processed" || event.eventType === "packaged") &&
      target.lotType === "raw"
    )
      return "Chế biến/đóng gói cần lô bán thành phẩm hoặc thành phẩm.";
  }
  for (const event of state.events.filter(
    (item) => item.eventType === "packaged",
  )) {
    const target = lot(event.lotId)!;
    if (
      target.requiredEvents.includes("processed") &&
      !state.events.some(
        (item) =>
          item.lotId === target.id &&
          item.eventType === "processed" &&
          item.occurredAt <= event.occurredAt,
      )
    )
      return "Lô yêu cầu chế biến trước khi đóng gói.";
  }
  if (
    new Set(state.quality.map((item) => item.eventId)).size !==
    state.quality.length
  )
    return "Kiểm định dùng trùng sự kiện.";
  for (const event of state.events) {
    if (
      event.eventType === "quality_checked" &&
      !state.quality.some((item) => item.eventId === event.id)
    )
      return "Sự kiện kiểm định không có hồ sơ tương ứng.";
    if (
      event.eventType === "dispatched" &&
      !state.handovers.some(
        (item) =>
          item.id + "-dispatch" === event.id &&
          ["dispatched", "received"].includes(item.status),
      )
    )
      return "Sự kiện xuất giao không có phiếu tương ứng.";
    if (
      event.eventType === "delivered" &&
      !state.handovers.some(
        (item) =>
          item.id + "-receipt" === event.id && item.status === "received",
      )
    )
      return "Sự kiện nhận không có phiếu tương ứng.";
  }
  for (const check of state.quality) {
    const event = state.events.find((item) => item.id === check.eventId);
    if (
      !lot(check.lotId) ||
      !event ||
      event.lotId !== check.lotId ||
      event.eventType !== "quality_checked" ||
      event.occurredAt !== check.checkedAt
    )
      return "Kiểm định không có sự kiện tương ứng.";
  }
  for (const transfer of state.handovers) {
    const target = lot(transfer.lotId);
    if (
      !target ||
      !location(transfer.fromLocationId) ||
      !location(transfer.toLocationId) ||
      transfer.fromLocationId === transfer.toLocationId ||
      transfer.unit !== target.unit
    )
      return "Lô, nguồn/đích hoặc đơn vị giao nhận không hợp lệ.";
    if (transfer.status === "draft" || transfer.status === "cancelled") {
      if (transfer.dispatchedAt || transfer.receivedAt)
        return "Phiếu chưa xuất không được có thời gian giao/nhận.";
    } else {
      if (!transfer.dispatchedAt || transfer.dispatchedAt > now)
        return "Thời gian xuất giao không hợp lệ.";
      if (
        !state.events.some(
          (item) =>
            item.id === transfer.id + "-dispatch" &&
            item.eventType === "dispatched" &&
            item.lotId === target.id &&
            item.locationId === transfer.fromLocationId &&
            item.quantity === transfer.quantity &&
            item.occurredAt === transfer.dispatchedAt,
        )
      )
        return "Thiếu sự kiện xuất giao.";
      if (transfer.status === "received") {
        if (
          !transfer.receivedAt ||
          transfer.receivedAt < transfer.dispatchedAt ||
          transfer.receivedAt > now
        )
          return "Thời gian nhận không hợp lệ.";
        if (
          !state.events.some(
            (item) =>
              item.id === transfer.id + "-receipt" &&
              item.eventType === "delivered" &&
              item.lotId === target.id &&
              item.locationId === transfer.toLocationId &&
              item.quantity === transfer.quantity &&
              item.occurredAt === transfer.receivedAt,
          )
        )
          return "Thiếu sự kiện nhận.";
      } else if (transfer.receivedAt)
        return "Phiếu đang giao chưa có thời gian nhận.";
    }
  }
  for (const item of state.incidents) {
    if (item.lotIds.some((id) => !lot(id)))
      return "Sự cố có tham chiếu lô không tồn tại.";
    if (item.status === "closed" && !item.resolution.trim())
      return "Cần ghi cách xử lý trước khi đóng sự cố.";
    if (item.updatedAt < item.createdAt || item.updatedAt > now)
      return "Thời gian sự cố không hợp lệ.";
  }
  for (const item of state.lots)
    for (const amount of lotBalances(state, item.id).values())
      if (amount < -0.000001)
        return "Số lượng sử dụng/giao vượt tồn khả dụng tại địa điểm.";
  // Kiểm tra tồn theo thứ tự giao/nhận: không dùng lượng sẽ nhận trong tương lai để bù lần xuất trước.
  for (const target of state.lots) {
    const balance = new Map<string, number>([
      [target.originLocationId, target.initialQuantity],
    ]);
    const movements: {
      at: string;
      location: string;
      amount: number;
      key: string;
    }[] = [];
    state.inputs
      .filter((item) => item.inputLotId === target.id)
      .forEach((item) =>
        movements.push({
          at: item.createdAt,
          location: item.fromLocationId,
          amount: -item.quantity,
          key: item.id,
        }),
      );
    state.handovers
      .filter((item) => item.lotId === target.id)
      .forEach((item) => {
        if (item.dispatchedAt)
          movements.push({
            at: item.dispatchedAt,
            location: item.fromLocationId,
            amount: -item.quantity,
            key: item.id + "-out",
          });
        if (item.receivedAt)
          movements.push({
            at: item.receivedAt,
            location: item.toLocationId,
            amount: item.quantity,
            key: item.id + "-in",
          });
      });
    movements.sort(
      (a, b) =>
        a.at.localeCompare(b.at) ||
        b.amount - a.amount ||
        a.key.localeCompare(b.key),
    );
    for (const movement of movements) {
      const quantity = (balance.get(movement.location) ?? 0) + movement.amount;
      if (quantity < -0.000001)
        return "Tồn khả dụng không đủ tại thời điểm tiêu hao/giao nhận.";
      balance.set(movement.location, quantity);
    }
  }
  return null;
}
export type LoadResult = {
  state: TraceState;
  warning: string | null;
  preserveInvalid: boolean;
};
export function parseSnapshot(
  raw: string | null,
  fallback: TraceState,
  refs: ReferenceContext,
): LoadResult {
  if (!raw) return { state: fallback, warning: null, preserveInvalid: false };
  try {
    const parsed = stateSchema.safeParse(JSON.parse(raw));
    if (parsed.success && !validateState(parsed.data, refs))
      return { state: parsed.data, warning: null, preserveInvalid: false };
  } catch {
    /* Snapshot hỏng được giữ nguyên để người dùng có thể xuất bản gốc. */
  }
  return {
    state: fallback,
    warning:
      "Dữ liệu truy xuất đã lưu không hợp lệ. Đang sử dụng dữ liệu mẫu; dữ liệu gốc được giữ nguyên và sẽ được sao lưu trước khi bạn lưu thay đổi mới.",
    preserveInvalid: true,
  };
}
