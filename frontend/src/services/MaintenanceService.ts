
import type { MaintenanceRequest } from '../models/maintenance'
import { ApiError, apiClient } from './ApiClient'

export interface BackendMaintenanceRequest {
  itemId: number
  itemCode?: string
  maintenanceType: string
  problemDescription: string
  actionTaken?: string
  serviceProvider?: string
  cost?: number
  remarks?: string
}

export interface BackendMaintenanceItem {
  id: number
  itemId: number
  itemCode: string
  maintenanceType: string
  problemDescription: string
  actionTaken?: string
  serviceProvider?: string
  startedAt?: string
  completedAt?: string
  cost?: number
  status: string
  remarks?: string
  createdAt?: string
}

function mapBackendToMaintenance(b: BackendMaintenanceItem): MaintenanceRequest {
  let status: MaintenanceRequest['status'] = 'PENDING'
  if (b.status === 'IN_PROGRESS') status = 'IN_REPAIR'
  else if (b.status === 'COMPLETED') status = 'RESOLVED'
  else if (b.status === 'CANCELLED') status = 'REJECTED'

  return {
    id: String(b.id),
    ticketNumber: `MT-${String(b.id).padStart(4, '0')}`,
    dsOfficeId: 'ds-1',
    dsOfficeName: 'Department Depot',
    deviceId: String(b.itemId),
    deviceName: b.itemCode || `Device #${b.itemId}`,
    serialNumber: b.itemCode || `SN-${b.itemId}`,
    issueCategory: (b.maintenanceType as any) || 'Hardware',
    priority: 'Medium',
    description: b.problemDescription,
    status,
    scheduleDate: b.startedAt,
    technician: b.serviceProvider,
    notes: b.remarks || b.actionTaken,
    createdAt: b.createdAt || new Date().toISOString(),
    updatedAt: b.completedAt,
  }
}

export const maintenanceService = {
  async getAll(): Promise<MaintenanceRequest[]> {
    const response = await apiClient.get<BackendMaintenanceItem[]>('/item-maintenance')
    return response.map(mapBackendToMaintenance)
  },

  async getById(id: number | string): Promise<MaintenanceRequest | null> {
    try {
      const response = await apiClient.get<BackendMaintenanceItem>(`/item-maintenance/${id}`)
      return mapBackendToMaintenance(response)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  },

  async create(data: {
    deviceId: string
    deviceCode?: string
    issueCategory: string
    description: string
    serviceProvider?: string
  }): Promise<MaintenanceRequest> {
    const numericId = Number(data.deviceId)
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new Error('A valid backend item ID is required to create a maintenance request.')
    }
    const requestPayload: BackendMaintenanceRequest = {
      itemId: numericId,
      itemCode: data.deviceCode || `DEV-${numericId}`,
      maintenanceType: data.issueCategory,
      problemDescription: data.description,
      serviceProvider: data.serviceProvider || 'Internal Depot Service',
      remarks: 'Submitted for repair diagnostics',
    }

    const id = await apiClient.post<number>('/item-maintenance', requestPayload)
    const created = await this.getById(id)
    if (!created) throw new Error('Maintenance request was created but could not be reloaded from the server.')
    return created
  },

  async startMaintenance(id: number | string): Promise<void> {
    await apiClient.put(`/item-maintenance/${id}/start`)
  },

  async completeMaintenance(
    id: number | string,
    details?: { actionTaken?: string; cost?: number; remarks?: string }
  ): Promise<void> {
    const existing = await apiClient.get<BackendMaintenanceItem>(`/item-maintenance/${id}`)
    await apiClient.put(`/item-maintenance/${id}/complete`, {
      itemId: existing.itemId,
      itemCode: existing.itemCode,
      maintenanceType: existing.maintenanceType,
      problemDescription: existing.problemDescription,
      actionTaken: details?.actionTaken || 'Component replaced and stress-tested',
      cost: details?.cost || 0,
      remarks: details?.remarks || 'Passed quality inspection',
    })
  },

  async cancelMaintenance(id: number | string): Promise<void> {
    await apiClient.put(`/item-maintenance/${id}/cancel`)
  },
}
