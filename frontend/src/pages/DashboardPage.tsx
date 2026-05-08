import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getDashboardStats, getRequests } from "../api/requests"
import { getTerritories } from "../api/territories"
import type { DashboardStats, DeminingRequest, Territory } from "../types"
import MapView from "../components/MapView"
import Spinner from "../components/Spinner"
import { PRIORITY_COLOR, REQUEST_STATUS } from "../components/constants"

const STAT_CFG = [
  { key: "total_requests",       label: "Всього заявок",  icon: "≡",  color: "#60a5fa" },
  { key: "pending_requests",     label: "Очікують",       icon: "◷",  color: "#94a3b8" },
  { key: "in_progress_requests", label: "В роботі",       icon: "⚙",  color: "#fb923c" },
  { key: "completed_requests",   label: "Завершено",      icon: "✓",  color: "#4ade80" },
  { key: "critical_requests",    label: "Критичних",      icon: "⚠",  color: "#f87171" },
  { key: "total_territories",    label: "Територій",      icon: "◉",  color: "#a78bfa" },
] as const

export default function DashboardPage() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [requests,    setRequests]    = useState<DeminingRequest[]>([])
  const [territories, setTerritories] = useState<Territory[]>([])
  const [stats,       setStats]       = useState<DashboardStats | null>(null)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([getRequests(), getTerritories(), getDashboardStats()])
      .then(([r, t, s]) => { setRequests(r); setTerritories(t); setStats(s) })
      .finally(() => setLoading(false))
  }, [])

  const recent = useMemo(() =>
    [...requests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6),
    [requests]
  )

  return (
    <div className="flex flex-col gap-5 h-full">
      <div>
        <p className="text-[10px] text-slate-600 uppercase tracking-widest">Огляд</p>
        <h1 className="text-xl font-extrabold text-white mt-1">
          {user?.full_name?.split(" ")[0]}, вітаємо 👋
        </h1>
        {user?.role === "civilian" && (
          <p className="text-xs text-slate-600 mt-0.5">Статистика загальна; карта та список відображають лише ваші заявки.</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-6 gap-3 shrink-0">
        {STAT_CFG.map(s => (
          <div key={s.key} className="rounded-xl border border-white/6 px-3 py-3 flex flex-col gap-1"
            style={{ background: "#0c1220" }}>
            <span className="text-base" style={{ color: s.color }}>{s.icon}</span>
            <p className="text-2xl font-extrabold text-white leading-none">{stats?.[s.key] ?? 0}</p>
            <p className="text-[10px] text-slate-600 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Map + recent */}
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
        <div className="col-span-2 rounded-2xl overflow-hidden border border-white/6">
          {loading
            ? <div className="h-full" style={{ background: "#0c1220" }}><Spinner text="Завантаження карти…" /></div>
            : <MapView requests={requests} territories={territories} onRequestClick={r => navigate("/requests", { state: { openId: r.id } })} />
          }
        </div>

        <div className="rounded-2xl border border-white/6 flex flex-col overflow-hidden" style={{ background: "#0c1220" }}>
          <div className="px-4 py-3 border-b border-white/6">
            <p className="text-xs font-bold text-white">{user?.role === "civilian" ? "Мої останні заявки" : "Останні заявки"}</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? <Spinner /> : recent.length === 0
              ? <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-1"><span className="text-2xl">📭</span><p className="text-xs">Немає заявок</p></div>
              : recent.map(r => {
                  const st = REQUEST_STATUS[r.status]
                  return (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/4 hover:bg-white/3 cursor-pointer transition" onClick={() => navigate("/requests", { state: { openId: r.id } })}>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PRIORITY_COLOR[r.priority] }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{r.title}</p>
                        <p className="text-[10px] text-slate-600 truncate">{r.location_name}</p>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${st?.color}15`, color: st?.color }}>
                        {st?.label}
                      </span>
                    </div>
                  )
                })
            }
          </div>
        </div>
      </div>
    </div>
  )
}
