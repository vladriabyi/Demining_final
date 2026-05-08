import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react"

type ToastType = "success" | "error" | "info"

interface Toast { id: number; type: ToastType; message: string; dying?: boolean }
interface ToastCtx { success: (m: string) => void; error: (m: string) => void; info: (m: string) => void }

const Ctx = createContext<ToastCtx | null>(null)
let nextId = 0

const ICONS: Record<ToastType, string>   = { success: "✓", error: "✕", info: "ℹ" }
const COLORS: Record<ToastType, string>  = {
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  error:   "border-red-500/40    bg-red-500/10    text-red-300",
  info:    "border-amber-500/40  bg-amber-500/10  text-amber-300",
}
const DOT: Record<ToastType, string> = {
  success: "bg-emerald-400", error: "bg-red-400", info: "bg-amber-400",
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: number) => {
    setToasts(p => p.map(t => t.id === id ? { ...t, dying: true } : t))
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 220)
  }, [])

  const push = useCallback((type: ToastType, message: string) => {
    const id = ++nextId
    setToasts(p => [...p.slice(-4), { id, type, message }])
    const t = setTimeout(() => dismiss(id), 3800)
    timers.current.set(id, t)
  }, [dismiss])

  const ctx: ToastCtx = {
    success: m => push("success", m),
    error:   m => push("error",   m),
    info:    m => push("info",    m),
  }

  return (
    <Ctx.Provider value={ctx}>
      {children}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => { clearTimeout(timers.current.get(t.id)); dismiss(t.id) }}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border
              shadow-2xl cursor-pointer select-none max-w-xs
              ${COLORS[t.type]}
              ${t.dying ? "toast-out" : "toast-in"}
            `}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${DOT[t.type]} text-slate-900`}>
              {ICONS[t.type]}
            </span>
            <p className="text-sm font-medium leading-snug">{t.message}</p>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useToast must be inside ToastProvider")
  return ctx
}
