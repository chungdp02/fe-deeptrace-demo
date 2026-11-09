import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ProductProvider } from "../app/providers/product-provider";
import { OrganizationProvider } from "../app/providers/organization-provider";
import { TraceabilityProvider } from "../app/providers/traceability-provider";
import { PreferencesProvider } from "../app/providers/preferences-provider";
import { AppRoutes } from "../app/router/routes";

const wrapper = ({ children }: { children: React.ReactNode }) => <ProductProvider><OrganizationProvider traceabilityMode><TraceabilityProvider><PreferencesProvider>{children}</PreferencesProvider></TraceabilityProvider></OrganizationProvider></ProductProvider>;

describe("Trang dashboard", () => {
  it.each([
    ["/", "Tổng quan"], ["/products", "Sản phẩm"], ["/categories", "Danh mục"],
    ["/materials", "Nguyên liệu"], ["/lots", "Lô sản xuất"], ["/lots/LOT-RICE", "TP-GAO-001"],
    ["/partners", "Đối tác chuỗi cung ứng"], ["/locations", "Cơ sở & địa điểm"],
    ["/trace-events", "Nhật ký truy xuất"], ["/quality", "Kiểm định chất lượng"],
    ["/shipments", "Giao nhận & bàn giao"], ["/inventory", "Tồn kho theo lô"],
    ["/incidents", "Sự cố nguồn gốc"], ["/traceability/lookup", "Tra cứu nguồn gốc"],
    ["/employees", "Nhân viên"], ["/company", "Doanh nghiệp"], ["/settings", "Cài đặt"],
    ["/orders", "Giao nhận & bàn giao"], ["/stores", "Cơ sở & địa điểm"], ["/support", "Sự cố nguồn gốc"],
    ["/reviews", "Không tìm thấy trang"], ["/promotions/campaigns", "Không tìm thấy trang"],
    ["/promotions/codes", "Không tìm thấy trang"],
  ])("render trang %s", async (path, heading) => {
    render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>, { wrapper });
    expect(await screen.findByRole("heading", { name: heading }, { timeout: 10000 })).toBeInTheDocument();
  }, 20000);
});
