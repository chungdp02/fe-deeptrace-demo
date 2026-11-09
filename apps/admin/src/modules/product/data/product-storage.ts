import type { Product } from "../model/product.types";
import { normalizeProduct, validateProduct } from "../model/product.validation";
import { products as fixtures } from "./products.mock";

export const PRODUCT_STORAGE_KEY = "deeptrace.admin.products.v1";

// Chỉ chấp nhận toàn bộ snapshot hợp lệ, tránh khôi phục dữ liệu dở dang.
export function parseProductSnapshot(raw: string | null): Product[] {
  if (raw === null) return [...fixtures];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [...fixtures];
    const ids = new Set<string>();
    const products: Product[] = [];
    for (const item of data) {
      if (
        typeof item !== "object" ||
        item === null ||
        !("id" in item) ||
        !("name" in item) ||
        !("category" in item) ||
        !("status" in item)
      )
        return [...fixtures];
      if (
        typeof item.id !== "string" ||
        typeof item.name !== "string" ||
        typeof item.category !== "string" ||
        (item.status !== "active" && item.status !== "inactive")
      )
        return [...fixtures];
      const product = normalizeProduct({
        id: item.id,
        name: item.name,
        category: item.category,
        status: item.status,
      });
      if (Object.keys(validateProduct(product)).length || ids.has(product.id))
        return [...fixtures];
      ids.add(product.id);
      products.push(product);
    }
    return products;
  } catch {
    return [...fixtures];
  }
}

export function loadProducts(): Product[] {
  try {
    return parseProductSnapshot(localStorage.getItem(PRODUCT_STORAGE_KEY));
  } catch {
    return [...fixtures];
  }
}
