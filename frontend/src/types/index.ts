export type UserRole = "civilian" | "operator" | "coordinator" | "admin"
export type RequestStatus = "pending" | "under_review" | "approved" | "in_progress" | "completed" | "rejected"
export type Priority = "low" | "medium" | "high" | "critical"
export type TerritoryStatus = "contaminated" | "under_survey" | "partially_cleared" | "cleared"

export interface User {
  id: number
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
}

export interface DeminingRequest {
  id: number
  title: string
  description?: string | null
  status: RequestStatus
  priority: Priority
  location_name: string
  latitude: number
  longitude: number
  photo_path?: string | null
  requester_id: number
  assigned_to_id?: number | null
  created_at: string
  updated_at: string
  requester?: User | null
  assignee?: User | null
}

export interface Territory {
  id: number
  name: string
  description?: string | null
  status: TerritoryStatus
  latitude: number
  longitude: number
  area_km2?: number | null
}

export interface DashboardStats {
  total_requests: number
  pending_requests: number
  in_progress_requests: number
  completed_requests: number
  critical_requests: number
  total_territories: number
}
