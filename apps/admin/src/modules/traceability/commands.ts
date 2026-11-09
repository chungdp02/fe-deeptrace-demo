import {
  latestQuality,
  validateState,
  stateSchema,
  lotBalances,
  type ReferenceContext,
  type TraceState,
  type TraceLot,
  type Partner,
  type Location,
  type TraceEvent,
  type LotInput,
  type QualityCheck,
  type Handover,
  type Incident,
} from "./model";

export type TraceCommand =
  | {
      kind: "lot";
      value: TraceLot;
      material?: { id: string; name: string };
      editing?: boolean;
    }
  | { kind: "partner"; value: Partner; editing?: boolean }
  | { kind: "location"; value: Location; editing?: boolean }
  | { kind: "event"; value: TraceEvent }
  | { kind: "input"; value: LotInput }
  | { kind: "quality"; value: QualityCheck; locationId: string }
  | { kind: "handover"; value: Handover }
  | {
      kind: "transition";
      id: string;
      status: "dispatched" | "received" | "cancelled";
      occurredAt: string;
    }
  | { kind: "incident"; value: Incident; editing?: boolean }
  | { kind: "deleteLot"; id: string };
export type TraceResult =
  | { ok: true; state: TraceState }
  | { ok: false; error: string };
const fail = (error: string): TraceResult => ({ ok: false, error });

