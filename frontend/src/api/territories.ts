import client from "./client"
import type { Territory, TerritoryStatus } from "../types"

export interface TerritoryCreate {
  name: string; description?: string; status: TerritoryStatus
  latitude: number; longitude: number; area_km2?: number
}
export type TerritoryUpdate = Partial<TerritoryCreate>

export const getTerritories  = () => client.get<Territory[]>("/territories/").then(r => r.data)
export const createTerritory = (data: TerritoryCreate) => client.post<Territory>("/territories/", data).then(r => r.data)
export const updateTerritory = (id: number, data: TerritoryUpdate) => client.patch<Territory>(`/territories/${id}`, data).then(r => r.data)
export const deleteTerritory = (id: number) => client.delete(`/territories/${id}`)
