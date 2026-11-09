import { useEffect, useState } from "react";
import type { Product } from "../../../modules/product/model/product.types";
import { useProductSearch } from "./use-product-search";
import type { SortOrder, StatusFilter } from "./product-filter.types";

export function useProductFilters(products: Product[]) {
  // Tái sử dụng logic tìm kiếm
  const { keyword, setKeyword, filteredProducts } = useProductSearch(products);

  // Trạng thái bộ lọc
  const [status, setStatus] = useState<StatusFilter>("all");

  // Danh mục được chọn
  const [category, setCategory] = useState("all");

  // Đặt lại bộ lọc nếu danh mục được chọn không còn sản phẩm.
  useEffect(() => {
    if (
      category !== "all" &&
      !products.some((product) => product.category === category)
    ) {
      setCategory("all");
    }
  }, [products, category]);

  // Thứ tự sắp xếp
  const [sortOrder, setSortOrder] = useState<SortOrder>("name-asc");

  // Lấy các danh mục duy nhất từ dữ liệu Product
  const categories = [
    ...new Set(products.map((product) => product.category)),
  ].sort((a, b) => a.localeCompare(b, "vi"));

  // Lọc theo trạng thái và danh mục
  const matchingProducts = filteredProducts.filter((product) => {
    const matchesStatus = status === "all" || product.status === status;

    const matchesCategory = category === "all" || product.category === category;

    return matchesStatus && matchesCategory;
  });

  // Sắp xếp danh sách đã lọc
  const visibleProducts = [...matchingProducts].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name, "vi");

    if (comparison !== 0) {
      return sortOrder === "name-asc" ? comparison : -comparison;
    }

    return a.id.localeCompare(b.id);
  });

  // Đưa toàn bộ bộ lọc về mặc định
  function resetFilters() {
    setKeyword("");
    setStatus("all");
    setCategory("all");
    setSortOrder("name-asc");
  }

  return {
    keyword,
    setKeyword,
    status,
    setStatus,
    category,
    setCategory,
    sortOrder,
    setSortOrder,
    categories,
    visibleProducts,
    resetFilters,
  };
}
