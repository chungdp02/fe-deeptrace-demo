import { describe, it, expect } from "vitest";
import { act, renderHook, render, screen, fireEvent } from "@testing-library/react";
import { OrganizationProvider, useOrganization } from "../app/providers/organization-provider";
import { ORGANIZATION_KEY, initialOrganization, parseOrganization, companySchema, employeeSchema } from "../modules/organization/model";
import { CompanyPage } from "../pages/company/page";

describe("Các module quản trị", () => {
  it("fallback storage lỗi và từ chối định danh trùng", () => {
    expect(parseOrganization("broken")).toEqual(initialOrganization);
    expect(parseOrganization(JSON.stringify({...initialOrganization,employees:[initialOrganization.employees[0],initialOrganization.employees[0]]}))).toEqual(initialOrganization);
  });
  it("validate email, tên và số điện thoại", () => {
    expect(companySchema.safeParse({...initialOrganization.company,name:" ",phone:"abc"}).success).toBe(false);
    expect(employeeSchema.safeParse({...initialOrganization.employees[0],email:"invalid"}).success).toBe(false);
  });
  it("CRUD nhân viên chặn trùng và không đổi mã", () => {
    const {result}=renderHook(()=>useOrganization(),{wrapper:OrganizationProvider});
    const employee={...initialOrganization.employees[0],id:"NV900",email:"new@example.com"};
    act(()=>{expect(result.current.saveEmployee(employee)).toBeNull();expect(result.current.saveEmployee(employee)).toBeTruthy();});
    expect(result.current.employees).toHaveLength(4);
    act(()=>{expect(result.current.saveEmployee({...employee,id:"OTHER"},"NV900")).toBeTruthy();expect(result.current.saveEmployee({...employee,name:"Tên mới"},"NV900")).toBeNull();});
    expect(result.current.employees.find(item=>item.id==="NV900")?.name).toBe("Tên mới");
    act(()=>{expect(result.current.deleteEmployee("NV900")).toBeNull();expect(result.current.deleteEmployee("MISSING")).toBeTruthy();});
    expect(result.current.employees).toHaveLength(3);
  });
  it("cập nhật doanh nghiệp, lưu snapshot", () => {
    const {result}=renderHook(()=>useOrganization(),{wrapper:OrganizationProvider});
    act(()=>{expect(result.current.saveCompany({...initialOrganization.company,name:"Tên demo mới"})).toBeNull();});
    expect(result.current.company.name).toBe("Tên demo mới");
    expect(parseOrganization(localStorage.getItem(ORGANIZATION_KEY)).company.name).toBe("Tên demo mới");
  });
  it("khôi phục snapshot khi mount lại", () => {
    localStorage.setItem(ORGANIZATION_KEY,JSON.stringify({...initialOrganization,employees:[]}));
    const {result}=renderHook(()=>useOrganization(),{wrapper:OrganizationProvider});
    expect(result.current.employees).toEqual([]);
  });
  it("hủy thay đổi doanh nghiệp không ghi draft", () => {
    render(<OrganizationProvider><CompanyPage/></OrganizationProvider>);
    fireEvent.change(screen.getByLabelText("Tên doanh nghiệp"),{target:{value:"Chưa lưu"}});
    fireEvent.click(screen.getByText("Hủy thay đổi"));
    expect(screen.getByLabelText("Tên doanh nghiệp")).toHaveValue(initialOrganization.company.name);
  });
});
