import type { ProductStatus } from "../../../modules/product/model/product.types";

// Trạng thái mà bộ lọc cho phép chọn
export type StatusFilter = ProductStatus | "all";   //có thể là active/inactive/all

// Thứ tự sắp xếp theo tên
export type SortOrder = "name-asc" | "name-desc";