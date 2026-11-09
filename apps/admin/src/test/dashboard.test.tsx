import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ProductProvider, useProducts } from "../app/providers/product-provider";
import { OrganizationProvider } from "../app/providers/organization-provider";
import { TraceabilityProvider } from "../app/providers/traceability-provider";
import { parseProductSnapshot, PRODUCT_STORAGE_KEY } from "../modules/product/data/product-storage";
import { normalizeProduct, validateProduct, normalizeSearch } from "../modules/product/model/product.validation";
import { products } from "../modules/product/data/products.mock";
import { useProductFilters } from "../features/product-management/model/use-product-filters";
import { useProductPagination } from "../features/product-management/model/use-product-pagination";
import { ProductCreateDialog } from "../features/product-management/ui/product-create-dialog";
import { ProductEditDialog } from "../features/product-management/ui/product-edit-dialog";
import { ProductsPage } from "../pages/products/page";
import { AppRoutes } from "../app/router/routes";
import { ProductSearch } from "../features/product-management/ui/product-search";
import { ProductPagination } from "../features/product-management/ui/product-pagination";
import { vi } from "vitest";

beforeEach(() => localStorage.clear());

describe("Quy tắc sản phẩm và storage", () => {
  it("chuẩn hóa mã, khoảng trắng và tiếng Việt", () => {
    expect(normalizeProduct({...products[0],id:" p001 ",name:"  Cà   phê "}).name).toBe("Cà phê");
    expect(normalizeSearch("  Đồ   UỐNG ")).toBe("do uong");
  });
  it("từ chối trường rỗng, mã sai, độ dài và trạng thái sai", () => {
    expect(validateProduct({...products[0],id:"!",name:"",category:""})).toHaveProperty("id");
    expect(validateProduct({...products[0],name:"x".repeat(151)})).toHaveProperty("name");
    expect(validateProduct({...products[0],category:"x".repeat(81)})).toHaveProperty("category");
  });
  it.each(["not json", "{}", '[{"id":"P1"}]', JSON.stringify([products[0],products[0]])])("fallback snapshot không hợp lệ: %s", raw => {
    expect(parseProductSnapshot(raw)).toEqual(products);
  });
  it("giữ nguyên danh sách rỗng và snapshot hợp lệ", () => {
    expect(parseProductSnapshot("[]")).toEqual([]);
    expect(parseProductSnapshot(JSON.stringify([products[0]]))).toEqual([products[0]]);
  });
});

describe("Provider CRUD và persistence", () => {
  it("chặn duplicate ngay trong cùng một batch, sửa và xóa đúng ID", () => {
    const {result} = renderHook(() => useProducts(), {wrapper:ProductProvider});
    act(() => {
      expect(result.current.addProduct({...products[0],id:"P900"})).toBeNull();
      expect(result.current.addProduct({...products[0],id:" p900 "})).toBe("Mã sản phẩm đã tồn tại.");
    });
    expect(result.current.products).toHaveLength(8);
    act(() => { expect(result.current.updateProduct({...products[0],name:"Tên mới"})).toBeNull(); });
    expect(result.current.products.find(p => p.id === "P001")?.name).toBe("Tên mới");
    act(() => { expect(result.current.deleteProduct(" p001 ")).toBeNull(); });
    expect(result.current.products.some(p => p.id === "P001")).toBe(false);
    expect(result.current.products.some(p => p.id === "P002")).toBe(true);
    expect(JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY) ?? "null")).toEqual(result.current.products);
  });
  it("không cập nhật khi dữ liệu lỗi hoặc ID không có", () => {
    const {result} = renderHook(() => useProducts(), {wrapper:ProductProvider});
    act(() => {
      expect(result.current.addProduct({...products[0],name:"   "})).toBeTruthy();
      expect(result.current.updateProduct({...products[0],id:"MISSING"})).toBeTruthy();
      expect(result.current.deleteProduct("MISSING")).toBeTruthy();
      expect(result.current.deleteProduct(" ")).toBeTruthy();
    });
    expect(result.current.products).toEqual(products);
  });
  it("khôi phục state từ storage sau khi mount lại", () => {
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify([products[0]]));
    const {result} = renderHook(() => useProducts(), {wrapper:ProductProvider});
    expect(result.current.products).toHaveLength(1);
  });
  it("báo lỗi khi trình duyệt chặn storage", () => {
    const spy=vi.spyOn(Storage.prototype,"setItem").mockImplementation(() => {throw new Error("blocked");});
    const {result}=renderHook(() => useProducts(),{wrapper:ProductProvider});
    expect(result.current.storageError).toBeTruthy();
    spy.mockRestore();
  });
});

