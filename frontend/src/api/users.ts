import client from "./client"
import type { User, UserRole } from "../types"

export interface UserAdminUpdate { role?: UserRole; is_active?: boolean }

export const getUsers    = () => client.get<User[]>("/users/").then(r => r.data)
export const getMe       = () => client.get<User>("/users/me").then(r => r.data)
export const updateUser  = (id: number, data: UserAdminUpdate) => client.patch<User>(`/users/${id}`, data).then(r => r.data)
