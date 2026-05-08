import client from "./client"
import type { User } from "../types"

interface LoginRequest    { email: string; password: string }
interface RegisterRequest { email: string; password: string; full_name: string }
interface TokenResponse   { access_token: string; token_type: string; user: User }

export const login    = (data: LoginRequest)    => client.post<TokenResponse>("/auth/login",    data).then(r => r.data)
export const register = (data: RegisterRequest) => client.post<TokenResponse>("/auth/register", data).then(r => r.data)
