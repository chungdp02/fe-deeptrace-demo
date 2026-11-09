import type { Product } from "./product.types";

export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export { normalizeSearch } from "../../../lib/search";

export function normalizeProduct(product: Product): Product {
  return {
    ...product,
    id: product.id.trim().toUpperCase(),
    name: normalizeText(product.name),
    category: normalizeText(product.category),
  };
}

export function validateProduct(
  product: Product,
): Partial<Record<keyof Product, string>> {
  const errors: Partial<Record<keyof Product, string>> = {};
  if (!/^[A-Z0-9][A-Z0-9_-]{0,29}$/.test(product.id))
    errors.id = "Mã gồm 1–30 ký tự chữ, số, gạch dưới hoặc gạch ngang.";
  if (!product.name || product.name.length > 150)
    errors.name = "Tên sản phẩm phải có từ 1 đến 150 ký tự.";
  if (!product.category || product.category.length > 80)
    errors.category = "Danh mục phải có từ 1 đến 80 ký tự.";
  if (product.status !== "active" && product.status !== "inactive")
    errors.status = "Trạng thái không hợp lệ.";
  return errors;
}
