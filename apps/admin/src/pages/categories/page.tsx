import { useState, type FormEvent, type MouseEvent } from "react";
import { Pencil, Tags, Trash2 } from "lucide-react";
import { useProducts } from "../../app/providers/product-provider";
import { normalizeSearch } from "../../lib/search";
import type { Category } from "../../modules/category/catalog";
import { PageHeader } from "../../features/admin-management/page-header";
import { RowActions } from "../../features/admin-management/row-actions";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/components/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@workspace/ui/components/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@workspace/ui/components/alert-dialog";

export function CategoriesPage() {
  const { categories, products, saveCategory, deleteCategory, storageError } =
    useProducts();
  const [keyword, setKeyword] = useState("");
  const [draft, setDraft] = useState<Category | null>(null);
  const [originalId, setOriginalId] = useState<string>();
  const [selected, setSelected] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visible = categories
    .filter((item) =>
      normalizeSearch(item.name).includes(normalizeSearch(keyword)),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  function edit(category?: Category) {
    setError(null);
    setOriginalId(category?.id);
    setDraft(category ?? { id: crypto.randomUUID(), name: "" });
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const error = saveCategory(draft, originalId);
    setError(error);
    if (!error) setDraft(null);
  }
  return (
    <section className="space-y-6">
      <PageHeader
        title="Danh mục"
        description="Quản lý danh mục dùng chung cho sản phẩm; không xóa khi còn sản phẩm tham chiếu."
        icon={Tags}
        action={<Button onClick={() => edit()}>Thêm danh mục</Button>}
      />
      {storageError && <p role="alert">{storageError}</p>}
      <Card className="shadow-none">
        <CardHeader className="border-b pb-4">
          <CardTitle>Danh sách danh mục</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="search"
            aria-label="Tìm danh mục"
            placeholder="Tìm theo tên danh mục…"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Số sản phẩm</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell className="text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    {
                      products.filter((item) => item.category === category.name)
                        .length
                    }
                  </TableCell>
                  <TableCell>
                    <RowActions
                      label={`Thao tác danh mục ${category.name}`}
                      actions={[
                        {
                          label: "Chỉnh sửa",
                          icon: <Pencil />,
                          onSelect: () => edit(category),
                        },
                        {
                          label: "Xóa danh mục",
                          icon: <Trash2 />,
                          destructive: true,
                          onSelect: () => {
                            setSelected(category);
                            setError(null);
                          },
                        },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    Không có danh mục phù hợp. Hãy thêm danh mục hoặc đổi từ
                    khóa.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog
        open={draft !== null}
        onOpenChange={(open) => {
          if (!open) setDraft(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {originalId ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
            </DialogTitle>
            <DialogDescription>
              {originalId ? "Đổi tên danh mục sẽ cập nhật các sản phẩm đang sử dụng danh mục này." : "Thêm danh mục để phân loại sản phẩm."}
            </DialogDescription>
          </DialogHeader>
          <form noValidate onSubmit={submit} className="space-y-4">
            <Label htmlFor="category-name">Tên danh mục</Label>
            <Input
              id="category-name"
              value={draft?.name ?? ""}
              maxLength={80}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "category-error" : undefined}
              onChange={(event) =>
                setDraft((previous) =>
                  previous ? { ...previous, name: event.target.value } : null,
                )
              }
            />
            {error && (
              <p role="alert" id="category-error" className="text-destructive">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraft(null)}
              >
                Hủy
              </Button>
              <Button type="submit">{originalId ? "Lưu thay đổi" : "Lưu danh mục"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục?</AlertDialogTitle>
            <AlertDialogDescription>
              Danh mục {selected?.name} chỉ có thể xóa khi không còn sản phẩm
              tham chiếu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                if (!selected) return;
                const error = deleteCategory(selected.id);
                setError(error);
                if (error) event.preventDefault();
                else setSelected(null);
              }}
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
