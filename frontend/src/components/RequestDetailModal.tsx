import { memo } from "react"
import type { DeminingRequest } from "../types"
import { StatusBadge, PriorityBadge } from "./StatusBadge"

interface Props {
  request: DeminingRequest
  onClose: () => void
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("uk-UA", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })

function RequestPhoto({ path }: { path: string | null | undefined }) {
  if (!path) return null
  // Use relative /uploads/ path — proxied by Vite to backend
  return (
    <img
      src={`/uploads/${path}`}
      alt="Фото заявки"
      className="w-full h-44 object-cover rounded-xl border border-white/8"
      onError={e => {
        e.currentTarget.style.display = "none"
        const el = document.createElement("div")
        el.className = "w-full h-20 flex items-center justify-center rounded-xl text-slate-500 text-xs"
        el.style.background = "rgba(255,255,255,0.03)"
        el.style.border = "1px dashed rgba(255,255,255,0.1)"
        el.textContent = "📷 Фото недоступне"
        e.currentTarget.parentNode?.appendChild(el)
      }}
    />
  )
}

export default memo(function RequestDetailModal({ request: r, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] rounded-2xl border border-white/8"
        style={{ background: "#0c1220" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-white/6 gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-1">Заявка #{r.id}</p>
            <h2 className="text-base font-bold text-white leading-tight line-clamp-2">{r.title}</h2>
          </div>
          <button onClick={onClose} className="shrink-0 text-slate-500 hover:text-white transition text-xl leading-none mt-0.5">×</button>
        </div>

        <div className="overflow-y-auto p-6 flex flex-col gap-4">
          {/* Status + priority */}
          <div className="flex gap-2 flex-wrap">
            <StatusBadge status={r.status} />
            <PriorityBadge priority={r.priority} />
          </div>

          {/* Photo */}
          <RequestPhoto path={r.photo_path} />

          {/* Description */}
          {r.description && (
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1.5">Опис</p>
              <p className="text-sm text-slate-300 leading-relaxed">{r.description}</p>
            </div>
          )}

          {/* Grid info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Локація",    value: r.location_name },
              { label: "Координати", value: `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}` },
              { label: "Заявник",    value: r.requester?.full_name ?? `ID ${r.requester_id}` },
              { label: "Оператор",   value: r.assignee?.full_name ?? "—" },
              { label: "Створено",   value: fmt(r.created_at) },
              { label: "Оновлено",   value: fmt(r.updated_at) },
            ].map(item => (
              <div key={item.label} className="bg-white/3 rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-sm text-slate-200 font-medium leading-snug">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-5 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-semibold text-slate-400 hover:text-white rounded-xl transition border border-white/8 hover:bg-white/5"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  )
})
