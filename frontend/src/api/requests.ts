import client from "./client"
import type { DashboardStats, DeminingRequest, Priority, RequestStatus } from "../types"

export interface RequestCreate {
  title: string
  description?: string
  priority: Priority
  location_name: string
  latitude: number
  longitude: number
}

export interface RequestUpdate {
  title?: string
  description?: string
  status?: RequestStatus
  priority?: Priority
  assigned_to_id?: number | null
}

export const getRequests      = () => client.get<DeminingRequest[]>("/requests/").then(r => r.data)
export const getDashboardStats= () => client.get<DashboardStats>("/requests/stats").then(r => r.data)
export const getRequest       = (id: number) => client.get<DeminingRequest>(`/requests/${id}`).then(r => r.data)
export const createRequest    = (data: RequestCreate) => client.post<DeminingRequest>("/requests/", data).then(r => r.data)
export const updateRequest    = (id: number, data: RequestUpdate) => client.patch<DeminingRequest>(`/requests/${id}`, data).then(r => r.data)
export const deleteRequest    = (id: number) => client.delete(`/requests/${id}`)

export const uploadPhoto = async (id: number, file: File): Promise<DeminingRequest> => {
  const form = new FormData()
  form.append("file", file)
  return client.post<DeminingRequest>(`/requests/${id}/photo`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data)
}
