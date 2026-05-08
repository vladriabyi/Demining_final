export default function Spinner({ text = "Завантаження…" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
      <svg className="w-7 h-7 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
      </svg>
      <p className="text-xs tracking-wide">{text}</p>
    </div>
  )
}
