import { useId, useState, type FormEvent } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import {
  employeeSchema,
  roleOptions,
  employeeStatusOptions,
  departmentOptions,
  type Employee,
} from "../../modules/organization/model";
import { useOrganization } from "../../app/providers/organization-provider";
import { ManagementSelect } from "./management-select";

const empty: Employee = {
  id: "",
  name: "",
  email: "",
  role: "operator",
  status: "active",
  phone: "",
  department: "operations",
};
export function EmployeeDialog({
  employee,
  onSaved,
  open: controlledOpen,
  hideTrigger = false,
  onOpenChange,
}: {
  employee?: Employee;
  onSaved?: (id: string) => void;
  open?: boolean;
  hideTrigger?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { saveEmployee } = useOrganization();
  const prefix = useId();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const [draft, setDraft] = useState<Employee>(employee ?? empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Employee, string>>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  function changeOpen(next: boolean) {
    setInternalOpen(next);
    onOpenChange?.(next);
    setDraft(employee ?? empty);
    setError(null);
    setErrors({});
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setError(null);
    const result = employeeSchema.safeParse(draft);
    if (!result.success) {
      const next: Partial<Record<keyof Employee, string>> = {};
      for (const issue of result.error.issues)
        next[issue.path[0] as keyof Employee] = issue.message;
      setErrors(next);
      return;
    }
    const error = saveEmployee(result.data, employee?.id);
    if (error) {
      setError(error);
      return;
    }
    onSaved?.(result.data.id);
    changeOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      {!hideTrigger && (
        <DialogTrigger
          render={
            <Button
              variant={employee ? "outline" : "default"}
              size={employee ? "sm" : "default"}
            />
          }
        >
          {employee ? "Chỉnh sửa" : "Thêm nhân viên"}
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên"}
          </DialogTitle>
          <DialogDescription>
            Vai trò chỉ là thông tin hiển thị, không cấp quyền truy cập hệ
            thống.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={submit} className="space-y-4">
          {[
            { key: "id", label: "Mã nhân viên", max: 30 },
            { key: "name", label: "Họ tên", max: 100 },
            { key: "email", label: "Email nhân viên", max: 254 },
            { key: "phone", label: "Điện thoại nhân viên", max: 20 },
          ].map(({ key, label, max }) => {
            const field = key as "id" | "name" | "email" | "phone";
            return (
              <div className="space-y-2" key={field}>
                <Label htmlFor={`${prefix}-${field}`}>{label}</Label>
                <Input
                  id={`${prefix}-${field}`}
                  value={draft[field]}
                  type={field === "email" ? "email" : "text"}
                  maxLength={max}
                  readOnly={field === "id" && Boolean(employee)}
                  aria-invalid={Boolean(errors[field])}
                  aria-describedby={
                    errors[field] ? `${prefix}-${field}-error` : undefined
                  }
                  onChange={(event) =>
                    setDraft({ ...draft, [field]: event.target.value })
                  }
                />
                {errors[field] && (
                  <p
                    id={`${prefix}-${field}-error`}
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {errors[field]}
                  </p>
                )}
              </div>
            );
          })}
          <div className="grid gap-1.5">
          <Label htmlFor={`${prefix}-department`}>Phòng ban</Label>
          <ManagementSelect
            id={`${prefix}-department`}
            label="Phòng ban nhân viên"
            value={draft.department}
            options={departmentOptions}
            onChange={(value) => {
              if (
                value === "operations" ||
                value === "products" ||
                value === "service"
              )
                setDraft({ ...draft, department: value });
            }}
          />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Vai trò</p>
            <ManagementSelect
              label="Vai trò nhân viên"
              value={draft.role}
              options={roleOptions}
              onChange={(value) => {
                if (
                  value === "manager" ||
                  value === "operator" ||
                  value === "support"
                )
                  setDraft({ ...draft, role: value });
              }}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Trạng thái</p>
            <ManagementSelect
              label="Trạng thái nhân viên"
              value={draft.status}
              options={employeeStatusOptions}
              onChange={(value) => {
                if (value === "active" || value === "inactive")
                  setDraft({ ...draft, status: value });
              }}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => changeOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit">{employee ? "Lưu thay đổi" : "Lưu nhân viên"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
