// Định nghĩa các trạng thái hợp lệ của sản phẩm
export type ProductStatus = "active" | "inactive";

// Định nghĩa cấu trúc dữ liệu của một sản phẩm
export interface Product {
  id: string;
  name: string;
  category: string;
  status: ProductStatus;
}
