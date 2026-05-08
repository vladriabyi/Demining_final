import { useCallback, useEffect, useState } from "react"
import { getTerritories, createTerritory, updateTerritory, deleteTerritory } from "../api/territories"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import type { Territory, TerritoryStatus } from "../types"
import Spinner from "../components/Spinner"
import { TERRITORY_STATUS } from "../components/constants"

const INIT = {
  name: "", description: "",
  status: "contaminated" as TerritoryStatus,
  latitude: "50.45", longitude: "30.52", area_km2: "",
}

const inp = "w-full rounded-xl border border-white/8 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition"
const ibg = { background: "rgba(255,255,255,0.04)" }

export default function TerritoriesPage() {
  const { user } = useAuth()
  const toast    = useToast()
  const isStaff  = user?.role === "coordinator" || user?.role === "admin"

  const [territories, setTerritories] = useState<Territory[]>([])
  const [loading,     setLoading]     = useState(true)
  const [form,        setForm]        = useState(INIT)
  const [editing,     setEditing]     = useState<number | null>(null)
  const [showForm,    setShowForm]    = useState(false)
  const [saving,      setSaving]      = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setTerritories(await getTerritories()) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const set = (f: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        ...form,
        latitude:  Number(form.latitude),
        longitude: Number(form.longitude),
        area_km2:  form.area_km2 ? Number(form.area_km2) : undefined,
      }
      if (editing !== null) {
        const updated = await updateTerritory(editing, data)
        setTerritories(p => p.map(t => t.id === editing ? updated : t))
        toast.success("Територію оновлено")
      } else {
        const created = await createTerritory(data)
        setTerritories(p => [created, ...p])
        toast.success("Територію додано")
      }
      setForm(INIT); setEditing(null); setShowForm(false)
    } catch {
      toast.error("Помилка збереження")
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (t: Territory) => {
    setForm({
      name: t.name, description: t.description ?? "",
      status: t.status,
      latitude: String(t.latitude), longitude: String(t.longitude),
      area_km2: String(t.area_km2 ?? ""),
    })
    setEditing(t.id); setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Видалити територію?")) return
    try {
      await deleteTerritory(id)
      setTerritories(p => p.filter(t => t.id !== id))
      toast.success("Територію видалено")
    } catch {
      toast.error("Помилка видалення")
    }
  }

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest">Моніторинг</p>
          <h1 className="text-xl font-extrabold text-white mt-0.5">Небезпечні території</h1>
          <p className="text-xs text-slate-600 mt-0.5">{territories.length} об'єктів у базі</p>
        </div>
        {isStaff && (
          <button
            onClick={() => { setForm(INIT); setEditing(null); setShowForm(true) }}
            className="px-4 py-2.5 text-sm font-bold text-slate-900 rounded-xl transition"
            style={{ background: "#fbbf24" }}
          >
            + Додати територію
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {loading
          ? <Spinner />
          : territories.length === 0
            ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                <span className="text-4xl">📍</span>
                <p className="text-sm">Територій ще немає</p>
              </div>
            )
            : (
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}>
                {territories.map(t => {
                  const cfg = TERRITORY_STATUS[t.status] ?? { label: t.status, color: "#94a3b8" }
                  return (
                    <div
                      key={t.id}
                      className="rounded-2xl border border-white/6 p-4 flex flex-col gap-3 hover:border-white/10 transition"
                      style={{ background: "#0c1220" }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-white leading-tight">{t.name}</h3>
                        <span
                          className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                          style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
                        >
                          {cfg.label}
                        </span>
                      </div>

                      {t.description && (
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{t.description}</p>
                      )}

                      <div className="flex gap-3 text-[11px] text-slate-600 font-mono">
                        <span>📍 {t.latitude.toFixed(4)}, {t.longitude.toFixed(4)}</span>
                        {t.area_km2 != null && <span>📐 {t.area_km2} км²</span>}
                      </div>

                      {isStaff && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => startEdit(t)}
                            className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-white/8 text-slate-400 hover:text-white hover:bg-white/5 transition"
                          >
                            ✏️ Редагувати
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="px-3 py-1.5 text-xs rounded-lg text-red-500 hover:text-red-300 hover:bg-red-950/30 transition"
                          >
                            🗑
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
        }
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div
            className="w-full max-w-md rounded-2xl border border-white/8 shadow-2xl"
            style={{ background: "#0c1220" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest">{editing ? "Редагування" : "Нова"}</p>
                <h2 className="text-base font-bold text-white mt-0.5">Небезпечна територія</h2>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white text-xl transition">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-3">
              <input className={inp} style={ibg} placeholder="Назва*" value={form.name} onChange={set("name")} required />
              <textarea className={`${inp} resize-none`} style={ibg} placeholder="Опис" rows={2} value={form.description} onChange={set("description")} />
              <select className={inp} style={ibg} value={form.status} onChange={set("status")}>
                {Object.entries(TERRITORY_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input className={inp} style={ibg} type="number" step="any" placeholder="Широта" value={form.latitude} onChange={set("latitude")} required />
                <input className={inp} style={ibg} type="number" step="any" placeholder="Довгота" value={form.longitude} onChange={set("longitude")} required />
              </div>
              <input className={inp} style={ibg} type="number" step="any" placeholder="Площа (км², необов'язково)" value={form.area_km2} onChange={set("area_km2")} />
              <div className="flex gap-3 mt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-400 hover:text-white rounded-xl border border-white/8 hover:bg-white/5 transition">
                  Скасувати
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-900 rounded-xl transition disabled:opacity-50"
                  style={{ background: saving ? "#92400e" : "#fbbf24" }}>
                  {saving ? "Збереження…" : editing ? "Зберегти" : "Створити"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
