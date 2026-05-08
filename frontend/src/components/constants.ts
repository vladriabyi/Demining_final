export const REQUEST_STATUS = {
  pending:      { label: "Очікує",        color: "#94a3b8" },
  under_review: { label: "На розгляді",   color: "#60a5fa" },
  approved:     { label: "Затверджена",   color: "#a78bfa" },
  in_progress:  { label: "В роботі",      color: "#fb923c" },
  completed:    { label: "Завершена",     color: "#4ade80" },
  rejected:     { label: "Відхилена",     color: "#f87171" },
} as const

export const PRIORITY_LABEL = {
  low:      "Низький",
  medium:   "Середній",
  high:     "Високий",
  critical: "Критичний",
} as const

export const PRIORITY_COLOR = {
  low:      "#4ade80",
  medium:   "#facc15",
  high:     "#fb923c",
  critical: "#f87171",
} as const

export const TERRITORY_STATUS = {
  contaminated:      { label: "Забруднена",       color: "#f87171" },
  under_survey:      { label: "Обстежується",     color: "#fb923c" },
  partially_cleared: { label: "Частково очищена", color: "#facc15" },
  cleared:           { label: "Очищена",          color: "#4ade80" },
} as const

export const ROLE_LABEL = {
  civilian:    "Цивільний",
  operator:    "Оператор",
  coordinator: "Координатор",
  admin:       "Адміністратор",
} as const
