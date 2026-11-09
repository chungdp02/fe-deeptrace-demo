import { useState } from "react";

import type { Product } from "../../../modules/product/model/product.types";

// Hook xử lý phân trang sản phẩm
export function useProductPagination(items: Product[], pageSize = 3) {
  // Trang mà người dùng muốn xem
  const [requestedPage, setRequestedPage] = useState(1);

  // Tổng số trang, tối thiểu là 1
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Bảo đảm trang đang hiển thị không vượt tổng số trang, ví dụ như tối đa là 3 nhưng chỉ có 2 thì trang sẽ tự động ở trang tối đa là 2
  const currentPage = Math.min(requestedPage, totalPages);

  // Vị trí bắt đầu của trang hiện tại
  const startIndex = (currentPage - 1) * pageSize;

  // Chỉ lấy sản phẩm của trang hiện tại
  const pageItems = items.slice(startIndex, startIndex + pageSize);

  // Chuyển đến một trang hợp lệ
  function goToPage(page: number) {
    if (!Number.isInteger(page)) return;

    const safePage = Math.max(1, Math.min(page, totalPages));

    setRequestedPage(safePage);
  }

  // Quay về trang đầu tiên
  function resetPage() {
    setRequestedPage(1);
  }

  return {
    currentPage,
    totalPages,
    pageSize,
    pageItems,
    goToPage,
    resetPage,
  };
}