describe("Pipeline, thống kê và UI", () => {
  it("kết hợp tìm kiếm không dấu, trạng thái và danh mục", () => {
    const {result}=renderHook(() => useProductFilters(products));
    act(() => {result.current.setKeyword("  ca phe ");result.current.setStatus("active");result.current.setCategory("Nông sản");});
    expect(result.current.visibleProducts.map(p => p.id)).toEqual(["P001"]);
    act(() => result.current.setKeyword("[?!"));
    expect(result.current.visibleProducts).toEqual([]);
  });
  it("sorting đảo chiều và danh mục hết sản phẩm được reset", () => {
    const {result,rerender}=renderHook(({items})=>useProductFilters(items),{initialProps:{items:products}});
    const ascending=result.current.visibleProducts.map(p=>p.id);
    act(()=>result.current.setSortOrder("name-desc"));
    expect(result.current.visibleProducts.map(p=>p.id)).toEqual([...ascending].reverse());
    act(()=>result.current.setCategory("Nông sản"));
    rerender({items:products.filter(p=>p.id!=="P001")});
    expect(result.current.category).toBe("all");
  });
  it("clamp phân trang sau khi dữ liệu giảm", () => {
    const {result,rerender}=renderHook(({items})=>useProductPagination(items,3),{initialProps:{items:products}});
    act(()=>result.current.goToPage(3));
    expect(result.current.pageItems).toHaveLength(1);
    rerender({items:products.slice(0,3)});
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageItems).toHaveLength(3);
    act(()=>result.current.goToPage(-5));
    expect(result.current.currentPage).toBe(1);
  });
  it("search và pagination gọi đúng callback", () => {
    const change=vi.fn(),go=vi.fn();
    render(<><ProductSearch keyword="abc" onKeywordChange={change}/><ProductPagination currentPage={1} totalPages={6} onPageChange={go}/></>);
    fireEvent.change(screen.getByRole("searchbox"),{target:{value:"xyz"}});
    expect(screen.queryByRole("button", { name: "Xóa lọc" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Trang 2"}));
    expect(change).toHaveBeenCalledWith("xyz");expect(go).toHaveBeenCalledWith(2);
    expect(screen.getByText("Trước")).toBeDisabled();
  });
  it("form tạo hiển thị validation và không lưu dữ liệu rỗng", () => {
    const save=vi.fn();render(<ProductCreateDialog onCreate={save}/>);
    fireEvent.click(screen.getByText("Thêm sản phẩm"));
    fireEvent.click(screen.getByText("Lưu sản phẩm"));
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    expect(save).not.toHaveBeenCalled();
  });
  it("edit prefill đúng và hủy không cập nhật", () => {
    const save=vi.fn();render(<ProductEditDialog product={products[0]} onUpdate={save}/>);
    fireEvent.click(screen.getByText("Chỉnh sửa"));
    expect(screen.getByLabelText("Tên sản phẩm")).toHaveValue(products[0].name);
    fireEvent.click(screen.getByText("Hủy"));expect(save).not.toHaveBeenCalled();
  });
  it("empty state riêng khi danh sách chưa có sản phẩm", () => {
    localStorage.setItem(PRODUCT_STORAGE_KEY,"[]");
    render(<ProductProvider><ProductsPage/></ProductProvider>);
    expect(screen.getByText(/Chưa có sản phẩm. Hãy thêm sản phẩm đầu tiên/)).toBeInTheDocument();
  });
  it("route không tồn tại hiển thị fallback", () => {
    render(<MemoryRouter initialEntries={["/missing"]}><ProductProvider><OrganizationProvider><TraceabilityProvider><AppRoutes/></TraceabilityProvider></OrganizationProvider></ProductProvider></MemoryRouter>);
    expect(screen.getByRole("heading",{name:"Không tìm thấy trang"})).toBeInTheDocument();
  });
});
