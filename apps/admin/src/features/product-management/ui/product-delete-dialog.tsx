import { useRef, useState, type MouseEvent } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";

import type { Product } from "../../../modules/product/model/product.types";

interface ProductDeleteDialogProps {
  product: Product;
  onDelete: (productId: string) => string | null;
  open?: boolean;
  hideTrigger?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProductDeleteDialog({
  product,
  onDelete,
  open: controlledOpen,
  hideTrigger = false,
  onOpenChange,
}: ProductDeleteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deletionStarted = useRef(false);

  function handleOpenChange(nextOpen: boolean) {
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);

    if (nextOpen) {
      setError(null);
    }
  }

  function handleConfirmDelete(event: MouseEvent<HTMLButtonElement>) {
    if (deletionStarted.current) {
      return;
    }

    deletionStarted.current = true;
    setIsDeleting(true);
    setError(null);

    try {
      const deleteError = onDelete(product.id);

      if (deleteError) {
        setError(deleteError);
        deletionStarted.current = false;
        setIsDeleting(false);
        event.preventDefault();
        return;
      }

      handleOpenChange(false);
    } catch {
      setError("Không thể xóa sản phẩm. Vui lòng thử lại.");
      deletionStarted.current = false;
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {!hideTrigger && (
        <AlertDialogTrigger
          render={
            <Button
              type="button"
              variant="destructive"
              size="sm"
              aria-label={`Xóa sản phẩm ${product.id}`}
            />
          }
        >
          Xóa
        </AlertDialogTrigger>
      )}

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>

          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa sản phẩm {product.id} — {product.name}{" "}
            khỏi danh sách hiện tại? Thao tác này không có chức năng hoàn tác
            trong phiên làm việc.
          </AlertDialogDescription>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={handleConfirmDelete}
          >
            {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
