import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { User } from "../types"

interface AuthState { user: User | null; token: string | null }
interface AuthCtx extends AuthState {
  login:  (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
}

const Ctx = createContext<AuthCtx | null>(null)

function loadInitial(): AuthState {
  try {
    const token = localStorage.getItem("access_token")
    const raw   = localStorage.getItem("user")
    if (token && raw) return { token, user: JSON.parse(raw) as User }
  } catch { /* corrupted storage */ }
  return { token: null, user: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadInitial)

  const login = useCallback((token: string, user: User) => {
    localStorage.setItem("access_token", token)
    localStorage.setItem("user", JSON.stringify(user))
    setState({ token, user })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    setState({ token: null, user: null })
  }, [])

  return (
    <Ctx.Provider value={{ ...state, login, logout, isAuthenticated: !!state.token }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}
