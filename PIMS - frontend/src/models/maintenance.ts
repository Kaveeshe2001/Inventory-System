export type IssueCategory = 'Hardware' | 'Software' | 'Physical damage' | 'Other'
export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Urgent'
export type MaintenanceStatus = 'PENDING' | 'SCHEDULED' | 'IN_REPAIR' | 'RESOLVED' | 'REJECTED'

export interface MaintenanceRequest {
  id: string
  ticketNumber: string
  dsOfficeId: string
  dsOfficeName: string
  deviceId: string
  deviceName: string
  serialNumber: string
  issueCategory: IssueCategory
  priority: MaintenancePriority
  description: string
  photoUrl?: string
  status: MaintenanceStatus
  scheduleDate?: string
  technician?: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateMaintenanceDto {
  deviceId: string
  issueCategory: IssueCategory
  priority: MaintenancePriority
  description: string
  photoUrl?: string
}
