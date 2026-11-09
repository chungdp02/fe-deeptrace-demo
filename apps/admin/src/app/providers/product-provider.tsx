import {
  CATALOG_KEY,
  loadCatalog,
  saveCategory as saveCategoryData,
  deleteCategory as deleteCategoryData,
  type Category,
  type Catalog,
} from "../../modules/category/catalog";
import { toast } from "sonner";
import { PRODUCT_STORAGE_KEY } from "../../modules/product/data/product-storage";
import {
  normalizeProduct,
  validateProduct,
} from "../../modules/product/model/product.validation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "../../modules/product/model/product.types";

interface ProductContextValue {
  products: Product[];
  categories: Category[];
  registerProductRemovalHandler: (
    handler: ((productIds: string[]) => string | null) | null,
  ) => void;
  saveCategory: (category: Category, originalId?: string) => string | null;
  deleteCategory: (id: string) => string | null;
  storageError: string | null;
  addProduct: (product: Product) => string | null;
  updateProduct: (product: Product) => string | null;
  deleteProduct: (productId: string) => string | null;
}

const ProductContext = createContext<ProductContextValue | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  // Danh sách sản phẩm dùng chung
  const [{ products, categories }, setCatalog] = useState<Catalog>(loadCatalog);
  const currentCategories = useRef(categories);

  const currentProducts = useRef(products);
  const productRemovalHandler = useRef<
    ((productIds: string[]) => string | null) | null
  >(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Đồng bộ bản hiện tại ngay trong thao tác để chặn submit trùng trước lần render kế tiếp.
  function commit(next: Product[]) {
    currentProducts.current = next;
    setCatalog({ products: next, categories: currentCategories.current });
  }

  useEffect(() => {
    try {
      localStorage.setItem(
        CATALOG_KEY,
        JSON.stringify({ products, categories }),
      );
      // Bản tương thích cho công cụ demo cũ; snapshot v2 là nguồn đọc chính.
      localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
      setStorageError(null);
    } catch {
      setStorageError(
        "Không thể lưu vào trình duyệt. Thay đổi hiện tại có thể mất khi tải lại trang.",
      );
    }
  }, [products, categories]);

  const registerProductRemovalHandler = useCallback(
    (handler: ((productIds: string[]) => string | null) | null) => {
      productRemovalHandler.current = handler;
    },
    [],
  );

  function commitCatalog(next: Catalog) {
    currentCategories.current = next.categories;
    currentProducts.current = next.products;
    setCatalog(next);
  }
  function saveCategory(
    category: Category,
    originalId?: string,
  ): string | null {
    const result = saveCategoryData(
      {
        products: currentProducts.current,
        categories: currentCategories.current,
      },
      category,
      originalId,
    );
    if (typeof result === "string") return result;
    commitCatalog(result);
    toast.success("Đã lưu danh mục.");
    return null;
  }
  function deleteCategory(id: string): string | null {
    const result = deleteCategoryData(
      {
        products: currentProducts.current,
        categories: currentCategories.current,
      },
      id,
    );
    if (typeof result === "string") return result;
    commitCatalog(result);
    toast.success("Đã xóa danh mục.");
    return null;
  }

  // Cập nhật sản phẩm đã tồn tại
  function updateProduct(updatedProduct: Product): string | null {
    const normalizedProduct = normalizeProduct(updatedProduct);
    const validationError = Object.values(
      validateProduct(normalizedProduct),
    )[0];
    if (validationError) return validationError;
    if (
      !currentCategories.current.some(
        (item) => item.name === normalizedProduct.category,
      )
    )
      return "Danh mục không tồn tại. Hãy chọn danh mục hiện có.";

    // Kiểm tra sản phẩm cần sửa có tồn tại hay không
    const exists = currentProducts.current.some(
      (item) => item.id === normalizedProduct.id,
    );

    if (!exists) {
      return "Không tìm thấy sản phẩm cần cập nhật.";
    }

    // Cập nhật đúng sản phẩm có ID trùng khớp
    commit(
      currentProducts.current.map((item) =>
        item.id === normalizedProduct.id ? normalizedProduct : item,
      ),
    );
    toast.success("Đã cập nhật sản phẩm.");
    return null;
  }

  // Hàm thêm sản phẩm
  function addProduct(product: Product): string | null {
    const newProduct = normalizeProduct(product);
    const validationError = Object.values(validateProduct(newProduct))[0];
    if (validationError) return validationError;
    if (
      !currentCategories.current.some(
        (item) => item.name === newProduct.category,
      )
    )
      return "Danh mục không tồn tại. Hãy chọn danh mục hiện có.";

    // Kiểm tra trùng mã sản phẩm
    const isDuplicate = currentProducts.current.some(
      (item) => item.id.toUpperCase() === newProduct.id,
    );

    if (isDuplicate) {
      return "Mã sản phẩm đã tồn tại.";
    }

    // Thêm vào state
    commit([...currentProducts.current, newProduct]);
    toast.success("Đã thêm sản phẩm.");

    return null;
  }

  // Xóa sản phẩm theo mã đã được chuẩn hóa
  function deleteProduct(productId: string): string | null {
    const normalizedId = productId.trim().toUpperCase();

    if (!normalizedId) {
      return "Mã sản phẩm không được để trống.";
    }

    const exists = currentProducts.current.some(
      (item) => item.id === normalizedId,
    );

    if (!exists) {
      return "Không tìm thấy sản phẩm cần xóa.";
    }

    const referenceError = productRemovalHandler.current?.([normalizedId]);
    if (referenceError) return referenceError;

    // Tạo mảng mới để React nhận diện thay đổi state
    commit(currentProducts.current.filter((item) => item.id !== normalizedId));
    toast.success("Đã xóa sản phẩm.");

    return null;
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        saveCategory,
        deleteCategory,
        registerProductRemovalHandler,
        storageError,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);

  if (context === null) {
    throw new Error("useProducts phải được sử dụng bên trong ProductProvider.");
  }

  return context;
}
