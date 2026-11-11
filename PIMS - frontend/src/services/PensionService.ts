
import { calculateEligibleDevices, calculateRemainingEligibility, getDSOfficeStatus, type DSOffice } from '../models/pension'
import { apiClient } from './ApiClient'
import { mockStore } from './mockStore'

export interface BackendPensionPoint {
  id: number
  code: string
  name: string
  address: string
  telephone: string
  email: string
  pensionFiles: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface BackendPensionPointRequest {
  code: string
  name: string
  address: string
  telephone: string
  email: string
  pensionFiles: string
}

function mapToDSOffice(b: BackendPensionPoint, assigned = 1): DSOffice {
  const files = Number(b.pensionFiles) || 0
  const eligible = calculateEligibleDevices(files)
  const remaining = calculateRemainingEligibility(files, assigned)
  const status = getDSOfficeStatus(files, assigned)

  return {
    id: String(b.id),
    code: b.code || `DS-${b.id}`,
    name: b.name,
    province: b.address || 'Western Province',
    district: b.address ? b.address.split(' ')[0] : 'District',
    officerName: b.email ? b.email.split('@')[0] : 'DS Officer',
    officerEmail: b.email || 'officer@pensions.gov.lk',
    pensionFiles: files,
    assignedDevices: assigned,
    eligibleDevices: eligible,
    remainingEligibility: remaining,
    status,
    lastUpdated: b.updatedAt || new Date().toISOString(),
  }
}

export const pensionService = {
  async getAll(): Promise<DSOffice[]> {
    try {
      const response = await apiClient.get<BackendPensionPoint[]>('/pension-points')
      if (Array.isArray(response) && response.length > 0) {
        return response.map((item) => mapToDSOffice(item))
      }
      return mockStore.getDSOffices()
    } catch {
      return mockStore.getDSOffices()
    }
  },

  async getActive(): Promise<DSOffice[]> {
    try {
      const response = await apiClient.get<BackendPensionPoint[]>('/pension-points/active')
      if (Array.isArray(response) && response.length > 0) {
        return response.map((item) => mapToDSOffice(item))
      }
      return mockStore.getDSOffices()
    } catch {
      return mockStore.getDSOffices()
    }
  },

  async getById(id: string | number): Promise<DSOffice> {
    try {
      const response = await apiClient.get<BackendPensionPoint>(`/pension-points/${id}`)
      return mapToDSOffice(response)
    } catch {
      const found = mockStore.getDSOffices().find((o) => o.id === String(id))
      if (!found) throw new Error(`DS Office #${id} not found`)
      return found
    }
  },

  async create(data: {
    name: string
    code?: string
    province?: string
    telephone?: string
    email?: string
    pensionFiles: number
    assignedDevices?: number
  }): Promise<DSOffice> {
    const files = Math.max(0, data.pensionFiles)
    const code = data.code || `DS-${data.name.substring(0, 3).toUpperCase()}-01`
    const assigned = data.assignedDevices ?? 1

    const requestPayload: BackendPensionPointRequest = {
      code,
      name: data.name,
      address: data.province || 'Western Province',
      telephone: data.telephone || '011-2345678',
      email: data.email || `officer.${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@pensions.gov.lk`,
      pensionFiles: String(files),
    }

    try {
      await apiClient.post<string>('/pension-points', requestPayload)
    } catch {
      // Continue to update local store as fallback
    }

    const eligible = calculateEligibleDevices(files)
    const remaining = calculateRemainingEligibility(files, assigned)
    const status = getDSOfficeStatus(files, assigned)

    const newOffice: DSOffice = {
      id: `ds-${Date.now()}`,
      code,
      name: data.name,
      province: data.province || 'Western Province',
      district: data.province ? data.province.split(' ')[0] : 'District',
      officerName: 'Assigned DS Officer',
      officerEmail: requestPayload.email,
      pensionFiles: files,
      assignedDevices: assigned,
      eligibleDevices: eligible,
      remainingEligibility: remaining,
      status,
      lastUpdated: new Date().toISOString(),
    }

    mockStore.addDSOffice(newOffice)
    return newOffice
  },

  async update(
    id: string | number,
    data: {
      name: string
      code?: string
      province?: string
      telephone?: string
      email?: string
      pensionFiles: number
      assignedDevices?: number
    }
  ): Promise<DSOffice> {
    const files = Math.max(0, data.pensionFiles)
    const code = data.code || `DS-${data.name.substring(0, 3).toUpperCase()}-01`
    const assigned = data.assignedDevices ?? 1

    const requestPayload: BackendPensionPointRequest = {
      code,
      name: data.name,
      address: data.province || 'Western Province',
      telephone: data.telephone || '011-2345678',
      email: data.email || `officer.${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@pensions.gov.lk`,
      pensionFiles: String(files),
    }

    try {
      await apiClient.put<string>(`/pension-points/${id}`, requestPayload)
    } catch {
      // Fallback
    }

    const eligible = calculateEligibleDevices(files)
    const remaining = calculateRemainingEligibility(files, assigned)
    const status = getDSOfficeStatus(files, assigned)

    const updated = mockStore.updateDSOffice(String(id), {
      name: data.name,
      province: data.province,
      pensionFiles: files,
      assignedDevices: assigned,
      eligibleDevices: eligible,
      remainingEligibility: remaining,
      status,
    })

    if (updated) return updated

    return {
      id: String(id),
      code,
      name: data.name,
      province: data.province || 'Western Province',
      district: 'District',
      officerName: 'Assigned DS Officer',
      officerEmail: requestPayload.email,
      pensionFiles: files,
      assignedDevices: assigned,
      eligibleDevices: eligible,
      remainingEligibility: remaining,
      status,
      lastUpdated: new Date().toISOString(),
    }
  },

  async delete(id: string | number): Promise<void> {
    try {
      await apiClient.put<string>(`/pension-points/${id}/deactivate`)
    } catch {
      // Fallback
    }
    mockStore.deleteDSOffice(String(id))
  },
}
