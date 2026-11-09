import { useState, type MouseEvent } from "react";
import { Pencil, Trash2, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
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
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/components/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@workspace/ui/components/table";
import { useOrganization } from "../../app/providers/organization-provider";
import {
  roleOptions,
  employeeStatusOptions,
  departmentOptions,
  type Employee,
} from "../../modules/organization/model";
import { normalizeSearch } from "../../lib/search";
import { useListPage } from "../../features/admin-management/use-list-page";
import { PageHeader } from "../../features/admin-management/page-header";
import { RowActions } from "../../features/admin-management/row-actions";
import { StatusBadge } from "../../features/admin-management/status-badge";
import { EmployeeDialog } from "../../features/admin-management/employee-dialog";
import { ManagementSelect } from "../../features/admin-management/management-select";
import { ProductPagination } from "../../features/product-management/ui/product-pagination";

export function EmployeesPage() {
  const { employees, deleteEmployee, storageError } = useOrganization();
  const [keyword, setKeyword] = useState("");
  const [department, setDepartment] = useState("all");
  const [sort, setSort] = useState("asc");
  const [details, setDetails] = useState<Employee | null>(null);
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Employee | null>(null);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visible = employees
    .filter(
      (item) =>
        (department === "all" || item.department === department) &&
        (status === "all" || item.status === status) &&
        normalizeSearch(`${item.id} ${item.name} ${item.email}`).includes(
          normalizeSearch(keyword),
        ),
    )
    .sort(
      (a, b) =>
        (sort === "asc" ? 1 : -1) * a.name.localeCompare(b.name, "vi") ||
        a.id.localeCompare(b.id),
    );
  const { rows, page, pageSize, totalPages, setPage } = useListPage(visible);
  const reset = () => {
    setKeyword("");
    setStatus("all");
    setDepartment("all");
    setSort("asc");
    setPage(1);
  };
  const departmentName = (value: string) =>
    departmentOptions.find((item) => item.value === value)?.label ?? value;
  const roleName = (value: string) =>
    roleOptions.find((item) => item.value === value)?.label ?? value;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Nhân viên"
        description="Thông tin liên hệ và vai trò nhân viên; vai trò không cấp quyền truy cập."
        icon={Users}
        action={
          <EmployeeDialog
            onSaved={(id) => {
              setKeyword(id);
              setPage(1);
            }}
          />
        }
      />
      {storageError && (
        <p role="alert" className="text-sm text-destructive">
          {storageError}
        </p>
      )}
      <Card className="shadow-none">
        <CardHeader className="border-b pb-4">
          <CardTitle>Danh sách nhân viên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="admin-filter-toolbar">
            <Input
              type="search"
              aria-label="Tìm kiếm nhân viên"
              placeholder="Tìm mã, tên hoặc email…"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
            />
            <ManagementSelect
              label="Lọc trạng thái nhân viên"
              value={status}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                ...employeeStatusOptions,
              ]}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            />
            <ManagementSelect
              label="Lọc phòng ban"
              value={department}
              options={[
                { value: "all", label: "Tất cả phòng ban" },
                ...departmentOptions,
              ]}
              onChange={(value) => {
                setDepartment(value);
                setPage(1);
              }}
            />
            <ManagementSelect
              label="Sắp xếp nhân viên"
              value={sort}
              options={[
                { value: "asc", label: "Tên A–Z" },
                { value: "desc", label: "Tên Z–A" },
              ]}
              onChange={(value) => {
                setSort(value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Hiển thị {visible.length}/{employees.length} nhân viên
            </p>
            <Button variant="outline" size="sm" onClick={reset}>
              Đặt lại tìm kiếm và lọc
            </Button>
          </div>
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                {[
                  "STT",
                  "Mã NV",
                  "Họ tên",
                  "Email",
                  "Phòng ban",
                  "Vai trò",
                  "Trạng thái",
                  "Thao tác",
                ].map((label) => (
                  <TableHead key={label}>{label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">
                      {(page - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback>
                            {item.name
                              .split(" ")
                              .map((word) => word[0])
                              .slice(-2)
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{departmentName(item.department)}</TableCell>
                    <TableCell>{roleName(item.role)}</TableCell>
                    <TableCell>
                      <StatusBadge
                        tone={item.status === "active" ? "active" : "inactive"}
                      >
                        {
                          employeeStatusOptions.find(
                            (option) => option.value === item.status,
                          )?.label
                        }
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <RowActions
                        label={`Thao tác nhân viên ${item.id}`}
                        actions={[
                          {
                            label: "Chi tiết nhân viên",
                            onSelect: () => setDetails(item),
                          },
                          {
                            label: "Chỉnh sửa",
                            icon: <Pencil />,
                            onSelect: () => setEditing(item),
                          },
                          {
                            label: "Xóa nhân viên",
                            icon: <Trash2 />,
                            destructive: true,
                            onSelect: () => {
                              setSelected(item);
                              setError(null);
                            },
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {employees.length
                      ? "Không tìm thấy nhân viên phù hợp."
                      : "Chưa có nhân viên. Hãy thêm nhân viên đầu tiên."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ProductPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
      {editing && (
        <EmployeeDialog
          employee={editing}
          open
          hideTrigger
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          onSaved={(id) => {
            setKeyword(id);
            setPage(1);
          }}
        />
      )}
      <Dialog
        open={details !== null}
        onOpenChange={(open) => {
          if (!open) setDetails(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thông tin nhân viên</DialogTitle>
            <DialogDescription>
              {details?.id} — {details?.name}
            </DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Email</dt>
            <dd>{details?.email}</dd>
            <dt className="text-muted-foreground">Điện thoại</dt>
            <dd>{details?.phone || "Chưa bổ sung"}</dd>
            <dt className="text-muted-foreground">Phòng ban</dt>
            <dd>{details && departmentName(details.department)}</dd>
            <dt className="text-muted-foreground">Vai trò</dt>
            <dd>{details && roleName(details.role)}</dd>
          </dl>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setDetails(null)}>Đóng</Button></DialogFooter>
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
            <AlertDialogTitle>Xóa nhân viên?</AlertDialogTitle>
            <AlertDialogDescription>
              Xóa {selected?.id} — {selected?.name}. Không thể xóa nhân viên
              đã có sự kiện truy xuất tham chiếu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                if (!selected) return;
                const message = deleteEmployee(selected.id);
                setError(message);
                if (message) event.preventDefault();
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
