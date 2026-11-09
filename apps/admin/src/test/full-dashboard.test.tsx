import { describe,it,expect } from "vitest";
import { renderHook,act,render,screen,fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { initialCatalog,saveCategory,deleteCategory,parseCatalog,CATALOG_KEY,loadCatalog } from "../modules/category/catalog";
import { ProductProvider,useProducts } from "../app/providers/product-provider";
import { OrganizationProvider } from "../app/providers/organization-provider";
import { initialOrganization,companySchema,employeeSchema } from "../modules/organization/model";
import { CategoriesPage } from "../pages/categories/page";
import { PreferencesProvider,usePreferences } from "../app/providers/preferences-provider";
import { SettingsPage } from "../pages/settings/page";

const wrapper=({children}:{children:React.ReactNode})=><MemoryRouter><ProductProvider><OrganizationProvider><PreferencesProvider>{children}</PreferencesProvider></OrganizationProvider></ProductProvider></MemoryRouter>;

describe("Danh mục và tính toàn vẹn catalog",()=>{
  it("không cho tên rỗng hoặc trùng sau chuẩn hóa",()=>{
    const catalog=initialCatalog();
    expect(typeof saveCategory(catalog,{id:"NEW",name:" "})).toBe("string");
    expect(typeof saveCategory(catalog,{id:"NEW",name:"  nong   san "})).toBe("string");
  });
  it("đổi tên giữ ID và cập nhật toàn bộ sản phẩm tham chiếu",()=>{
    const catalog=initialCatalog();const old=catalog.categories[0];
    const result=saveCategory(catalog,{id:old.id,name:"Cà phê"},old.id);
    expect(typeof result).not.toBe("string");
    if(typeof result==="string")throw new Error(result);
    expect(result.categories[0].id).toBe(old.id);
    expect(result.products[0].category).toBe("Cà phê");
    expect(catalog.products[0].category).toBe(old.name);
    expect(parseCatalog(JSON.stringify(result))).toEqual(result);
  });
  it("chặn xóa danh mục đang dùng, cho xóa danh mục không dùng",()=>{
    const catalog=initialCatalog();expect(typeof deleteCategory(catalog,catalog.categories[0].id)).toBe("string");
    const withEmpty={...catalog,categories:[...catalog.categories,{id:"EMPTY",name:"Danh mục trống"}]};
    const result=deleteCategory(withEmpty,"EMPTY");expect(typeof result).not.toBe("string");
    if(typeof result!=="string")expect(result.categories).toEqual(catalog.categories);
  });
  it("từ chối snapshot lỗi hoặc sản phẩm mồ côi",()=>{
    expect(parseCatalog("broken")).toBeNull();
    const catalog=initialCatalog();expect(parseCatalog(JSON.stringify({...catalog,categories:[]}))).toBeNull();
    localStorage.setItem(CATALOG_KEY,"broken");expect(loadCatalog()).toEqual(initialCatalog());
  });
  it("Provider giữ quan hệ sau rename và từ chối category chưa có",()=>{
    const {result}=renderHook(()=>useProducts(),{wrapper:ProductProvider});const category=result.current.categories[0];
    act(()=>{expect(result.current.saveCategory({...category,name:"Danh mục mới"},category.id)).toBeNull();});
    expect(result.current.products[0].category).toBe("Danh mục mới");
    act(()=>expect(result.current.addProduct({...result.current.products[0],id:"P999",category:"Không tồn tại"})).toBeTruthy());
    expect(parseCatalog(localStorage.getItem(CATALOG_KEY)??"")?.products[0].category).toBe("Danh mục mới");
  });
  it("form category hiển thị lỗi và cancel không thêm dữ liệu",()=>{
    render(<CategoriesPage/>,{wrapper});fireEvent.click(screen.getByRole("button",{name:"Thêm danh mục"}));fireEvent.click(screen.getByText("Lưu danh mục"));expect(screen.getByRole("alert")).toHaveTextContent("Tên danh mục");fireEvent.click(screen.getByText("Hủy"));expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
it("URL company và phòng ban phải hợp lệ",()=>{
  expect(companySchema.safeParse({...initialOrganization.company,phone:"---------"}).success).toBe(false);
  expect(companySchema.safeParse({...initialOrganization.company,website:"javascript:alert(1)"}).success).toBe(false);
  expect(employeeSchema.safeParse({...initialOrganization.employees[0],department:"invalid"}).success).toBe(false);
});

describe("Settings",()=>{
  it("page size có persistence và từ chối giá trị lạ",()=>{
    const {result}=renderHook(()=>usePreferences(),{wrapper:PreferencesProvider});act(()=>result.current.setPageSize(5));expect(result.current.pageSize).toBe(5);act(()=>result.current.setPageSize(99));expect(result.current.pageSize).toBe(5);
  });
  it("cài đặt chỉ hiển thị tùy chọn hữu ích và không có reset dữ liệu",()=>{
    render(<SettingsPage/>,{wrapper});expect(screen.getByRole("combobox",{name:"Số bản ghi mỗi trang"})).toBeInTheDocument();expect(screen.queryByRole("button",{name:/Khôi phục/})).not.toBeInTheDocument();
  });
});
