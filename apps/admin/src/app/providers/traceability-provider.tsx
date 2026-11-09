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
import { useProducts } from "./product-provider";
import { useOrganization } from "./organization-provider";
import { traceFixtures } from "../../modules/traceability/fixtures";
import {
  TRACE_KEY,
  parseSnapshot,
  type TraceState,
} from "../../modules/traceability/model";
import {
  applyCommand,
  type TraceCommand,
} from "../../modules/traceability/commands";

interface ContextValue {
  state: TraceState;
  storageError: string | null;
  warning: string | null;
  execute: (command: TraceCommand) => string | null;
}
const Context = createContext<ContextValue | null>(null);

export function TraceabilityProvider({ children }: { children: ReactNode }) {
  const { products, registerProductRemovalHandler } = useProducts();
  const { employees, registerActorRemovalHandler } = useOrganization();
  const refs = {
    productIds: new Set(products.map((item) => item.id)),
    actorIds: new Set(employees.map((item) => item.id)),
  };
  const [loaded] = useState(() => {
    const fallback = traceFixtures(products);
    try {
      return parseSnapshot(localStorage.getItem(TRACE_KEY), fallback, refs);
    } catch {
      return {
        state: fallback,
        warning:
          "Không thể đọc dữ liệu đã lưu trên trình duyệt. Dữ liệu hiện tại chỉ dùng trong phiên này.",
        preserveInvalid: true,
      };
    }
  });
  const [state, setState] = useState(loaded.state);
  const current = useRef(state);
  const invalid = useRef(loaded.preserveInvalid);
  const changed = useRef(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [warning, setWarning] = useState(loaded.warning);
  useEffect(() => {
    if (invalid.current && !changed.current) return;
    try {
      localStorage.setItem(TRACE_KEY, JSON.stringify(state));
      setStorageError(null);
    } catch {
      setStorageError(
        "Không lưu được vào trình duyệt. Thay đổi chỉ còn trong phiên; hãy kiểm tra dung lượng lưu trữ.",
      );
    }
  }, [state]);
  const productGuard = useCallback(
    (ids: string[]) =>
      current.current.lots.some(
        (item) => item.productId && ids.includes(item.productId),
      )
        ? "Không thể xóa sản phẩm đã có lô truy xuất."
        : null,
    [],
  );
  const actorGuard = useCallback(
    (ids: string[]) =>
      current.current.events.some(
        (item) => item.actorId && ids.includes(item.actorId),
      )
        ? "Không thể xóa nhân sự đã ghi nhận sự kiện truy xuất."
        : null,
    [],
  );
  useEffect(() => {
    registerProductRemovalHandler(productGuard);
    return () => registerProductRemovalHandler(null);
  }, [registerProductRemovalHandler, productGuard]);
  useEffect(() => {
    registerActorRemovalHandler(actorGuard);
    return () => registerActorRemovalHandler(null);
  }, [registerActorRemovalHandler, actorGuard]);
  function execute(command: TraceCommand): string | null {
    try {
      if (
        command.kind === "event" &&
        command.value.actorId &&
        !employees.some(
          (item) =>
            item.id === command.value.actorId && item.status === "active",
        )
      )
        return "Chọn nhân sự đang hoạt động.";
      const result = applyCommand(current.current, command, refs);
      if (!result.ok) return result.error;
      if (invalid.current) {
        const original = localStorage.getItem(TRACE_KEY);
        if (original)
          localStorage.setItem(TRACE_KEY + ".backup." + Date.now(), original);
        invalid.current = false;
        setWarning(null);
      }
      changed.current = true;
      current.current = result.state;
      setState(result.state);
      toast.success("Đã ghi nhận thay đổi.");
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "Không thể xử lý thay đổi.";
    }
  }
  return (
    <Context.Provider value={{ state, storageError, warning, execute }}>
      {children}
    </Context.Provider>
  );
}
export function useTraceability() {
  const context = useContext(Context);
  if (!context) throw new Error("useTraceability cần TraceabilityProvider.");
  return context;
}
