import { ManagementSelect } from "../../admin-management/management-select";
import {
  normalizeProduct,
  validateProduct,
} from "../../../modules/product/model/product.validation";
import { useState, type FormEvent } from "react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

import type {
  Product,
  ProductStatus,
} from "../../../modules/product/model/product.types";

// Giá trị mặc định của form
const initialProduct: Product = {
  id: "",
  name: "",
  category: "",
  status: "active",
};

// Danh sách trạng thái dùng cho Select
const statusOptions: {
  label: string;
  value: ProductStatus;
}[] = [
  { label: "Hoạt động", value: "active" },
  { label: "Tạm ngưng", value: "inactive" },
];

// Dữ liệu được truyền từ ProductsPage
interface ProductCreateDialogProps {
  onCreate: (product: Product) => string | null;
  categories?: string[];
}

export function ProductCreateDialog({
  onCreate,
  categories = [],
}: ProductCreateDialogProps) {
  // Quản lý trạng thái đóng/mở Dialog
  const [open, setOpen] = useState(false);

  // Lưu dữ liệu người dùng đang nhập
  const [form, setForm] = useState<Product>(initialProduct);

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof Product, string>>
  >({});

  // Thông báo lỗi validation
  const [error, setError] = useState("");

  // Đóng/mở Dialog và xóa dữ liệu khi đóng
  function handleOpenChange(nextOpen: boolean) {
    setFieldErrors({});
    setOpen(nextOpen);

    if (!nextOpen) {
      setForm(initialProduct);
      setError("");
    }
  }

  // Xử lý khi nhấn Lưu sản phẩm
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Chuẩn hóa dữ liệu trước khi thêm
    const newProduct = normalizeProduct({ ...form });
    const errors = validateProduct(newProduct);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    // Yêu cầu trang cha thực hiện thêm sản phẩm
    const saveError = onCreate(newProduct);

    if (saveError) {
      if (saveError === "Mã sản phẩm đã tồn tại.")
        setFieldErrors({ id: saveError });
      else setError(saveError);
      return;
    }

    // Thêm thành công thì đóng Dialog
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" />}>
        Thêm sản phẩm
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm mới</DialogTitle>

          <DialogDescription>
            Nhập thông tin sản phẩm để thêm vào danh sách.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          {/* Mã sản phẩm */}
          <div className="space-y-2">
            <Label htmlFor="new-product-id">Mã sản phẩm</Label>

            <Input
              id="new-product-id"
              aria-invalid={Boolean(fieldErrors.id)}
              aria-describedby={
                fieldErrors.id ? "new-product-id-error" : undefined
              }
              placeholder="Ví dụ: P007"
              value={form.id}
              maxLength={30}
              required
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  id: event.target.value,
                }))
              }
            />
          </div>

          {fieldErrors.id && (
            <p
              id="new-product-id-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {fieldErrors.id}
            </p>
          )}

          {/* Tên sản phẩm */}
          <div className="space-y-2">
            <Label htmlFor="new-product-name">Tên sản phẩm</Label>

            <Input
              id="new-product-name"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={
                fieldErrors.name ? "new-product-name-error" : undefined
              }
              placeholder="Nhập tên sản phẩm"
              value={form.name}
              maxLength={150}
              required
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
            />
          </div>

          {fieldErrors.name && (
            <p
              id="new-product-name-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {fieldErrors.name}
            </p>
          )}

          {/* Danh mục */}
          <div className="space-y-2">
            <Label htmlFor="new-product-category">Danh mục</Label>

            <ManagementSelect
              id="new-product-category"
              invalid={Boolean(fieldErrors.category)}
              describedBy={
                fieldErrors.category ? "new-product-category-error" : undefined
              }
              label="Danh mục sản phẩm"
              value={form.category}
              options={categories.map((name) => ({ value: name, label: name }))}
              onChange={(value) =>
                setForm((previous) => ({ ...previous, category: value }))
              }
            />
          </div>

          {fieldErrors.category && (
            <p
              id="new-product-category-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {fieldErrors.category}
            </p>
          )}

          {/* Trạng thái */}
          <div className="space-y-2">
            <Label htmlFor="new-product-status">Trạng thái</Label>

            <Select
              items={statusOptions}
              value={form.status}
              onValueChange={(value) => {
                if (value === "active" || value === "inactive") {
                  setForm((previous) => ({
                    ...previous,
                    status: value,
                  }));
                }
              }}
            >
              <SelectTrigger id="new-product-status" className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent alignItemWithTrigger={false} align="start">
                <SelectGroup>
                  {statusOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Thông báo lỗi */}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Hủy
            </Button>

            <Button type="submit">Lưu sản phẩm</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
