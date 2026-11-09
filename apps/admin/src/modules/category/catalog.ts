import { products as fixtures } from "../product/data/products.mock";
import {
  parseProductSnapshot,
  PRODUCT_STORAGE_KEY,
} from "../product/data/product-storage";
import {
  normalizeProduct,
  validateProduct,
} from "../product/model/product.validation";
import type { Product } from "../product/model/product.types";
import { normalizeSearch } from "../../lib/search";

export interface Category {
  id: string;
  name: string;
}
export interface Catalog {
  products: Product[];
  categories: Category[];
}
export const CATALOG_KEY = "deeptrace.admin.catalog.v2";
export function categoriesFromProducts(products: Product[]): Category[] {
  return [...new Set(products.map((item) => item.category))].map(
    (name, index) => ({ id: `CAT${String(index + 1).padStart(3, "0")}`, name }),
  );
}
export function initialCatalog(): Catalog {
  return {
    products: fixtures.map((item) => ({ ...item })),
    categories: categoriesFromProducts(fixtures),
  };
}
export function validateCategory(name: string): string | null {
  return !name.trim() || name.trim().length > 80
    ? "Tên danh mục phải có từ 1 đến 80 ký tự."
    : null;
}
export function saveCategory(
  catalog: Catalog,
  input: Category,
  originalId?: string,
): Catalog | string {
  const category = {
    id: originalId ?? input.id,
    name: input.name.trim().replace(/\s+/g, " "),
  };
  if (!category.id.trim()) return "Mã danh mục không hợp lệ.";
  const error = validateCategory(category.name);
  if (error) return error;
  const old = catalog.categories.find((item) => item.id === originalId);
  if (originalId && !old) return "Không tìm thấy danh mục.";
  if (
    catalog.categories.some(
      (item) =>
        item.id !== originalId &&
        (normalizeSearch(item.name) === normalizeSearch(category.name) ||
          item.id === category.id),
    )
  )
    return "Tên hoặc mã danh mục đã tồn tại.";
  return {
    categories: old
      ? catalog.categories.map((item) =>
          item.id === originalId ? category : item,
        )
      : [...catalog.categories, category],
    products: old
      ? catalog.products.map((item) =>
          item.category === old.name
            ? { ...item, category: category.name }
            : item,
        )
      : catalog.products,
  };
}
export function deleteCategory(catalog: Catalog, id: string): Catalog | string {
  const category = catalog.categories.find((item) => item.id === id);
  if (!category) return "Không tìm thấy danh mục.";
  if (catalog.products.some((item) => item.category === category.name))
    return "Không thể xóa danh mục đang có sản phẩm. Hãy chuyển hoặc xóa sản phẩm trước.";
  return {
    ...catalog,
    categories: catalog.categories.filter((item) => item.id !== id),
  };
}
// Snapshot gộp giữ quan hệ tên danh mục và sản phẩm trong cùng một lần ghi.
export function parseCatalog(raw: string): Catalog | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value !== "object" ||
      value === null ||
      !("products" in value) ||
      !("categories" in value) ||
      !Array.isArray(value.products) ||
      !Array.isArray(value.categories)
    )
      return null;
    const categories: Category[] = [];
    const ids = new Set<string>();
    const names = new Set<string>();
    for (const item of value.categories) {
      if (
        typeof item !== "object" ||
        item === null ||
        typeof item.id !== "string" ||
        !item.id.trim() ||
        typeof item.name !== "string" ||
        validateCategory(item.name) ||
        ids.has(item.id) ||
        names.has(normalizeSearch(item.name))
      )
        return null;
      ids.add(item.id);
      names.add(normalizeSearch(item.name));
      categories.push({ id: item.id, name: item.name.trim() });
    }
    const products: Product[] = [];
    const productIds = new Set<string>();
    for (const item of value.products) {
      if (
        typeof item !== "object" ||
        item === null ||
        typeof item.id !== "string" ||
        typeof item.name !== "string" ||
        typeof item.category !== "string" ||
        (item.status !== "active" && item.status !== "inactive")
      )
        return null;
      const product = normalizeProduct(item);
      if (
        Object.keys(validateProduct(product)).length ||
        productIds.has(product.id) ||
        !categories.some((category) => category.name === product.category)
      )
        return null;
      productIds.add(product.id);
      products.push(product);
    }
    return { products, categories };
  } catch {
    return null;
  }
}
export function loadCatalog(): Catalog {
  try {
    const raw = localStorage.getItem(CATALOG_KEY);
    if (raw !== null) return parseCatalog(raw) ?? initialCatalog();
    const products = parseProductSnapshot(
      localStorage.getItem(PRODUCT_STORAGE_KEY),
    );
    return { products, categories: categoriesFromProducts(products) };
  } catch {
    return initialCatalog();
  }
}
