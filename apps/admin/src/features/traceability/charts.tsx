import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@workspace/ui/components/chart";
import type { TraceState } from "../../modules/traceability/model";
import { completeness } from "../../modules/traceability/model";
import { formatVietnamDateInput } from "../../lib/format";

const config: ChartConfig = {
  count: { label: "Số lượng", color: "var(--chart-1)" },
  complete: { label: "Đủ dữ liệu", color: "#168365" },
  missing: { label: "Còn thiếu", color: "#dca442" },
};
const Empty = () => <p className="flex h-48 items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu để thống kê.</p>;

export function QualityChart({ state }: { state: TraceState }) {
  const data = [
    { label: "Đạt nội bộ", count: state.quality.filter(item => item.result === "passed").length, fill: "#168365" },
    { label: "Chờ kết quả", count: state.quality.filter(item => item.result === "pending").length, fill: "#dca442" },
    { label: "Không đạt", count: state.quality.filter(item => item.result === "failed").length, fill: "#b91c1c" },
  ];
  return <Card className="min-w-0 shadow-none"><CardHeader><CardTitle>Kết quả kiểm định</CardTitle><CardDescription>{state.quality.length} lượt kiểm tra nội bộ</CardDescription></CardHeader><CardContent>
    {state.quality.length ? <ChartContainer config={config} className="h-[160px] w-full" aria-label="Kết quả kiểm định"><BarChart data={data} layout="vertical" accessibilityLayer margin={{ right: 28, left: 0 }}><XAxis type="number" hide allowDecimals={false} domain={[0, Math.max(1, ...data.map(item => item.count))]} /><YAxis dataKey="label" type="category" width={92} tickLine={false} axisLine={false} fontSize={12} /><ChartTooltip content={<ChartTooltipContent hideIndicator />} /><Bar dataKey="count" radius={[0, 3, 3, 0]} barSize={18} isAnimationActive={false}>{data.map(item => <Cell key={item.label} fill={item.fill} />)}<LabelList dataKey="count" position="right" fill="var(--foreground)" /></Bar></BarChart></ChartContainer> : <Empty />}
    <ul className="sr-only">{data.map(item => <li key={item.label}>{item.label}: {item.count}</li>)}</ul>
  </CardContent></Card>;
}

export function TraceCharts({ state }: { state: TraceState }) {
  const [range, setRange] = useState(7);
  const complete = state.lots.filter(item => completeness(state, item).length === 0).length;
  const total = state.lots.length;
  const ratio = total ? Math.round(complete / total * 100) : 0;
  const distribution = [{ name: "complete", label: "Đủ dữ liệu", count: complete, fill: "var(--color-complete)" }, { name: "missing", label: "Còn thiếu", count: total - complete, fill: "var(--color-missing)" }];
  // Nhóm theo ngày ghi nhận ở Việt Nam; cột thể hiện số đếm rời rạc.
  const days = Array.from({ length: range }, (_, index) => {
    const key = formatVietnamDateInput(new Date(Date.now() - (range - 1 - index) * 86400000).toISOString());
    return { label: key.slice(8) + "/" + key.slice(5, 7), count: state.events.filter(item => formatVietnamDateInput(item.recordedAt) === key).length };
  });
  const eventTotal = days.reduce((sum, day) => sum + day.count, 0);
  return <div className="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-3">
    <Card className="min-w-0 shadow-none lg:col-span-2"><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div className="space-y-1"><CardTitle>Hoạt động truy xuất</CardTitle><CardDescription>{eventTotal} sự kiện ghi nhận trong {range} ngày · Giờ Việt Nam</CardDescription></div><div className="flex gap-1" role="group" aria-label="Khoảng thời gian thống kê">{[7, 14].map(value => <Button key={value} size="sm" variant={range === value ? "default" : "outline"} aria-pressed={range === value} onClick={() => setRange(value)}>{value} ngày</Button>)}</div></div></CardHeader><CardContent>
      {eventTotal ? <ChartContainer config={config} className="h-[230px] w-full" aria-label="Sự kiện theo ngày"><BarChart accessibilityLayer data={days} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={20} fontSize={11} /><YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="count" fill="var(--color-count)" radius={[3, 3, 0, 0]} maxBarSize={40} isAnimationActive={false} /></BarChart></ChartContainer> : <Empty />}
      <ul className="sr-only">{days.map(item => <li key={item.label}>{item.label}: {item.count} sự kiện</li>)}</ul>
    </CardContent></Card>
    <Card className="min-w-0 shadow-none"><CardHeader><CardTitle>Mức đầy đủ hồ sơ</CardTitle><CardDescription>{complete}/{total} lô đủ dữ liệu theo cấu hình</CardDescription></CardHeader><CardContent>
      {total ? <div className="relative mx-auto h-[180px] max-w-[250px]"><ChartContainer config={config} className="h-full w-full" aria-label="Tỷ lệ hồ sơ đủ dữ liệu"><PieChart accessibilityLayer><ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} /><Pie data={distribution} dataKey="count" nameKey="name" innerRadius={58} outerRadius={80} strokeWidth={3} isAnimationActive={false} /></PieChart></ChartContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-semibold tabular-nums">{ratio}%</span><span className="text-xs text-muted-foreground">Đủ dữ liệu</span></div></div> : <Empty />}
      <ul className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs">{distribution.map(item => <li key={item.name} className="flex items-center gap-2"><span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: item.name === "complete" ? "#168365" : "#dca442" }} />{item.label}<strong className="tabular-nums">{item.count}</strong></li>)}</ul>
      <p className="mt-3 text-center text-xs text-muted-foreground">Hồ sơ tự khai, chưa xác thực độc lập.</p>
    </CardContent></Card>
  </div>;
}
