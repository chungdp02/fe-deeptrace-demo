import { MoreHorizontal } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Pagination, PaginationContent, PaginationItem } from "@workspace/ui/components/pagination";

export interface ListPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ListPagination({ currentPage, totalPages, onPageChange }: ListPaginationProps) {
  if (totalPages <= 1) return null;
  const numbered = totalPages > 5;
  // Giữ trang đầu/cuối và các trang lân cận, tránh dãy nút dài trên điện thoại.
  const candidates = [1, totalPages, currentPage - 1, currentPage, currentPage + 1];
  if (currentPage <= 2) candidates.push(2, 3);
  if (currentPage >= totalPages - 1) candidates.push(totalPages - 2, totalPages - 1);
  const pages = [...new Set(candidates)].filter(page => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  return <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3 border-t pt-4">
    <p className="shrink-0 text-sm text-muted-foreground" aria-live="polite">Trang {currentPage} / {totalPages}</p>
    <Pagination aria-label="Phân trang" className="mx-0 w-auto max-w-full justify-end">
      <PaginationContent className="flex-wrap justify-end gap-1">
        <PaginationItem><Button type="button" variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>Trước</Button></PaginationItem>
        {numbered && pages.map((page, index) => <PaginationItem key={page} className="flex items-center gap-1">
          {index > 0 && page - pages[index - 1] > 1 && <span className="px-1 text-muted-foreground"><MoreHorizontal className="size-4" aria-hidden="true" /><span className="sr-only">Các trang khác</span></span>}
          <Button type="button" size="sm" className="min-w-8 px-2" variant={page === currentPage ? "default" : "outline"} aria-label={"Trang " + page} aria-current={page === currentPage ? "page" : undefined} onClick={() => onPageChange(page)}>{page}</Button>
        </PaginationItem>)}
        <PaginationItem><Button type="button" variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>Sau</Button></PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>;
}
