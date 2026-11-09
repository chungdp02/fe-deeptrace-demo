import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  organizationSchema,
  ORGANIZATION_KEY,
  companySchema,
  employeeSchema,
  parseOrganization,
  type OrganizationState,
  type Company,
  type Employee,
} from "../../modules/organization/model";

interface OrganizationContextValue extends OrganizationState {
  registerActorRemovalHandler: (
    handler: ((ids: string[]) => string | null) | null,
  ) => void;
  storageError: string | null;
  saveCompany: (company: Company) => string | null;
  saveEmployee: (employee: Employee, originalId?: string) => string | null;
  deleteEmployee: (id: string) => string | null;
}
const Context = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children, traceabilityMode = false }: { children: ReactNode; traceabilityMode?: boolean }) {
  const storageKey = traceabilityMode ? "deeptrace.admin.trace-organization.v1" : ORGANIZATION_KEY;
  const migrationNotice = useRef<string | null>(null);
  const [state, setState] = useState<OrganizationState>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const source = raw ?? (traceabilityMode ? localStorage.getItem(ORGANIZATION_KEY) : null);
      if (traceabilityMode && !raw && source) {
        let valid = false;
        try { valid = organizationSchema.safeParse(JSON.parse(source)).success; } catch { valid = false; }
        if (!valid) migrationNotice.current = "Dữ liệu tổ chức cũ không hợp lệ; đang dùng hồ sơ mặc định. Bản gốc vẫn được giữ trong trình duyệt.";
      }
      const parsed = parseOrganization(source);
      // Chỉ chuyển Company/Employees; ticket thương mại cũ không có ánh xạ đáng tin cậy sang sự cố lô.
      return traceabilityMode ? { ...parsed, tickets: [] } : parsed;
    } catch {
      const initial = parseOrganization(null);
      return traceabilityMode ? { ...initial, tickets: [] } : initial;
    }
  });
  const current = useRef(state);
  const actorRemoval = useRef<((ids: string[]) => string | null) | null>(null);
  const registerActorRemovalHandler = useCallback(
    (handler: ((ids: string[]) => string | null) | null) => {
      actorRemoval.current = handler;
    },
    [],
  );
  const [storageError, setStorageError] = useState<string | null>(null);
  function commit(next: OrganizationState, message: string) {
    current.current = next;
    setState(next);
    toast.success(message);
  }
  useEffect(() => {
    try {
      let notice: string | null = migrationNotice.current;
      if (traceabilityMode) {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          let valid = false;
          try { valid = organizationSchema.safeParse(JSON.parse(raw)).success; } catch { valid = false; }
          if (!valid) {
            localStorage.setItem(storageKey + ".backup." + Date.now(), raw);
            notice = "Dữ liệu tổ chức đã lưu không hợp lệ và đã được sao lưu. Đang sử dụng hồ sơ mặc định.";
          }
        }
      }
      localStorage.setItem(storageKey, JSON.stringify(state));
      setStorageError(notice);
    } catch {
      setStorageError(
        "Không thể lưu thay đổi vào trình duyệt. Dữ liệu có thể mất khi tải lại trang.",
      );
    }
  }, [state, storageKey, traceabilityMode]);
  function saveCompany(input: Company) {
    const result = companySchema.safeParse(input);
    if (!result.success) return result.error.issues[0].message;
    if (result.data.code !== current.current.company.code)
      return "Không được thay đổi mã doanh nghiệp.";
    commit(
      { ...current.current, company: result.data },
      "Đã lưu thông tin doanh nghiệp.",
    );
    return null;
  }
  function saveEmployee(input: Employee, originalId?: string) {
    const result = employeeSchema.safeParse(input);
    if (!result.success) return result.error.issues[0].message;
    const employee = { ...result.data, email: result.data.email.toLowerCase() };
    const employees = current.current.employees;
    if (originalId && !employees.some((item) => item.id === originalId))
      return "Không tìm thấy nhân viên cần cập nhật.";
    if (originalId && employee.id !== originalId)
      return "Không được thay đổi mã nhân viên.";
    if (
      employees.some(
        (item) =>
          item.id !== originalId &&
          (item.id === employee.id ||
            item.email.toLowerCase() === employee.email),
      )
    )
      return "Mã nhân viên hoặc email đã tồn tại.";
    commit(
      {
        ...current.current,
        employees: originalId
          ? employees.map((item) => (item.id === originalId ? employee : item))
          : [...employees, employee],
      },
      originalId ? "Đã cập nhật nhân viên." : "Đã thêm nhân viên.",
    );
    return null;
  }
  function deleteEmployee(id: string) {
    const traceError = actorRemoval.current?.([id]);
    if (traceError) return traceError;
    if (!current.current.employees.some((item) => item.id === id))
      return "Không tìm thấy nhân viên cần xóa.";
    commit(
      {
        ...current.current,
        employees: current.current.employees.filter((item) => item.id !== id),
      },
      "Đã xóa nhân viên.",
    );
    return null;
  }
  return (
    <Context.Provider
      value={{
        ...state,
        storageError,
        registerActorRemovalHandler,
        saveCompany,
        saveEmployee,
        deleteEmployee,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useOrganization() {
  const context = useContext(Context);
  if (!context)
    throw new Error("useOrganization phải nằm trong OrganizationProvider.");
  return context;
}
