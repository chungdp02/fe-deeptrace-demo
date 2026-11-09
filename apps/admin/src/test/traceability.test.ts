import { describe, expect, it } from "vitest";
import { initialCatalog } from "../modules/category/catalog";
import { traceFixtures } from "../modules/traceability/fixtures";
import { applyCommand } from "../modules/traceability/commands";
import { completeness, hasCycle, lotBalances, parseSnapshot, stateSchema, traceLots, validateState, type TraceState } from "../modules/traceability/model";

const products = initialCatalog().products;
const refs = { productIds: new Set(products.map(item => item.id)), actorIds: new Set<string>() };
const now = "2026-11-09T12:00:00.000Z";
const seed = () => traceFixtures(products);
function valid(state: TraceState) { return validateState(state, refs, now); }

describe("Schema và snapshot truy xuất", () => {
  it("fixtures hợp lệ, xác định và giữ Material độc lập Product", () => {
    expect(seed()).toEqual(seed()); expect(valid(seed())).toBeNull();
    expect(seed().lots.find(item => item.id === "RAW-A")?.productId).toBeNull();
    expect(validateState(traceFixtures([]), { productIds: new Set(), actorIds: new Set() }, now)).toBeNull();
  });
  it("từ chối mã lô trùng và tham chiếu lỗi", () => {
    const state = seed(); state.lots[1].batchCode = state.lots[0].batchCode;
    expect(valid(state)).toContain("Mã lô");
    state.lots[1].batchCode = "OTHER"; state.lots[0].materialId = "UNKNOWN";
    expect(valid(state)).toContain("Nguyên liệu");
  });
  it("quantity âm và hạn trước ngày sản xuất bị từ chối", () => {
    const state = seed(); state.lots[0].initialQuantity = -1; expect(valid(state)).toBeTruthy();
    state.lots[0].initialQuantity = 120; state.lots[0].expirationDate = "2026-01-01"; expect(valid(state)).toBeTruthy();
  });
  it("corruption dùng fallback và yêu cầu giữ nguyên snapshot gốc", () => {
    const fallback = seed(); const result = parseSnapshot("broken", fallback, refs);
    expect(result.state).toEqual(fallback); expect(result.preserveInvalid).toBe(true); expect(result.warning).toBeTruthy();
    expect(parseSnapshot(JSON.stringify(fallback), fallback, refs).preserveInvalid).toBe(false);
    expect(parseSnapshot(JSON.stringify({ ...fallback, version: 99 }), fallback, refs).preserveInvalid).toBe(true);
  });
});
describe("Lineage và số lượng", () => {
  it("truy ngược đủ hai nguồn và truy xuôi nhiều cấp không lặp", () => {
    expect(traceLots(seed(), "LOT-RICE", "backward").map(item => item.id).sort()).toEqual(["RAW-A", "RAW-B"]);
    expect(traceLots(seed(), "RAW-A", "forward").map(item => item.id)).toEqual(["LOT-RICE", "LOT-RICE-2"]);
  });
  it("cycle, self-link, orphan và lệch đơn vị bị chặn", () => {
    const state = seed(); const edge = state.inputs[0];
    state.inputs.push({ ...edge, id: "CYCLE", inputLotId: "LOT-RICE-2", outputLotId: "RAW-A" });
    expect(hasCycle(state)).toBe(true); expect(valid(state)).toBeTruthy();
    const result = applyCommand(seed(), { kind: "input", value: { ...edge, id: "SELF", outputLotId: edge.inputLotId } }, refs, now);
    expect(result.ok).toBe(false);
    const invalid = seed(); invalid.inputs[0].unit = "l"; expect(valid(invalid)).toContain("đơn vị");
    invalid.inputs[0].inputLotId = "MISSING"; expect(valid(invalid)).toContain("tham chiếu");
  });
  it("không cho tiêu hao vượt tồn hoặc thêm lại cùng quan hệ", () => {
    const state = seed();
    const edge = { ...state.inputs[0], id: "NEW", outputLotId: "LOT-COFFEE", quantity: 999 };
    expect(applyCommand(state, { kind: "input", value: edge }, refs, now).ok).toBe(false);
    expect(applyCommand(state, { kind: "input", value: { ...state.inputs[0], id: "DUP" } }, refs, now).ok).toBe(false);
    expect(lotBalances(state, "RAW-A").get("LOC-FACTORY")).toBe(20);
  });
  it("quantity được suy ra theo lô và địa điểm, không cộng kg với đơn vị khác", () => {
    const state = seed();
    expect(lotBalances(state, "LOT-RICE").get("LOC-FACTORY")).toBe(60);
    expect(lotBalances(state, "LOT-RICE").get("LOC-WAREHOUSE")).toBe(20);
  });
  it("traversal không vô hạn khi nhận đồ thị lỗi", () => {
    const state = seed(); state.inputs.push({ ...state.inputs[0], id: "BAD", inputLotId: "LOT-RICE-2", outputLotId: "RAW-A" });
    expect(traceLots(state, "RAW-A", "forward")).toHaveLength(2);
  });
});
describe("Sự kiện, kiểm định và bảo vệ lịch sử", () => {
  it("phân biệt occurredAt/recordedAt, chặn tương lai và actor lỗi", () => {
    const event = seed().events[0];
    const invalid = seed(); invalid.events[0].occurredAt = "2026-12-01T00:00:00.000Z"; expect(valid(invalid)).toContain("Thời gian");
    invalid.events[0] = { ...event, actorId: "NO-ACTOR" }; expect(valid(invalid)).toContain("Người ghi nhận");
  });
  it("ngày sự kiện theo múi giờ Việt Nam", () => {
    const state = seed(); state.events[0].occurredAt = "2026-10-31T18:00:00.000Z";
    expect(valid(state)).toBeNull();
  });
  it("sự kiện lượng sai và sự kiện bất khả thi bị chặn", () => {
    const state = seed(); state.events[0].quantity = 1000; expect(valid(state)).toContain("vượt");
    state.events[0].quantity = 10; state.events[0].eventType = "packaged"; expect(valid(state)).toContain("Chế biến");
  });
  it("kiểm định không đạt tạm giữ lô và lịch sử được ghi atomically", () => {
    const state = seed(); const check = { ...state.quality[0], id: "QC-FAIL", checkedAt: now, result: "failed" as const };
    const result = applyCommand(state, { kind: "quality", value: check, locationId: "LOC-FACTORY" }, refs, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.lots.find(item => item.id === "LOT-RICE")?.status).toBe("hold");
      expect(result.state.events.some(item => item.id === "QC-FAIL-event")).toBe(true);
      expect(result.state.audit.some(item => item.entity === "lot-quality-hold")).toBe(true);
      expect(completeness(result.state, result.state.lots.find(item => item.id === "LOT-RICE")!)).toContain("Kiểm định đạt");
    }
    expect(state.lots.find(item => item.id === "LOT-RICE")?.status).toBe("active");
  });
  it("không xóa lô có lịch sử hoặc sửa quantity/identity", () => {
    const state = seed();
    expect(applyCommand(state, { kind: "deleteLot", id: "RAW-A" }, refs, now).ok).toBe(false);
    expect(applyCommand(state, { kind: "lot", editing: true, value: { ...state.lots[0], initialQuantity: 999 } }, refs, now).ok).toBe(false);
    const result = applyCommand(state, { kind: "lot", editing: true, value: { ...state.lots[0], sourceNote: "Bổ sung hồ sơ" } }, refs, now);
    expect(result.ok).toBe(true); if (result.ok) expect(result.state.audit.at(-1)?.entityId).toBe("RAW-A");
  });
  it("không cho giả lập quality/dispatched qua form event", () => {
    const event = { ...seed().events[0], id: "FAKE", eventType: "dispatched" as const };
    expect(applyCommand(seed(), { kind: "event", value: event }, refs, now).ok).toBe(false);
  });
});
describe("Giao nhận", () => {
  function draft(lotId = "LOT-RICE", quantity = 5) {
    const value = { ...seed().handovers[0], id: "NEW-GN", lotId, quantity, status: "draft" as const, dispatchedAt: null, receivedAt: null };
    const result = applyCommand(seed(), { kind: "handover", value }, refs, now);
    if (!result.ok) throw new Error(result.error);
    return result.state;
  }
  it("nháp không trừ tồn; xuất/nhận cập nhật tồn và sự kiện đúng một lần", () => {
    const state = draft(); expect(lotBalances(state, "LOT-RICE").get("LOC-FACTORY")).toBe(60);
    const sent = applyCommand(state, { kind: "transition", id: "NEW-GN", status: "dispatched", occurredAt: now }, refs, now);
    expect(sent.ok).toBe(true); if (!sent.ok) return;
    expect(lotBalances(sent.state, "LOT-RICE").get("LOC-FACTORY")).toBe(55);
    expect(lotBalances(sent.state, "LOT-RICE").get("LOC-WAREHOUSE")).toBe(20);
    const received = applyCommand(sent.state, { kind: "transition", id: "NEW-GN", status: "received", occurredAt: now }, refs, now);
    expect(received.ok).toBe(true); if (!received.ok) return;
    expect(lotBalances(received.state, "LOT-RICE").get("LOC-WAREHOUSE")).toBe(25);
    expect(applyCommand(received.state, { kind: "transition", id: "NEW-GN", status: "received", occurredAt: now }, refs, now).ok).toBe(false);
  });
  it("chặn nhận trước xuất, vượt tồn và lô chưa đạt kiểm định", () => {
    const state = draft("LOT-RICE", 999);
    expect(applyCommand(state, { kind: "transition", id: "NEW-GN", status: "dispatched", occurredAt: now }, refs, now).ok).toBe(false);
    expect(applyCommand(draft("LOT-COFFEE"), { kind: "transition", id: "NEW-GN", status: "dispatched", occurredAt: now }, refs, now).ok).toBe(false);
    expect(applyCommand(draft(), { kind: "transition", id: "NEW-GN", status: "received", occurredAt: now }, refs, now).ok).toBe(false);
    const invalid = seed(); invalid.handovers[0].receivedAt = "2026-11-01T00:00:00.000Z"; expect(valid(invalid)).toBeTruthy();
  });
  it("không cho mượn tồn sẽ nhận trong tương lai", () => {
    const state = seed();
    const receipt = state.handovers[0]; receipt.receivedAt = "2026-11-08T03:00:00.000Z";
    state.events.find(item => item.id === receipt.id + "-receipt")!.occurredAt = receipt.receivedAt;
    state.events.find(item => item.id === receipt.id + "-receipt")!.recordedAt = receipt.receivedAt;
    const transfer = { ...receipt, id: "BACK", fromLocationId: "LOC-WAREHOUSE", toLocationId: "LOC-FACTORY", quantity: 10, status: "dispatched" as const, dispatchedAt: "2026-11-07T03:00:00.000Z", receivedAt: null };
    state.handovers.push(transfer);
    state.events.push({ ...state.events.find(item => item.id === receipt.id + "-dispatch")!, id: "BACK-dispatch", locationId: "LOC-WAREHOUSE", partnerId: "DT-DIST", quantity: 10, occurredAt: transfer.dispatchedAt!, recordedAt: transfer.dispatchedAt! });
    expect(valid(state)).toContain("thời điểm");
  });
});
it("schema không chấp nhận dữ liệu tùy ý", () => expect(stateSchema.safeParse({ version: 1 }).success).toBe(false));

