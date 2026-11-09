import { Button } from "@workspace/ui/components/button";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

import type { SortOrder, StatusFilter } from "../model/product-filter.types";

interface ProductFiltersProps {
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;

  category: string;
  onCategoryChange: (value: string) => void;

  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;

  categories: string[];
  onReset: () => void;
}

const statusOptions: {
  label: string;
  value: StatusFilter;
}[] = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Hoạt động", value: "active" },
  { label: "Tạm ngưng", value: "inactive" },
];

const sortOptions: {
  label: string;
  value: SortOrder;
}[] = [
  { label: "Tên A–Z", value: "name-asc" },
  { label: "Tên Z–A", value: "name-desc" },
];

export function ProductFilters({
  status,
  onStatusChange,
  category,
  onCategoryChange,
  sortOrder,
  onSortOrderChange,
  categories,
  onReset,
}: ProductFiltersProps) {
  // Danh mục thay đổi theo dữ liệu Product
  const categoryOptions = [
    { label: "Tất cả danh mục", value: "all" },
    ...categories.map((name) => ({
      label: name,
      value: name,
    })),
  ];

  return (
    <div className="admin-filter-toolbar">
      {/* Lọc trạng thái */}
      <div className="grid min-w-0 gap-2">
        <span className="text-sm font-medium">Trạng thái</span>

        <Select
          items={statusOptions}
          value={status}
          onValueChange={(value) => {
            if (value === "all" || value === "active" || value === "inactive") {
              onStatusChange(value);
            }
          }}
        >
          <SelectTrigger className="w-full" aria-label="Lọc theo trạng thái">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>

          <SelectContent alignItemWithTrigger={false} align="start">
            <SelectGroup>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Lọc danh mục */}
      <div className="grid min-w-0 gap-2">
        <span className="text-sm font-medium">Danh mục</span>

        <Select
          items={categoryOptions}
          value={category}
          onValueChange={(value) => {
            if (typeof value === "string") {
              onCategoryChange(value);
            }
          }}
        >
          <SelectTrigger className="w-full" aria-label="Lọc theo danh mục">
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>

          <SelectContent alignItemWithTrigger={false} align="start">
            <SelectGroup>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Sắp xếp theo tên */}
      <div className="grid min-w-0 gap-2">
        <span className="text-sm font-medium">Sắp xếp</span>

        <Select
          items={sortOptions}
          value={sortOrder}
          onValueChange={(value) => {
            if (value === "name-asc" || value === "name-desc") {
              onSortOrderChange(value);
            }
          }}
        >
          <SelectTrigger className="w-full" aria-label="Sắp xếp sản phẩm">
            <SelectValue placeholder="Chọn thứ tự" />
          </SelectTrigger>

          <SelectContent alignItemWithTrigger={false} align="start">
            <SelectGroup>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Đặt lại tất cả bộ lọc */}
      <div className="flex min-w-0 items-end">
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full"
          onClick={onReset}
        >
          Đặt lại bộ lọc
        </Button>
      </div>
    </div>
  );
}
