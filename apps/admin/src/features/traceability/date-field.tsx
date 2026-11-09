import { lazy, Suspense, useState } from "react";
import { format } from "date-fns/format";
import { parseISO } from "date-fns/parseISO";
import { vi } from "date-fns/locale/vi";
import { CalendarDays } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
const Calendar = lazy(() => import("@workspace/ui/components/calendar").then(module => ({ default: module.Calendar })));
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@workspace/ui/components/popover";

// Chỉ ghép primitive chính thức; giá trị ngày vẫn là chuỗi, không đổi múi giờ khi chọn lịch.
export function TraceDateField({ id, label, kind, value, onChange, invalid, describedBy, required }: {
  id: string;
  label: string;
  kind: "date" | "datetime-local";
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  describedBy?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const day = value.slice(0, 10);
  const parsed = day ? parseISO(day) : undefined;
  const selected = parsed && !Number.isNaN(parsed.getTime()) ? parsed : undefined;
  return <div className="admin-date-field flex min-w-0 gap-2">
    <Input id={id} type={kind} lang="vi" value={value} aria-invalid={invalid} aria-describedby={describedBy} aria-required={required} className="min-w-0 flex-1" onChange={event => onChange(event.target.value)} />
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button type="button" size="icon" variant="outline" className="size-10 shrink-0 max-sm:size-11" aria-label={"Chọn ngày: " + label} />}><CalendarDays /></PopoverTrigger>
      <PopoverContent align="end" className="w-auto overflow-y-auto p-2">
        <PopoverTitle className="sr-only">{label} — chọn ngày</PopoverTitle>
        {open && <Suspense fallback={<p role="status">Đang tải lịch…</p>}><Calendar locale={vi} mode="single" selected={selected} defaultMonth={selected} weekStartsOn={1} labels={{ labelNext: () => "Tháng sau", labelPrevious: () => "Tháng trước", labelGrid: month => format(month, "MMMM yyyy", { locale: vi }), labelDayButton: date => format(date, "EEEE, dd MMMM yyyy", { locale: vi }) }} onSelect={date => {
          if (!date) return;
          const nextDay = format(date, "yyyy-MM-dd");
          onChange(kind === "datetime-local" ? nextDay + "T" + (value.slice(11, 16) || "00:00") : nextDay);
          setOpen(false);
        }} /></Suspense>}
      </PopoverContent>
    </Popover>
  </div>;
}
