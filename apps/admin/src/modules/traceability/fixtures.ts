import type { Product } from "../product/model/product.types";
import { applyCommand } from "./commands";
import { type TraceState, type TraceLot } from "./model";

export function traceFixtures(products: Product[]): TraceState {
  const time = "2026-11-01T03:00:00.000Z";
  let state: TraceState = {
    version: 1,
    partners: [
      {
        id: "DT-SOURCE",
        name: "Hợp tác xã Nguồn Việt",
        partnerType: "supplier",
        contact: "0900000101",
        address: "Đồng bằng sông Cửu Long",
        status: "active",
      },
      {
        id: "DT-FACTORY",
        name: "Cơ sở chế biến An Phú",
        partnerType: "processor",
        contact: "0900000102",
        address: "Cần Thơ",
        status: "active",
      },
      {
        id: "DT-DIST",
        name: "Đơn vị phân phối Miền Nam",
        partnerType: "distributor",
        contact: "0900000103",
        address: "Thành phố Hồ Chí Minh",
        status: "active",
      },
    ],
    locations: [
      {
        id: "LOC-FACTORY",
        name: "Kho đầu vào An Phú",
        type: "factory",
        address: "Cần Thơ",
        partnerId: "DT-FACTORY",
        status: "active",
      },
      {
        id: "LOC-WAREHOUSE",
        name: "Kho phân phối Bình Tân",
        type: "warehouse",
        address: "Thành phố Hồ Chí Minh",
        partnerId: "DT-DIST",
        status: "active",
      },
      {
        id: "LOC-FARM",
        name: "Điểm thu mua Nguồn Việt",
        type: "collection",
        address: "Sóc Trăng",
        partnerId: "DT-SOURCE",
        status: "active",
      },
    ],
    materials: [
      { id: "MAT-RICE", name: "Lúa nguyên liệu" },
      { id: "MAT-COFFEE", name: "Hạt cà phê thô" },
    ],
    lots: [],
    inputs: [],
    events: [],
    quality: [],
    handovers: [],
    incidents: [],
    audit: [],
  };
  const raw = (
    id: string,
    batchCode: string,
    materialId: string,
    initialQuantity: number,
  ): TraceLot => ({
    id,
    batchCode,
    productId: null,
    materialId,
    lotType: "raw",
    initialQuantity,
    unit: "kg",
    productionDate: "2026-11-01",
    expirationDate: "2027-11-01",
    status: "active",
    originLocationId: "LOC-FACTORY",
    responsiblePartnerId: "DT-SOURCE",
    sourceNote: "Thu mua theo hồ sơ nguồn do đơn vị cung cấp tự khai.",
    requiredEvents: ["collected"],
    requiresQuality: false,
    createdAt: time,
    updatedAt: time,
  });
  state.lots.push(
    raw("RAW-A", "NL-LUA-A", "MAT-RICE", 120),
    raw("RAW-B", "NL-LUA-B", "MAT-RICE", 80),
    raw("RAW-C", "NL-CA-PHE", "MAT-COFFEE", 60),
  );
  for (const lot of state.lots)
    state.events.push({
      id: lot.id + "-collected",
      lotId: lot.id,
      eventType: "collected",
      occurredAt: time,
      recordedAt: time,
      locationId: "LOC-FARM",
      partnerId: "DT-SOURCE",
      actorId: null,
      quantity: lot.initialQuantity,
      unit: lot.unit,
      description: "Tiếp nhận hồ sơ thu mua của đơn vị nguồn.",
      evidence: ["Phiếu thu mua " + lot.batchCode],
    });
  const rice = products.find((item) => item.id === "P002");
  const coffee = products.find((item) => item.id === "P001");
  const finished = (
    id: string,
    batchCode: string,
    productId: string,
    quantity: number,
  ): TraceLot => ({
    ...raw(id, batchCode, "MAT-RICE", quantity),
    materialId: null,
    productId,
    lotType: "finished",
    productionDate: "2026-11-03",
    requiredEvents: ["processed", "packaged"],
    requiresQuality: true,
    sourceNote: "",
    createdAt: "2026-11-03T03:00:00.000Z",
    updatedAt: "2026-11-03T03:00:00.000Z",
    responsiblePartnerId: "DT-FACTORY",
  });
  if (rice) {
    state.lots.push(
      finished("LOT-RICE", "TP-GAO-001", rice.id, 100),
      finished("LOT-RICE-2", "TP-GAO-002", rice.id, 20),
    );
    state.inputs.push(
      {
        id: "IN-A",
        inputLotId: "RAW-A",
        outputLotId: "LOT-RICE",
        fromLocationId: "LOC-FACTORY",
        quantity: 100,
        unit: "kg",
        createdAt: "2026-11-03T03:00:00.000Z",
      },
      {
        id: "IN-B",
        inputLotId: "RAW-B",
        outputLotId: "LOT-RICE",
        fromLocationId: "LOC-FACTORY",
        quantity: 50,
        unit: "kg",
        createdAt: "2026-11-03T03:00:00.000Z",
      },
      {
        id: "IN-C",
        inputLotId: "LOT-RICE",
        outputLotId: "LOT-RICE-2",
        fromLocationId: "LOC-FACTORY",
        quantity: 20,
        unit: "kg",
        createdAt: "2026-11-04T03:00:00.000Z",
      },
    );
  }
  if (coffee) {
    state.lots.push(finished("LOT-COFFEE", "TP-CA-PHE-001", coffee.id, 40));
    state.inputs.push({
      id: "IN-D",
      inputLotId: "RAW-C",
      outputLotId: "LOT-COFFEE",
      fromLocationId: "LOC-FACTORY",
      quantity: 50,
      unit: "kg",
      createdAt: "2026-11-03T03:00:00.000Z",
    });
  }
  for (const lot of state.lots.filter(
    (item) => item.lotType === "finished" && item.id !== "LOT-RICE-2",
  )) {
    for (const type of ["processed", "packaged"] as const)
      state.events.push({
        id: lot.id + "-" + type,
        lotId: lot.id,
        eventType: type,
        occurredAt: "2026-11-03T06:00:00.000Z",
        recordedAt: "2026-11-03T07:00:00.000Z",
        locationId: "LOC-FACTORY",
        partnerId: "DT-FACTORY",
        actorId: null,
        quantity: lot.initialQuantity,
        unit: "kg",
        description:
          type === "processed"
            ? "Hoàn thành chế biến tại cơ sở An Phú."
            : "Đóng gói, đối chiếu mã lô.",
        evidence: [],
      });
  }
  const refs = {
    productIds: new Set(products.map((item) => item.id)),
    actorIds: new Set<string>(),
  };
  function run(command: Parameters<typeof applyCommand>[1], now: string) {
    const result = applyCommand(state, command, refs, now);
    if (!result.ok) throw new Error("Fixture không hợp lệ: " + result.error);
    state = result.state;
  }
  if (rice) {
    run(
      {
        kind: "quality",
        value: {
          id: "QC-RICE",
          lotId: "LOT-RICE",
          checkType: "Đối chiếu hồ sơ lô",
          checkedAt: "2026-11-04T06:00:00.000Z",
          result: "passed",
          inspector: "Người kiểm tra tại cơ sở",
          notes: "Hồ sơ nội bộ phù hợp; không phải chứng nhận độc lập.",
          evidence: ["Biên bản kiểm tra nội bộ QC-RICE"],
          eventId: "QC-RICE-event",
        },
        locationId: "LOC-FACTORY",
      },
      "2026-11-04T07:00:00.000Z",
    );
    run(
      {
        kind: "handover",
        value: {
          id: "GN-001",
          lotId: "LOT-RICE",
          fromLocationId: "LOC-FACTORY",
          toLocationId: "LOC-WAREHOUSE",
          quantity: 20,
          unit: "kg",
          status: "draft",
          dispatchedAt: null,
          receivedAt: null,
          notes: "Bàn giao theo phiếu nội bộ GN-001.",
        },
      },
      "2026-11-05T03:00:00.000Z",
    );
    run(
      {
        kind: "transition",
        id: "GN-001",
        status: "dispatched",
        occurredAt: "2026-11-05T03:00:00.000Z",
      },
      "2026-11-05T04:00:00.000Z",
    );
    run(
      {
        kind: "transition",
        id: "GN-001",
        status: "received",
        occurredAt: "2026-11-06T03:00:00.000Z",
      },
      "2026-11-06T04:00:00.000Z",
    );
  }
  if (coffee)
    run(
      {
        kind: "quality",
        value: {
          id: "QC-COFFEE",
          lotId: "LOT-COFFEE",
          checkType: "Rà soát hồ sơ",
          checkedAt: "2026-11-04T06:00:00.000Z",
          result: "pending",
          inspector: "Người phụ trách kiểm tra",
          notes: "Đang chờ bổ sung hồ sơ nguồn.",
          evidence: [],
          eventId: "QC-COFFEE-event",
        },
        locationId: "LOC-FACTORY",
      },
      "2026-11-08T07:00:00.000Z",
    );
  state.incidents.push({
    id: "SC-001",
    title: "Cần bổ sung hồ sơ nguồn lúa B",
    lotIds: ["RAW-B"],
    severity: "high",
    status: "open",
    description: "Thiếu bản đối chiếu chứng từ đầu vào.",
    resolution: "",
    createdAt: "2026-11-07T03:00:00.000Z",
    updatedAt: "2026-11-07T03:00:00.000Z",
  });
  state.audit = state.audit.map((item, index) => ({ ...item, id: "AUDIT-SEED-" + index }));
  return state;
}
