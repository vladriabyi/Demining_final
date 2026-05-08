import { memo, useEffect, useState } from "react"
import { updateRequest } from "../api/requests"
import { getUsers } from "../api/users"
import { useToast } from "../context/ToastContext"
import type { DeminingRequest, Priority, RequestStatus, User } from "../types"
import { REQUEST_STATUS, PRIORITY_LABEL } from "./constants"

interface Props { request: DeminingRequest; onClose: () => void; onUpdated: (r: DeminingRequest) => void }

const sel = "w-full rounded-xl border border-white/8 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition"
const bg  = { background: "rgba(255,255,255,0.04)" }

export default memo(function AdminRequestModal({ request: r, onClose, onUpdated }: Props) {
  const toast = useToast()
  const [status,     setStatus]     = useState<RequestStatus>(r.status)
  const [priority,   setPriority]   = useState<Priority>(r.priority)
  const [assignedTo, setAssignedTo] = useState<number | null>(r.assigned_to_id ?? null)
  const [operators,  setOperators]  = useState<User[]>([])
  const [loading,    setLoading]    = useState(false)

  useEffect(() => {
    getUsers().then(users => setOperators(users.filter(u => u.role === "operator" || u.role === "coordinator" || u.role === "admin")))
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const updated = await updateRequest(r.id, { status, priority, assigned_to_id: assignedTo })
      toast.success("Заявку оновлено")
      onUpdated(updated)
    } catch {
      toast.error("Помилка збереження")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="w-full max-w-md shadow-2xl rounded-2xl border border-white/8" style={{ background: "#0c1220" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">Редагування</p>
            <h2 className="text-sm font-bold text-white mt-0.5 truncate max-w-xs">{r.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition text-xl">×</button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-[10px] text-slate-600 uppercase tracking-widest block mb-2">Статус</label>
            <select className={sel} style={bg} value={status} onChange={e => setStatus(e.target.value as RequestStatus)}>
              {Object.entries(REQUEST_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-600 uppercase tracking-widest block mb-2">Пріоритет</label>
            <select className={sel} style={bg} value={priority} onChange={e => setPriority(e.target.value as Priority)}>
              {Object.entries(PRIORITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-600 uppercase tracking-widest block mb-2">Призначити оператора</label>
            <select className={sel} style={bg} value={assignedTo ?? ""} onChange={e => setAssignedTo(e.target.value ? Number(e.target.value) : null)}>
              <option value="">— Не призначено —</option>
              {operators.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
            </select>
          </div>

          <div className="rounded-xl px-3 py-2.5 text-xs text-slate-500 space-y-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p>📍 {r.location_name}</p>
            <p>👤 Заявник: {r.requester?.full_name ?? `ID ${r.requester_id}`}</p>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-400 hover:text-white rounded-xl border border-white/8 hover:bg-white/5 transition">
              Скасувати
            </button>
            <button onClick={handleSave} disabled={loading}
              className="flex-1 py-2.5 text-sm font-bold text-slate-900 rounded-xl transition disabled:opacity-50"
              style={{ background: loading ? "#92400e" : "#fbbf24" }}>
              {loading ? "Збереження…" : "Зберегти"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
