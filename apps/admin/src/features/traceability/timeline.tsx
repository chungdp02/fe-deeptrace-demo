import { History } from "lucide-react";
import { eventLabels, timeline, unitLabels, type TraceState } from "../../modules/traceability/model";
import { formatVietnamDateTime } from "../../lib/format";
import { quantityText } from "./ui";

export function TraceTimeline({ state, lotId, employees }: {
  state: TraceState;
  lotId: string;
  employees: { id: string; name: string }[];
}) {
  const events = timeline(state, lotId);
  if (!events.length) return <p className="text-sm text-muted-foreground">Chưa ghi nhận sự kiện cho lô này.</p>;
  return <ol aria-label="Hành trình sự kiện" className="space-y-5">{events.map(event => <li key={event.id} className="relative border-l-2 border-primary/20 pl-4">
    <div className="flex flex-wrap items-center gap-2"><History className="size-4 text-primary" aria-hidden="true" /><h3 className="text-sm font-semibold">{eventLabels[event.eventType]}</h3><time className="text-xs text-muted-foreground" dateTime={event.occurredAt}>{formatVietnamDateTime(event.occurredAt)}</time></div>
    <p className="mt-1 text-sm leading-6">{event.description}</p>
    {event.quantity !== null && event.unit && <p className="mt-1 text-sm">Số lượng liên quan: {quantityText(event.quantity)} {unitLabels[event.unit]}</p>}
    <p className="mt-1 text-xs text-muted-foreground">{state.locations.find(item => item.id === event.locationId)?.name} · {state.partners.find(item => item.id === event.partnerId)?.name} · {employees.find(item => item.id === event.actorId)?.name ?? "Chưa khai báo nhân sự"}</p>
    <p className="mt-1 text-xs text-muted-foreground">Ghi vào ứng dụng: {formatVietnamDateTime(event.recordedAt)}</p>
    {event.evidence.length > 0 && <p className="mt-1 text-xs">Chứng từ: {event.evidence.join(", ")}</p>}
  </li>)}</ol>;
}
