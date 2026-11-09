import { ListPagination } from "../admin-management/list-pagination";
import { TraceDateField } from "./date-field";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { ManagementSelect } from "../admin-management/management-select";
import { RowActions, type RowAction } from "../admin-management/row-actions";
import { StatusBadge } from "../admin-management/status-badge";
import { useListPage } from "../admin-management/use-list-page";
import {
  formatVietnamDateInput,
  formatVietnamTimeInput,
  fromVietnamDateTime,
} from "../../lib/format";
import type { TraceLot, TraceState } from "../../modules/traceability/model";
import type { Product } from "../../modules/product/model/product.types";

export type Values = Record<string, string | boolean | string[]>;
export const read = (values: Values, key: string) =>
  typeof values[key] === "string" ? (values[key] as string) : "";
export const list = (values: Values, key: string): string[] =>
  Array.isArray(values[key]) ? (values[key] as string[]) : [];
export const yes = (values: Values, key: string) => values[key] === true;
export const nowLocal = () => {
  const now = new Date().toISOString();
  return formatVietnamDateInput(now) + "T" + formatVietnamTimeInput(now);
};
export function toIso(value: string): string {
  const result = fromVietnamDateTime(value.slice(0, 10), value.slice(11, 16));
  if (!result) throw new Error("Ngày giờ không hợp lệ (giờ Việt Nam).");
  return result;
}
export const quantityText = (value: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 3 }).format(value);
export const newId = (prefix: string) => prefix + "-" + crypto.randomUUID();
export function lotName(state: TraceState, products: Product[], lot: TraceLot) {
  return lot.productId
    ? (products.find((item) => item.id === lot.productId)?.name ??
        lot.productId)
    : (state.materials.find((item) => item.id === lot.materialId)?.name ??
        "Nguyên liệu");
}
export const lotOptions = (state: TraceState) =>
  state.lots.map((item) => ({ value: item.id, label: item.batchCode }));
export const locationOptions = (state: TraceState) =>
  state.locations
    .filter((item) => item.status === "active")
    .map((item) => ({ value: item.id, label: item.name }));
export const partnerOptions = (state: TraceState) =>
  state.partners
    .filter((item) => item.status === "active")
    .map((item) => ({ value: item.id, label: item.name }));
