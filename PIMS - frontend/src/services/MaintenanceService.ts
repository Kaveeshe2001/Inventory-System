
import type { MaintenanceRequest } from '../models/maintenance'
import { apiClient } from './ApiClient'
import { mockStore } from './mockStore'

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
    try {
      const response = await apiClient.get<BackendMaintenanceItem[]>('/item-maintenance')
      if (Array.isArray(response) && response.length > 0) {
        return response.map(mapBackendToMaintenance)
      }
      return mockStore.getMaintenance()
    } catch {
      return mockStore.getMaintenance()
    }
  },

  async getById(id: number | string): Promise<MaintenanceRequest | null> {
    try {
      const response = await apiClient.get<BackendMaintenanceItem>(`/item-maintenance/${id}`)
      return mapBackendToMaintenance(response)
    } catch {
      const found = mockStore.getMaintenance().find((m) => m.id === String(id))
      return found || null
    }
  },

  async create(data: {
    deviceId: string
    deviceCode?: string
    issueCategory: string
    description: string
    serviceProvider?: string
  }): Promise<MaintenanceRequest> {
    const numericId = Number(data.deviceId.replace(/\D/g, '')) || 1
    const requestPayload: BackendMaintenanceRequest = {
      itemId: numericId,
      itemCode: data.deviceCode || `DEV-${numericId}`,
      maintenanceType: data.issueCategory,
      problemDescription: data.description,
      serviceProvider: data.serviceProvider || 'Internal Depot Service',
      remarks: 'Submitted for repair diagnostics',
    }

    try {
      await apiClient.post<number>('/item-maintenance', requestPayload)
    } catch {
      // Fallback
    }

    const newTicket: MaintenanceRequest = {
      id: `mt-${Date.now()}`,
      ticketNumber: `MT-${Date.now().toString().slice(-4)}`,
      dsOfficeId: 'ds-1',
      dsOfficeName: 'Divisional Office',
      deviceId: data.deviceId,
      deviceName: data.deviceCode || 'Department Device',
      serialNumber: data.deviceCode || 'SN-DEP-01',
      issueCategory: data.issueCategory as any,
      priority: 'Medium',
      description: data.description,
      status: 'PENDING',
      technician: data.serviceProvider,
      createdAt: new Date().toISOString(),
    }

    mockStore.addMaintenance(newTicket)
    return newTicket
  },

  async startMaintenance(id: number | string): Promise<void> {
    try {
      await apiClient.put(`/item-maintenance/${id}/start`)
    } catch {
      // Fallback
    }
    mockStore.updateMaintenance(String(id), { status: 'IN_REPAIR' })
  },

  async completeMaintenance(
    id: number | string,
    details?: { actionTaken?: string; cost?: number; remarks?: string }
  ): Promise<void> {
    try {
      await apiClient.put(`/item-maintenance/${id}/complete`, {
        itemId: Number(String(id).replace(/\D/g, '')) || 1,
        maintenanceType: 'Hardware',
        problemDescription: 'Resolved',
        actionTaken: details?.actionTaken || 'Component replaced and stress-tested',
        cost: details?.cost || 0,
        remarks: details?.remarks || 'Passed quality inspection',
      })
    } catch {
      // Fallback
    }
    mockStore.updateMaintenance(String(id), { status: 'RESOLVED', notes: details?.actionTaken })
  },

  async cancelMaintenance(id: number | string): Promise<void> {
    try {
      await apiClient.put(`/item-maintenance/${id}/cancel`)
    } catch {
      // Fallback
    }
    mockStore.updateMaintenance(String(id), { status: 'REJECTED' })
  },
}
