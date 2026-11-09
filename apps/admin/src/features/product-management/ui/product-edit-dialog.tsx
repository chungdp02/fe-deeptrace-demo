import { ManagementSelect } from "../../admin-management/management-select";
import {
  normalizeProduct,
  validateProduct,
} from "../../../modules/product/model/product.validation";
import { useId, useState, type FormEvent } from "react";

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

interface ProductEditDialogProps {
  product: Product;
  categories?: string[];
  onUpdate: (product: Product) => string | null;
  open?: boolean;
  hideTrigger?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const statusOptions: {
  label: string;
  value: ProductStatus;
}[] = [
  { label: "Hoạt động", value: "active" },
  { label: "Tạm ngưng", value: "inactive" },
];

export function ProductEditDialog({
  product,
  onUpdate,
  categories = [],
  open: controlledOpen,
  hideTrigger = false,
  onOpenChange,
}: ProductEditDialogProps) {
  // Tạo tiền tố ID duy nhất cho các trường trong form
  const fieldId = useId();

  // Trạng thái đóng/mở Dialog
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  // Dữ liệu đang chỉnh sửa
  const [form, setForm] = useState<Product>(() => ({ ...product }));

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof Product, string>>
  >({});

  // Thông báo lỗi
  const [error, setError] = useState("");

  // Xử lý khi Dialog mở hoặc đóng
  function handleOpenChange(nextOpen: boolean) {
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
    if (nextOpen) {
      // Mỗi lần mở, nạp lại dữ liệu mới nhất
      setForm({ ...product });
      setError("");
    }

    setFieldErrors({});
    setInternalOpen(nextOpen);
  }

  // Xử lý lưu thay đổi
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const updatedProduct = normalizeProduct({ ...form, id: product.id });
    const errors = validateProduct(updatedProduct);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    const saveError = onUpdate(updatedProduct);

    if (saveError) {
      setError(saveError);
      return;
    }

    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!hideTrigger && (
        <DialogTrigger
          render={<Button type="button" variant="outline" size="sm" />}
        >Chỉnh sửa</DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>

          <DialogDescription>
            Cập nhật tên, danh mục và trạng thái sản phẩm.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          {/* Mã sản phẩm không cho chỉnh sửa */}
          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-id`}>Mã sản phẩm</Label>

            <Input
              id={`${fieldId}-id`}
              aria-invalid={Boolean(fieldErrors.id)}
              aria-describedby={
                fieldErrors.id ? `${fieldId}-id-error` : undefined
              }
              value={form.id}
              readOnly
            />
          </div>

          {fieldErrors.id && (
            <p
              id={`${fieldId}-id-error`}
              role="alert"
              className="text-sm text-destructive"
            >
              {fieldErrors.id}
            </p>
          )}

          {/* Tên sản phẩm */}
          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-name`}>Tên sản phẩm</Label>

            <Input
              id={`${fieldId}-name`}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={
                fieldErrors.name ? `${fieldId}-name-error` : undefined
              }
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
              id={`${fieldId}-name-error`}
              role="alert"
              className="text-sm text-destructive"
            >
              {fieldErrors.name}
            </p>
          )}

          {/* Danh mục */}
          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-category`}>Danh mục</Label>

            <ManagementSelect
              id={`${fieldId}-category`}
              invalid={Boolean(fieldErrors.category)}
              describedBy={
                fieldErrors.category ? `${fieldId}-category-error` : undefined
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
              id={`${fieldId}-category-error`}
              role="alert"
              className="text-sm text-destructive"
            >
              {fieldErrors.category}
            </p>
          )}

          {/* Trạng thái */}
          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-status`}>Trạng thái</Label>

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
              <SelectTrigger id={`${fieldId}-status`} className="w-full">
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

          {/* Thông báo validation */}
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

            <Button type="submit">Lưu thay đổi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
