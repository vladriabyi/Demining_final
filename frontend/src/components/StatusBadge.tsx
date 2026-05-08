import { REQUEST_STATUS, PRIORITY_COLOR, PRIORITY_LABEL } from "./constants"
import type { RequestStatus, Priority } from "../types"

export function StatusBadge({ status }: { status: RequestStatus }) {
  const cfg = REQUEST_STATUS[status] ?? { color: "#94a3b8", label: status }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}40` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const color = PRIORITY_COLOR[priority]
  const label = PRIORITY_LABEL[priority]
  return (
    <span
      className={`text-xs font-semibold ${priority === "critical" ? "pulse-critical" : ""}`}
      style={{ color }}
    >
      {label}
    </span>
  )
}
