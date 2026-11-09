import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
export const PREFERENCES_KEY = "deeptrace.admin.preferences.v1";
const Context = createContext({
  pageSize: 10,
  storageError: null as string | null,
  setPageSize: (_size: number) => {},
});
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [pageSize, setPageSize] = useState(() => {
    try {
      const size = Number(localStorage.getItem(PREFERENCES_KEY));
      return [3, 5, 10, 20].includes(size) ? size : 10;
    } catch {
      return 10;
    }
  });
  const [storageError, setStorageError] = useState<string | null>(null);
  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_KEY, String(pageSize));
      setStorageError(null);
    } catch {
      setStorageError(
        "Không thể lưu tùy chọn hiển thị. Tùy chọn chỉ có hiệu lực trong phiên này.",
      );
    }
  }, [pageSize]);
  return (
    <Context.Provider
      value={{
        pageSize,
        storageError,
        setPageSize: (size) => {
          if ([3, 5, 10, 20].includes(size)) setPageSize(size);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function usePreferences() {
  return useContext(Context);
}
