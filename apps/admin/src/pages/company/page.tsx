import { useState, type FormEvent } from "react";
import { Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useOrganization } from "../../app/providers/organization-provider";
import { companySchema, type Company } from "../../modules/organization/model";
import { PageHeader } from "../../features/admin-management/page-header";

export function CompanyPage() {
  const { company, saveCompany, storageError } = useOrganization();
  const [draft, setDraft] = useState<Company>(company);
  const [errors, setErrors] = useState<Partial<Record<keyof Company, string>>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const fields = [
    { key: "name", label: "Tên doanh nghiệp", max: 150, required: true },
    { key: "code", label: "Mã doanh nghiệp", max: 30, required: true },
    { key: "email", label: "Email liên hệ", max: 254, required: true },
    { key: "phone", label: "Số điện thoại", max: 20, required: true },
    { key: "address", label: "Địa chỉ", max: 250, required: true },
    { key: "website", label: "Website", max: 250, required: false },
    {
      key: "representative",
      label: "Người đại diện",
      max: 100,
      required: false,
    },
    {
      key: "description",
      label: "Mô tả doanh nghiệp",
      max: 500,
      required: false,
    },
  ] as const;
  function submit(event: FormEvent) {
    event.preventDefault();
    const result = companySchema.safeParse(draft);
    setErrors({});
    setError(null);
    if (!result.success) {
      const next: Partial<Record<keyof Company, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Company;
        next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    const error = saveCompany(result.data);
    setError(error);
    if (!error) setDraft(result.data);
  }
  return (
    <section className="space-y-6">
      <PageHeader
        title="Doanh nghiệp"
        description="Hồ sơ doanh nghiệp được lưu trong trình duyệt này."
        icon={Building2}
      />
      {storageError && (
        <p role="alert" className="text-destructive">
          {storageError}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>{company.name}</CardTitle>
            <CardDescription>Doanh nghiệp • {company.code}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{company.description || "Hồ sơ quản trị sản phẩm DeepTrace."}</p>
            <p className="mt-2 text-sm">
              Người đại diện: {company.representative || "Chưa bổ sung"}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Thông tin liên hệ đã lưu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 break-words">
            <p>{company.email}</p>
            <p>{company.phone}</p>
            <p>{company.address}</p>
            <p>{company.website || "Chưa có website"}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-none">
        <CardHeader className="border-b pb-4">
          <CardTitle>Hồ sơ doanh nghiệp</CardTitle>
          <CardDescription>
            Thông tin liên hệ dùng cho bản quản trị sản phẩm.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form
            noValidate
            onSubmit={submit}
            className="grid gap-4 sm:grid-cols-2"
          >
            {fields.map(({ key, label, max, required }) => (
              <div
                className={
                  key === "address" ? "space-y-2 sm:col-span-2" : "space-y-2"
                }
                key={key}
              >
                <Label
                  className={required ? "required-field" : undefined}
                  htmlFor={`company-${key}`}
                >
                  {label}
                </Label>
                <Input
                  id={`company-${key}`}
                  type={
                    key === "email" ? "email" : key === "phone" ? "tel" : "text"
                  }
                  value={draft[key]}
                  maxLength={max}
                  readOnly={key === "code"}
                  required={required}
                  aria-invalid={Boolean(errors[key])}
                  aria-describedby={
                    errors[key] ? `company-${key}-error` : undefined
                  }
                  onChange={(event) =>
                    setDraft({ ...draft, [key]: event.target.value })
                  }
                />
                {errors[key] && (
                  <p
                    id={`company-${key}-error`}
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {errors[key]}
                  </p>
                )}
              </div>
            ))}
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="submit">Lưu thay đổi</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDraft(company);
                  setErrors({});
                  setError(null);
                }}
              >
                Hủy thay đổi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