it("kiểm định cùng thời điểm nghiệp vụ dùng lần ghi nhận mới nhất", () => {
  const state = seed();
  const check = { ...state.quality[0], id: "AAA", result: "pending" as const };
  const result = applyCommand(state, { kind: "quality", value: check, locationId: "LOC-FACTORY" }, refs, now);
  expect(result.ok).toBe(true);
  if (result.ok) expect(completeness(result.state, result.state.lots.find(item => item.id === "LOT-RICE")!)).toContain("Kiểm định đạt");
});

it("không đóng sự cố khi chưa có giải pháp và giữ FK sự kiện hệ thống", () => {
  const state = seed();
  const incident = { ...state.incidents[0], status: "closed" as const, resolution: "" };
  expect(applyCommand(state, { kind: "incident", value: incident, editing: true }, refs, now).ok).toBe(false);
  expect(applyCommand(state, { kind: "incident", value: { ...incident, resolution: "Đã bổ sung đủ hồ sơ" }, editing: true }, refs, now).ok).toBe(true);
  const invalid = seed(); invalid.quality = [];
  expect(valid(invalid)).toContain("kiểm định");
});

it("không ghi nhận ngày sản xuất ở tương lai", () => {
  const state = seed();
  state.lots[0].productionDate = "2026-12-01";
  state.lots[0].expirationDate = null;
  expect(valid(state)).toContain("tương lai");
});
