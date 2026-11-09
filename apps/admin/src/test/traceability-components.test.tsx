import { LotAuditEntry } from "../features/traceability/audit-history";
import { initialOrganization } from "../modules/organization/model";
import { ListPagination } from "../features/admin-management/list-pagination";
import { within } from "@testing-library/react";
import { TraceTimeline } from "../features/traceability/timeline";
import { traceFixtures } from "../modules/traceability/fixtures";
import { initialCatalog } from "../modules/category/catalog";
import { TraceTable } from "../features/traceability/ui";
import userEvent from "@testing-library/user-event";
import { TraceDateField } from "../features/traceability/date-field";
import { describe, expect, it } from "vitest";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ProductProvider, useProducts } from "../app/providers/product-provider";
import { OrganizationProvider, useOrganization } from "../app/providers/organization-provider";
import { TraceabilityProvider, useTraceability } from "../app/providers/traceability-provider";
import { PreferencesProvider } from "../app/providers/preferences-provider";
import { LotForm } from "../features/traceability/lot-form";
import { EventForm, QualityForm } from "../features/traceability/event-forms";
import { TraceForm } from "../features/traceability/ui";
import { LookupPage } from "../pages/traceability/lookup-page";
import { TRACE_KEY } from "../modules/traceability/model";

const wrapper = ({ children }: { children: React.ReactNode }) => <MemoryRouter><ProductProvider><OrganizationProvider traceabilityMode><TraceabilityProvider><PreferencesProvider>{children}</PreferencesProvider></TraceabilityProvider></OrganizationProvider></ProductProvider></MemoryRouter>;
describe("Traceability Provider và form", () => {
  it("không ghi đè legacy hoặc snapshot truy xuất lỗi khi mount", () => {
    localStorage.setItem("deeptrace.admin.operations.v1", "legacy-sales-data");
    localStorage.setItem(TRACE_KEY, "broken-trace");
    const { result } = renderHook(() => useTraceability(), { wrapper });
    expect(result.current.warning).toBeTruthy();
    expect(localStorage.getItem(TRACE_KEY)).toBe("broken-trace");
    expect(localStorage.getItem("deeptrace.admin.operations.v1")).toBe("legacy-sales-data");
    act(() => { expect(result.current.execute({ kind: "lot", editing: true, value: { ...result.current.state.lots[0], sourceNote: "Bổ sung nguồn" } })).toBeNull(); });
    expect(Object.keys(localStorage).some(key => key.startsWith(TRACE_KEY + ".backup."))).toBe(true);
    expect(JSON.parse(localStorage.getItem(TRACE_KEY)!).lots[0].sourceNote).toBe("Bổ sung nguồn");
    expect(localStorage.getItem("deeptrace.admin.operations.v1")).toBe("legacy-sales-data");
  });
  it("chặn xóa Product có lô và chặn xóa nhân sự có sự kiện", () => {
    const { result } = renderHook(() => ({ products: useProducts(), trace: useTraceability(), organization: useOrganization() }), { wrapper });
    act(() => {
      expect(result.current.products.deleteProduct("P001")).toContain("lô truy xuất");
      const event = result.current.trace.state.events[0];
      expect(result.current.trace.execute({ kind: "event", value: { ...event, id: "ACTOR-EV", actorId: "NV001" } })).toBeNull();
      expect(result.current.organization.deleteEmployee("NV001")).toContain("sự kiện");
    });
  });
  it("tách tổ chức v2 khỏi ticket legacy và giữ hồ sơ doanh nghiệp/nhân sự", () => {
    renderHook(() => useOrganization(), { wrapper });
    expect(localStorage.getItem("deeptrace.admin.trace-organization.v1")).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("deeptrace.admin.trace-organization.v1")!).tickets).toEqual([]);
    expect(localStorage.getItem("deeptrace.admin.organization.v1")).toBeNull();
  });
  it("lot/event/quality forms có field validation và không submit rỗng", () => {
    const noop = () => {};
    const { unmount } = render(<LotForm onClose={noop} />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thông tin" }));
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    unmount();
    const view = render(<EventForm onClose={noop} />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thông tin" }));
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    view.unmount();
    render(<QualityForm onClose={noop} />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thông tin" }));
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
  });
  it("form đối tác/địa điểm dùng nhãn lỗi liên kết input", () => {
    render(<TraceForm title="Thêm đối tác" fields={[{ name: "name", label: "Tên đối tác", required: true }]} initial={{ name: "" }} onSave={() => null} onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Lưu thông tin" }));
    expect(screen.getByLabelText(/Tên đối tác/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Không được để trống");
  });
  it("lookup hiện nhiều lô Product và trạng thái không có kết quả", () => {
    render(<LookupPage />, { wrapper });
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "P002" } });
    fireEvent.click(screen.getByRole("button", { name: "Tra cứu" }));
    expect(screen.getByRole("heading", { name: "TP-GAO-001" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "TP-GAO-002" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "UNKNOWN" } });
    fireEvent.click(screen.getByRole("button", { name: "Tra cứu" }));
    expect(screen.getByRole("status")).toHaveTextContent("Không tìm thấy");
  });
});

it("lịch tiếng Việt chọn ngày giữ nguyên giờ nghiệp vụ", async () => {
  const user = userEvent.setup();
  let value = "";
  render(<TraceDateField id="test-date" label="Thời gian" kind="datetime-local" value="2026-11-09T10:30" invalid={false} onChange={next => { value = next; }} />);
  await user.click(screen.getByRole("button", { name: "Chọn ngày: Thời gian" }));
  expect(await screen.findByRole("button", { name: "Tháng sau" }, { timeout: 10000 })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Chủ Nhật, 08 tháng 11 2026" }));
  expect(value).toBe("2026-11-08T10:30");
});

it("timeline sắp thứ tự ổn định và hiện lượng, người ghi, chứng từ, hai loại thời gian", () => {
  const state = traceFixtures(initialCatalog().products);
  const event = state.events[0];
  state.events = [
    { ...event, id: "B", description: "Công đoạn B", actorId: "NV", quantity: 2, unit: "kg", evidence: ["PHIEU-01"] },
    { ...event, id: "A", description: "Công đoạn A" },
  ];
  const view = render(<TraceTimeline state={state} lotId={event.lotId} employees={[{ id: "NV", name: "Người ghi mẫu" }]} />);
  const rows = within(screen.getByRole("list", { name: "Hành trình sự kiện" })).getAllByRole("listitem");
  expect(rows[0]).toHaveTextContent("Công đoạn A");
  expect(rows[1]).toHaveTextContent("Công đoạn B");
  expect(rows[1]).toHaveTextContent("Số lượng liên quan: 2 kg");
  expect(rows[1]).toHaveTextContent("Người ghi mẫu");
  expect(rows[1]).toHaveTextContent("PHIEU-01");
  expect(rows[1]).toHaveTextContent("Ghi vào ứng dụng:");
  expect(rows[1].querySelector("time")).toHaveAttribute("dateTime", event.occurredAt);
  view.rerender(<TraceTimeline state={{ ...state, events: [] }} lotId={event.lotId} employees={[]} />);
  expect(screen.getByText(/Chưa ghi nhận sự kiện/)).toBeVisible();
});
it("bảng truy xuất giữ phân trang cũ và có trạng thái rỗng sau lọc", () => {
  localStorage.setItem("deeptrace.admin.preferences.v1", "3");
  const rows = Array.from({ length: 4 }, (_, index) => ({ id: String(index), name: "Lô " + (index + 1) }));
  const columns = [{ label: "Mã lô", render: (row: typeof rows[number]) => row.name }];
  const view = render(<TraceTable rows={rows} columns={columns} />, { wrapper: PreferencesProvider });
  expect(screen.getByText("Trang 1 / 2")).toBeVisible();
  expect(screen.getByRole("button", { name: "Trước" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Sau" }));
  expect(screen.getByText("Lô 4")).toBeVisible();
  expect(screen.queryByText("Lô 1")).not.toBeInTheDocument();
  view.rerender(<TraceTable rows={[]} columns={columns} />);
  expect(screen.getByText("Không có dữ liệu phù hợp.")).toBeVisible();
});

it("thông báo fallback organization legacy hỏng và giữ raw gốc", () => {
  localStorage.setItem("deeptrace.admin.organization.v1", "legacy-organization-broken");
  const { result } = renderHook(() => useOrganization(), { wrapper });
  expect(result.current.storageError).toContain("Bản gốc vẫn được giữ");
  expect(localStorage.getItem("deeptrace.admin.organization.v1")).toBe("legacy-organization-broken");
  expect(localStorage.getItem("deeptrace.admin.trace-organization.v1")).toBeTruthy();
});

it("phân trang theo mẫu đơn giản và bổ sung số khi nhiều trang", () => {
  let next = 0;
  const view = render(<ListPagination currentPage={1} totalPages={2} onPageChange={page => { next = page; }} />);
  expect(screen.queryByRole("button", { name: "Trang 1" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Sau" }));
  expect(next).toBe(2);
  view.rerender(<ListPagination currentPage={10} totalPages={20} onPageChange={page => { next = page; }} />);
  expect(screen.getByRole("button", { name: "Trang 10" })).toHaveAttribute("aria-current", "page");
  expect(screen.queryByRole("button", { name: "Trang 5" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Trang 20" }));
  expect(next).toBe(20);
  view.rerender(<ListPagination currentPage={20} totalPages={20} onPageChange={() => {}} />);
  expect(screen.getByRole("button", { name: "Sau" })).toBeDisabled();
});

it("giữ hồ sơ tổ chức khi đọc snapshot cũ có ticket sau cleanup", () => {
  const raw = JSON.stringify({ ...initialOrganization, company: { ...initialOrganization.company, name: "Hồ sơ kế thừa" }, tickets: [{ id: "LEGACY-TICKET", subject: "Nội dung cũ", requester: "Người yêu cầu", email: "legacy@example.com", message: "Bản ghi hỗ trợ lịch sử", status: "open", assigneeId: "NV001" }] });
  localStorage.setItem("deeptrace.admin.organization.v1", raw);
  const { result } = renderHook(() => useOrganization(), { wrapper });
  expect(result.current.company.name).toBe("Hồ sơ kế thừa");
  expect(result.current.employees).toHaveLength(initialOrganization.employees.length);
  expect(result.current.tickets).toEqual([]);
  expect(localStorage.getItem("deeptrace.admin.organization.v1")).toBe(raw);
});

it("lịch sử chỉnh sửa có nhãn dễ hiểu thay cho dữ liệu kỹ thuật", () => {
  const record = { id: "AUDIT", entity: "lot", entityId: "LOT", changedAt: "2026-11-09T00:00:00.000Z", before: JSON.stringify({ sourceNote: "Nguồn cũ" }), after: JSON.stringify({ sourceNote: "Nguồn mới" }) };
  render(<LotAuditEntry record={record} partners={[]} />);
  fireEvent.click(screen.getByText(/Chỉnh sửa thông tin lô/));
  expect(screen.getByText("Thông tin nguồn")).toBeVisible();
  expect(screen.getByText("Nguồn cũ")).toBeVisible();
  expect(screen.getByText("Nguồn mới")).toBeVisible();
  expect(screen.queryByText(/sourceNote/)).not.toBeInTheDocument();
});
it("lịch sử hỏng hiển thị thông báo rõ ràng", () => {
  render(<LotAuditEntry record={{ id: "AUDIT", entity: "lot", entityId: "LOT", changedAt: "2026-11-09T00:00:00.000Z", before: "broken", after: "{}" }} partners={[]} />);
  expect(screen.getByText("Không thể hiển thị chi tiết bản ghi lịch sử này.")).toBeVisible();
});