export function TraceStatus({ value }: { value: string }) {
  const labels: Record<string, string> = {
    low: "Thấp",
    high: "Cao",
    critical: "Nghiêm trọng",
    active: "Hoạt động",
    inactive: "Ngừng hoạt động",
    hold: "Tạm giữ",
    closed: "Đã đóng",
    raw: "Nguyên liệu",
    semi: "Bán thành phẩm",
    finished: "Thành phẩm",
    passed: "Đạt nội bộ",
    failed: "Không đạt",
    pending: "Chờ kết quả",
    draft: "Nháp",
    dispatched: "Đang giao",
    received: "Đã nhận",
    cancelled: "Đã hủy",
    open: "Mới ghi nhận",
    in_progress: "Đang xử lý",
  };
  return (
    <StatusBadge
      tone={
        ["failed", "hold", "critical", "high"].includes(value)
          ? "danger"
          : ["pending", "draft", "open"].includes(value)
            ? "pending"
            : ["inactive", "cancelled", "closed"].includes(value)
              ? "inactive"
              : ["dispatched", "in_progress", "low"].includes(value) ? "info" : "active"
      }
    >
      {labels[value] ?? value}
    </StatusBadge>
  );
}
export function TracePanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0 shadow-none">
      <CardHeader className="border-b pb-4">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4 pt-4">{children}</CardContent>
    </Card>
  );
}
export interface FieldSpec {
  name: string;
  label: string;
  kind?:
    | "text"
    | "number"
    | "date"
    | "datetime-local"
    | "select"
    | "multi"
    | "textarea"
    | "checkbox";
  required?: boolean;
  options?: { value: string; label: string }[];
  help?: string;
}
export function TraceForm({
  title,
  submitLabel = "Lưu thông tin",
  description = "Thông tin được lưu trong trình duyệt của bạn.",
  fields,
  initial,
  onSave,
  onClose,
}: {
  title: string;
  submitLabel?: string;
  description?: string;
  fields: FieldSpec[];
  initial: Values;
  onSave: (values: Values) => string | null;
  onClose: () => void;
}) {
  const formId = useId();
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    const invalid: Record<string, string> = {};
    for (const field of fields) {
      if (
        field.required &&
        (field.kind === "multi"
          ? list(values, field.name).length === 0
          : !read(values, field.name).trim())
      )
        invalid[field.name] = "Không được để trống.";
      if (
        field.kind === "number" &&
        read(values, field.name) &&
        (!Number.isFinite(Number(read(values, field.name))) ||
          Number(read(values, field.name)) < 0)
      )
        invalid[field.name] = "Nhập số không âm hợp lệ.";
    }
    setErrors(invalid);
    if (Object.keys(invalid).length) return;
    try {
      const message = onSave(values);
      setError(message);
      if (!message) onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Không thể ghi nhận dữ liệu.",
      );
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="admin-form-dialog">
        <form onSubmit={submit} noValidate className="space-y-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="admin-form-fields">
          {fields.map((field) => {
            const controlId = formId + "-" + field.name;
            const shared = {
              id: controlId,
              "aria-invalid": Boolean(errors[field.name]),
              "aria-describedby": errors[field.name]
                ? controlId + "-error"
                : undefined,
              "aria-required": field.required,
            };
            return (
              <div key={field.name} className={"grid min-w-0 content-start gap-1.5 " + (["textarea", "multi", "checkbox"].includes(field.kind ?? "") ? "sm:col-span-2" : "")}>
                <Label htmlFor={controlId}>
                  {field.label}
                  {field.required && (
                    <span aria-hidden="true" className="text-destructive">
                      {" "}
                      *
                    </span>
                  )}
                </Label>
                {field.kind === "checkbox" ? (
                  <input
                    id={controlId}
                    type="checkbox"
                    checked={yes(values, field.name)}
                    onChange={(event) =>
                      setValues({
                        ...values,
                        [field.name]: event.target.checked,
                      })
                    }
                    className="size-4 accent-primary"
                  />
                ) : field.kind === "select" ? (
                  <ManagementSelect
                    id={controlId}
                    label={field.label}
                    value={read(values, field.name)}
                    options={[
                      { value: "", label: "Chọn…" },
                      ...(field.options ?? []),
                    ]}
                    invalid={Boolean(errors[field.name])}
                    describedBy={shared["aria-describedby"]}
                    onChange={(value) =>
                      setValues({ ...values, [field.name]: value })
                    }
                  />
                ) : field.kind === "multi" ? (
                  <fieldset
                    {...shared}
                    aria-label={field.label}
                    className="max-h-40 space-y-2 overflow-y-auto rounded border p-3"
                  >
                    <legend className="sr-only">{field.label}</legend>
                    {field.options?.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={list(values, field.name).includes(
                            option.value,
                          )}
                          onChange={(event) =>
                            setValues({
                              ...values,
                              [field.name]: event.target.checked
                                ? [...list(values, field.name), option.value]
                                : list(values, field.name).filter(
                                    (value) => value !== option.value,
                                  ),
                            })
                          }
                        />
                        {option.label}
                      </label>
                    ))}
                  </fieldset>
                ) : field.kind === "date" || field.kind === "datetime-local" ? (
                  <TraceDateField id={controlId} label={field.label} kind={field.kind} value={read(values, field.name)} onChange={value => setValues({ ...values, [field.name]: value })} invalid={Boolean(errors[field.name])} describedBy={shared["aria-describedby"]} required={field.required} />
                ) : field.kind === "textarea" ? (
                  <textarea
                    {...shared}
                    maxLength={1500}
                    value={read(values, field.name)}
                    onChange={(event) =>
                      setValues({ ...values, [field.name]: event.target.value })
                    }
                    className="min-h-24 w-full rounded border bg-background p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                ) : (
                  <Input
                    {...shared}
                    type={field.kind ?? "text"}
                    step={field.kind === "number" ? "any" : undefined}
                    lang="vi"
                    maxLength={
                      field.kind === "text" || !field.kind ? 400 : undefined
                    }
                    value={read(values, field.name)}
                    onChange={(event) =>
                      setValues({ ...values, [field.name]: event.target.value })
                    }
                  />
                )}
                {field.help && (
                  <p className="text-xs text-muted-foreground">{field.help}</p>
                )}
                {errors[field.name] && (
                  <p
                    id={controlId + "-error"}
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {errors[field.name]}
                  </p>
                )}
              </div>
            );
          })}
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export function TraceTable<T extends { id: string }>({
  rows,
  columns,
  actions,
  empty = "Không có dữ liệu phù hợp.",
}: {
  rows: T[];
  columns: { label: string; render: (row: T) => ReactNode }[];
  actions?: (row: T) => RowAction[];
  empty?: string;
}) {
  const {
    rows: visible,
    page,
    pageSize,
    totalPages,
    setPage,
  } = useListPage(rows);
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            {columns.map((column) => (
              <TableHead key={column.label}>{column.label}</TableHead>
            ))}
            {actions && <TableHead>Thao tác</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((row, index) => (
            <TableRow key={row.id}>
              <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.label}
                  className="max-w-xs whitespace-normal"
                >
                  {column.render(row)}
                </TableCell>
              ))}
              {actions && (
                <TableCell>
                  <RowActions
                    label={"Thao tác " + row.id}
                    actions={actions(row)}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
          {!visible.length && (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 2 : 1)}
                className="py-8 text-center text-muted-foreground"
              >
                {empty}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <ListPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}
export function TraceSearch({
  value,
  onChange,
  label = "Tìm kiếm",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <Input
      type="search"
      aria-label={label}
      placeholder={label + "…"}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
export function RecordDetails({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Thông tin nội bộ do người vận hành ghi nhận.
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 space-y-3 text-sm">{children}</div>
        <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Đóng</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
