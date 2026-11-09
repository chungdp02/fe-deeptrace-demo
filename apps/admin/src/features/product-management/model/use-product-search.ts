import { normalizeSearch } from "../../../modules/product/model/product.validation";
import { useState } from "react";

import type { Product } from "../../../modules/product/model/product.types";

export function useProductSearch(products: Product[]) {
  // State lưu từ khóa người dùng nhập
  const [keyword, setKeyword] = useState("");

  // Chuẩn hóa từ khóa trước khi tìm kiếm
  const normalizedKeyword = normalizeSearch(keyword);

  // Lọc danh sách sản phẩm
  const filteredProducts = products.filter((product) => {
    const searchableText = normalizeSearch(
      `${product.id} ${product.name} ${product.category}`,
    );
    return searchableText.includes(normalizedKeyword);
  });

  // Trả về dữ liệu cho component sử dụng
  return {
    keyword,
    setKeyword,
    filteredProducts,
  };
}
