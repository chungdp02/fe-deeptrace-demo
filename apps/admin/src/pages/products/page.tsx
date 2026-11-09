import { useState } from "react";
import { Package, Pencil, Trash2 } from "lucide-react";
import { usePreferences } from "../../app/providers/preferences-provider";
import { useProducts } from "../../app/providers/product-provider";
import { PageHeader } from "../../features/admin-management/page-header";
import { RowActions } from "../../features/admin-management/row-actions";
import { StatusBadge } from "../../features/admin-management/status-badge";
import {
  ProductEditDialog,
  ProductSearch,
  ProductFilters,
  ProductPagination,
  ProductCreateDialog,
  ProductDeleteDialog,
  useProductFilters,
  useProductPagination,
} from "../../features/product-management";
import type { Product } from "../../modules/product/model/product.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

export function ProductsPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    storageError,
    categories: catalogCategories,
  } = useProducts();
  const {
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
  } = useProductFilters(products);
  const { pageSize } = usePreferences();
  const { currentPage, totalPages, pageItems, goToPage, resetPage } =
    useProductPagination(visibleProducts, pageSize);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  function handleDeleteProduct(productId: string) {
    const error = deleteProduct(productId);
    if (!error) resetPage();
    return error;
  }

  function handleCreateProduct(product: Product) {
    const error = addProduct(product);
    if (error) return error;
    resetFilters();
    setKeyword(product.id.trim().toUpperCase());
    resetPage();
    return null;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Sản phẩm"
        description="Quản lý thông tin sản phẩm, danh mục và trạng thái hoạt động."
        icon={Package}
        action={
          <>
            <ProductCreateDialog
              onCreate={handleCreateProduct}
              categories={catalogCategories.map((item) => item.name)}
            />
          </>
        }
      />
      {storageError && (
        <p role="alert" className="text-sm text-destructive">
          {storageError}
        </p>
      )}
      <Card className="shadow-none">
        <CardHeader className="border-b pb-4">
          <CardTitle>Danh sách sản phẩm</CardTitle>
          <CardDescription>
            Tìm kiếm, lọc theo danh mục/trạng thái và sắp xếp theo tên.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid gap-4">
            <ProductSearch
              keyword={keyword}
              onKeywordChange={(value) => {
                setKeyword(value);
                resetPage();
              }}
            />
            <ProductFilters
              status={status}
              onStatusChange={(value) => {
                setStatus(value);
                resetPage();
              }}
              category={category}
              onCategoryChange={(value) => {
                setCategory(value);
                resetPage();
              }}
              sortOrder={sortOrder}
              onSortOrderChange={(value) => {
                setSortOrder(value);
                resetPage();
              }}
              categories={categories}
              onReset={() => {
                resetFilters();
                resetPage();
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Tìm thấy {visibleProducts.length}/{products.length} sản phẩm
          </p>
          <Table className="min-w-[680px]">
            <TableHeader>
              <TableRow>
                {[
                  "STT",
                  "Mã SP",
                  "Tên sản phẩm",
                  "Danh mục",
                  "Trạng thái",
                  "Thao tác",
                ].map((label) => (
                  <TableHead key={label}>{label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.length ? (
                pageItems.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell className="text-muted-foreground">
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell>{product.id}</TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <StatusBadge
                        tone={
                          product.status === "active" ? "active" : "inactive"
                        }
                      >
                        {product.status === "active"
                          ? "Hoạt động"
                          : "Tạm ngưng"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <RowActions
                        label={`Thao tác sản phẩm ${product.id}`}
                        actions={[
                          {
                            label: "Chỉnh sửa",
                            icon: <Pencil />,
                            onSelect: () => setEditingProduct(product),
                          },
                          {
                            label: "Xóa sản phẩm",
                            icon: <Trash2 />,
                            destructive: true,
                            onSelect: () => setDeletingProduct(product),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {products.length === 0
                      ? "Chưa có sản phẩm. Hãy thêm sản phẩm đầu tiên."
                      : "Không tìm thấy sản phẩm theo từ khóa hoặc bộ lọc."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {visibleProducts.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              <ProductPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          )}
          {editingProduct && (
            <ProductEditDialog
              product={editingProduct}
              onUpdate={updateProduct}
              categories={catalogCategories.map((item) => item.name)}
              open
              hideTrigger
              onOpenChange={(open) => {
                if (!open) setEditingProduct(null);
              }}
            />
          )}
          {deletingProduct && (
            <ProductDeleteDialog
              product={deletingProduct}
              onDelete={handleDeleteProduct}
              open
              hideTrigger
              onOpenChange={(open) => {
                if (!open) setDeletingProduct(null);
              }}
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
