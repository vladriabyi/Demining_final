import { memo, useRef, useState } from "react"
import { createRequest, uploadPhoto } from "../api/requests"
import { useToast } from "../context/ToastContext"
import type { DeminingRequest, Priority } from "../types"
import MapView from "./MapView"

interface Props { onClose: () => void; onCreated: (r: DeminingRequest) => void }

const PRIORITIES: Priority[] = ["low", "medium", "high", "critical"]
const PRIORITY_LABELS = { low: "🟢 Низький", medium: "🟡 Середній", high: "🟠 Високий", critical: "🔴 Критичний" }

const INIT = { title: "", description: "", priority: "medium" as Priority, location_name: "", latitude: "", longitude: "" }
const ALLOWED = ["image/jpeg", "image/png"]
const MAX_BYTES = 5 * 1024 * 1024

const inp = "w-full rounded-xl border border-white/8 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition"
const bg  = { background: "rgba(255,255,255,0.04)" }

export default memo(function NewRequestModal({ onClose, onCreated }: Props) {
  const toast = useToast()
  const [form, setForm]           = useState(INIT)
  const [photo, setPhoto]         = useState<File | null>(null)
  const [preview, setPreview]     = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)
  const [showMap, setShowMap]     = useState(false)
  const [coords, setCoords]       = useState<{ lat: number; lng: number } | null>(null)
  const fileRef                   = useRef<HTMLInputElement>(null)

  const set = (f: keyof typeof INIT) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }))

  const handleMapClick = (lat: number, lng: number) => {
    setCoords({ lat, lng })
    setForm(p => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }))
    setShowMap(false)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED.includes(file.type)) { toast.error("Дозволені лише JPEG та PNG"); return }
    if (file.size > MAX_BYTES)        { toast.error("Файл занадто великий (макс 5 МБ)"); return }
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let created = await createRequest({
        ...form,
        latitude:  Number(form.latitude),
        longitude: Number(form.longitude),
      })
      if (photo) {
        try { created = await uploadPhoto(created.id, photo) }
        catch { toast.info("Заявку створено, але фото не завантажено") }
      }
      toast.success("Заявку створено!")
      onCreated(created)
    } catch {
      toast.error("Помилка при створенні заявки")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] rounded-2xl border border-white/8" style={{ background: "#0c1220" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">Нова заявка</p>
            <h2 className="text-base font-bold text-white mt-0.5">Створення заявки на розмінування</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex flex-col gap-3">
          <input className={inp} style={bg} placeholder="Назва*" value={form.title} onChange={set("title")} required />
          <textarea className={`${inp} resize-none`} style={bg} placeholder="Опис ситуації" rows={2} value={form.description} onChange={set("description")} />
          <select className={inp} style={bg} value={form.priority} onChange={set("priority")}>
            {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
          </select>
          <input className={inp} style={bg} placeholder="Назва локації*" value={form.location_name} onChange={set("location_name")} required />

          <div className="grid grid-cols-2 gap-2">
            <input className={inp} style={bg} type="number" step="any" placeholder="Широта" value={form.latitude} onChange={set("latitude")} required />
            <input className={inp} style={bg} type="number" step="any" placeholder="Довгота" value={form.longitude} onChange={set("longitude")} required />
          </div>

          <button type="button" onClick={() => setShowMap(true)}
            className="flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-xl border border-amber-500/20 text-amber-400 hover:bg-amber-500/8 transition">
            ▦ Вибрати точку на карті
          </button>
          {coords && <p className="text-xs text-slate-500 text-center">📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>}

          {/* Photo */}
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2 text-sm rounded-xl border border-white/8 text-slate-400 hover:text-white hover:bg-white/5 transition" style={bg}>
            📷 {photo ? photo.name : "Додати фото (необов'язково)"}
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFile} />
          {preview && (
            <div className="relative">
              <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-xl border border-white/8" />
              <button type="button"
                onClick={() => { setPhoto(null); setPreview(null); if (fileRef.current) fileRef.current.value = "" }}
                className="absolute top-1.5 right-1.5 bg-black/70 text-white text-xs px-2 py-0.5 rounded-lg hover:bg-black/90 transition">
                ✕
              </button>
            </div>
          )}

          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-slate-400 hover:text-white rounded-xl border border-white/8 hover:bg-white/5 transition">
              Скасувати
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 text-sm font-bold text-slate-900 rounded-xl transition disabled:opacity-50"
              style={{ background: loading ? "#92400e" : "#fbbf24" }}>
              {loading ? "Надсилання…" : "Створити заявку"}
            </button>
          </div>
        </form>
      </div>

      {showMap && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowMap(false)}>
          <div className="w-full max-w-2xl h-[70vh] flex flex-col rounded-2xl overflow-hidden border border-white/8" style={{ background: "#0c1220" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
              <p className="text-sm font-semibold text-white">Клікніть на карті щоб обрати координати</p>
              <button onClick={() => setShowMap(false)} className="text-slate-500 hover:text-white text-xl">×</button>
            </div>
            <div className="flex-1">
              <MapView onMapClick={handleMapClick} selectedCoords={coords} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