export function applyCommand(
  state: TraceState,
  command: TraceCommand,
  refs: ReferenceContext,
  now = new Date().toISOString(),
): TraceResult {
  const next = structuredClone(state);
  const audit = (
    entity: string,
    entityId: string,
    before: unknown,
    after: unknown,
  ) => {
    next.audit.push({
      id: crypto.randomUUID(),
      entity,
      entityId,
      before: JSON.stringify(before),
      after: JSON.stringify(after),
      changedAt: now,
    });
  };
  const upsert = <T extends { id: string }>(
    rows: T[],
    value: T,
    editing?: boolean,
  ): string | null => {
    const index = rows.findIndex((item) => item.id === value.id);
    if (editing && index < 0) return "Không tìm thấy thông tin cần chỉnh sửa.";
    if (!editing && index >= 0) return "Mã bản ghi đã tồn tại.";
    if (index >= 0) {
      audit(command.kind, value.id, rows[index], value);
      rows[index] = value;
    } else rows.push(value);
    return null;
  };
  let error: string | null = null;
  switch (command.kind) {
    case "partner":
      error = upsert(next.partners, command.value, command.editing);
      break;
    case "location":
      error = upsert(next.locations, command.value, command.editing);
      break;
    case "lot": {
      const old = next.lots.find((item) => item.id === command.value.id);
      if (old) {
        const immutable = [
          "productId",
          "materialId",
          "lotType",
          "initialQuantity",
          "unit",
          "originLocationId",
          "createdAt",
        ] as const;
        if (immutable.some((field) => old[field] !== command.value[field]))
          return fail(
            "Không thể thay đổi sản phẩm/nguyên liệu, loại lô, số lượng ban đầu, đơn vị tính hoặc địa điểm nguồn sau khi tạo lô.",
          );
      }
      if (command.material) {
        if (next.materials.some((item) => item.id === command.material!.id))
          return fail("Mã nguyên liệu đã tồn tại.");
        next.materials.push(command.material);
      }
      error = upsert(
        next.lots,
        { ...command.value, updatedAt: now },
        command.editing,
      );
      break;
    }
    case "event": {
      if (
        ["quality_checked", "dispatched", "delivered"].includes(
          command.value.eventType,
        )
      )
        return fail(
          "Ghi nhận sự kiện này qua quy trình Kiểm định/Giao nhận tương ứng.",
        );
      next.events.push({ ...command.value, recordedAt: now });
      break;
    }
    case "input": {
      const input = next.lots.find(
        (item) => item.id === command.value.inputLotId,
      );
      const output = next.lots.find(
        (item) => item.id === command.value.outputLotId,
      );
      if (!input || !output) return fail("Không tìm thấy lô đầu vào/đầu ra.");
      if (input.status !== "active" || output.status !== "active")
        return fail("Chỉ liên kết các lô đang hoạt động.");
      next.inputs.push({ ...command.value, createdAt: now });
      audit("input", command.value.id, null, command.value);
      break;
    }
    case "quality": {
      const target = next.lots.find((item) => item.id === command.value.lotId);
      const place = next.locations.find(
        (item) => item.id === command.locationId,
      );
      if (!target || !place)
        return fail("Lô/địa điểm kiểm định không tồn tại.");
      const check = { ...command.value, eventId: command.value.id + "-event" };
      next.quality.push(check);
      next.events.push({
        id: check.eventId,
        lotId: target.id,
        eventType: "quality_checked",
        occurredAt: check.checkedAt,
        recordedAt: now,
        locationId: place.id,
        partnerId: place.partnerId,
        actorId: null,
        quantity: null,
        unit: null,
        description:
          check.checkType +
          " · " +
          { passed: "Đạt nội bộ", failed: "Không đạt", pending: "Chờ kết quả" }[
            check.result
          ] +
          " · " +
          check.notes,
        evidence: check.evidence,
      });
      if (check.result === "failed") {
        const before = { ...target };
        target.status = "hold";
        target.updatedAt = now;
        audit("lot-quality-hold", target.id, before, target);
      }
      break;
    }
    case "handover":
      if (
        command.value.status !== "draft" ||
        command.value.dispatchedAt ||
        command.value.receivedAt
      )
        return fail("Phiếu mới phải ở trạng thái nháp.");
      next.handovers.push(command.value);
      break;
    case "transition": {
      const transfer = next.handovers.find((item) => item.id === command.id);
      if (!transfer) return fail("Phiếu giao nhận không tồn tại.");
      const before = { ...transfer };
      if (command.status === "cancelled") {
        if (transfer.status !== "draft")
          return fail("Chỉ hủy phiếu nháp; phiếu đã xuất phải giữ lịch sử.");
        transfer.status = "cancelled";
      } else {
        if (
          command.status === "dispatched"
            ? transfer.status !== "draft"
            : transfer.status !== "dispatched"
        )
          return fail("Chuyển trạng thái giao nhận không hợp lệ.");
        const target = next.lots.find((item) => item.id === transfer.lotId)!;
        if (command.status === "dispatched") {
          if (target.status !== "active")
            return fail("Lô bị giữ/đóng không được xuất giao.");
          const check = latestQuality(next, target.id);
          if (target.requiresQuality && check?.result !== "passed")
            return fail("Lô cần kiểm định đạt trước khi xuất giao.");
          if (
            (lotBalances(state, target.id).get(transfer.fromLocationId) ?? 0) <
            transfer.quantity
          )
            return fail("Không đủ tồn tại địa điểm xuất.");
          if (
            target.expirationDate &&
            target.expirationDate <
              new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Ho_Chi_Minh",
              }).format(new Date(command.occurredAt))
          )
            return fail("Lô đã quá hạn sử dụng.");
          transfer.dispatchedAt = command.occurredAt;
        } else transfer.receivedAt = command.occurredAt;
        transfer.status = command.status;
        const placeId =
          command.status === "dispatched"
            ? transfer.fromLocationId
            : transfer.toLocationId;
        const place = next.locations.find((item) => item.id === placeId)!;
        if (
          place.status !== "active" ||
          !next.partners.some(
            (item) => item.id === place.partnerId && item.status === "active",
          )
        )
          return fail("Đơn vị/địa điểm giao nhận đã ngừng hoạt động.");
        next.events.push({
          id:
            transfer.id +
            (command.status === "dispatched" ? "-dispatch" : "-receipt"),
          lotId: transfer.lotId,
          eventType:
            command.status === "dispatched" ? "dispatched" : "delivered",
          occurredAt: command.occurredAt,
          recordedAt: now,
          locationId: place.id,
          partnerId: place.partnerId,
          actorId: null,
          quantity: transfer.quantity,
          unit: transfer.unit,
          description: transfer.notes,
          evidence: [],
        });
      }
      audit("handover", transfer.id, before, transfer);
      break;
    }
    case "incident":
      error = upsert(
        next.incidents,
        { ...command.value, updatedAt: now },
        command.editing,
      );
      break;
    case "deleteLot":
      if (
        next.events.some((item) => item.lotId === command.id) ||
        next.inputs.some(
          (item) =>
            item.inputLotId === command.id || item.outputLotId === command.id,
        ) ||
        next.handovers.some((item) => item.lotId === command.id) ||
        next.incidents.some((item) => item.lotIds.includes(command.id))
      )
        return fail("Không xóa lô có lịch sử hoặc quan hệ phụ thuộc.");
      if (!next.lots.some((item) => item.id === command.id))
        return fail("Không tìm thấy lô.");
      next.lots = next.lots.filter((item) => item.id !== command.id);
      audit(
        "deleteLot",
        command.id,
        state.lots.find((item) => item.id === command.id),
        null,
      );
  }
  if (error) return fail(error);
  const validation = validateState(next, refs, now);
  return validation
    ? fail(validation)
    : { ok: true, state: stateSchema.parse(next) };
}
