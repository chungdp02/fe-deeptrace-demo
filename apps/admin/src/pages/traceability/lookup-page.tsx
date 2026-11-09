import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { Search } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { PageHeader } from "../../features/admin-management/page-header";
import { TracePanel, lotName } from "../../features/traceability/ui";
import { useTraceability } from "../../app/providers/traceability-provider";
import { useProducts } from "../../app/providers/product-provider";
import { completeness } from "../../modules/traceability/model";
import { normalizeSearch } from "../../lib/search";
import { LotProfile } from "./lot-detail";

export function LookupPage() {
  const { state, warning } = useTraceability();
  const { products } = useProducts();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [selected, setSelected] = useState<string | null>(null);
  const term = params.get("q") ?? "";
  const rows = term ? state.lots.filter(lot => normalizeSearch(lot.batchCode + " " + (lot.productId ?? "") + " " + lotName(state, products, lot)).includes(normalizeSearch(term))) : [];
  const lot = state.lots.find(item => item.id === selected);
  function submit(event: FormEvent) { event.preventDefault(); setParams({ q: query.trim() }); setSelected(null); }
  return <section className="space-y-6"><PageHeader title="Tra cứu nguồn gốc" description="Tra cứu mã lô, mã sản phẩm hoặc lô nguyên liệu. Kết quả là hồ sơ tự khai, không phải xác minh độc lập." icon={Search} /><TracePanel title="Tìm hồ sơ truy xuất"><form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row"><Input type="search" aria-label="Mã lô hoặc sản phẩm" placeholder="Ví dụ: TP-GAO-001, NL-LUA-A hoặc P002" value={query} onChange={event => setQuery(event.target.value)} required /><Button type="submit"><Search />Tra cứu</Button></form>{warning && <p role="alert" className="text-sm text-destructive">{warning}</p>}{term && !rows.length && <p role="status" className="text-sm text-muted-foreground">Không tìm thấy hồ sơ phù hợp.</p>}<div className="grid gap-3 md:grid-cols-2">{rows.map(item => { const missing = completeness(state, item); return <article key={item.id} className="space-y-2 rounded border p-4"><h2 className="font-semibold">{item.batchCode}</h2><p className="text-sm">{lotName(state, products, item)}</p><p className="text-xs text-muted-foreground">{missing.length ? "Chưa đủ dữ liệu: " + missing.join(", ") : "Đủ dữ liệu theo cấu hình lô, do người vận hành ghi nhận."}</p><div className="flex flex-wrap gap-3"><Button size="sm" variant="outline" onClick={() => setSelected(item.id)}>Xem hành trình</Button><Link className="self-center text-sm text-primary hover:underline" to={"/lots/" + item.id}>Mở trang chi tiết</Link></div></article>; })}</div></TracePanel>{lot && <LotProfile lot={lot} />}</section>;
}
