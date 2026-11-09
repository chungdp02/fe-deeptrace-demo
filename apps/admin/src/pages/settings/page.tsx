import { Settings } from "lucide-react";
import { usePreferences } from "../../app/providers/preferences-provider";
import { PageHeader } from "../../features/admin-management/page-header";
import { ManagementSelect } from "../../features/admin-management/management-select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export function SettingsPage() {
  const { pageSize, setPageSize, storageError } = usePreferences();
  return (
    <section className="space-y-6">
      <PageHeader
        title="Cài đặt"
        description="Tùy chỉnh cách hiển thị danh sách trong ứng dụng."
        icon={Settings}
      />
      <Card className="max-w-xl shadow-none">
        <CardHeader>
          <CardTitle>Hiển thị bảng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label htmlFor="page-size" className="text-sm font-medium">
            Số bản ghi mỗi trang
          </label>
          <ManagementSelect
            id="page-size"
            label="Số bản ghi mỗi trang"
            value={String(pageSize)}
            options={[3, 5, 10, 20].map((size) => ({
              value: String(size),
              label: String(size) + " bản ghi",
            }))}
            onChange={(value) => setPageSize(Number(value))}
          />
          {storageError && (
            <p role="alert" className="text-sm text-destructive">
              {storageError}
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
