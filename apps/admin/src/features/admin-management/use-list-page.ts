import { useState } from "react";
import { usePreferences } from "../../app/providers/preferences-provider";

export function useListPage<T>(items: T[]) {
  const { pageSize } = usePreferences();
  const [requested, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requested, totalPages);
  return {
    page,
    pageSize,
    totalPages,
    setPage,
    rows: items.slice((page - 1) * pageSize, page * pageSize),
  };
}
