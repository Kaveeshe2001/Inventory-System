
import { calculateEligibleDevices, calculateRemainingEligibility, getDSOfficeStatus, type DSOffice } from '../models/pension'
import { apiClient } from './ApiClient'

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

function mapToDSOffice(b: BackendPensionPoint, assigned = 0): DSOffice {
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
    const response = await apiClient.get<BackendPensionPoint[]>('/pension-points')
    return response.map((item) => mapToDSOffice(item))
  },

  async getActive(): Promise<DSOffice[]> {
    const response = await apiClient.get<BackendPensionPoint[]>('/pension-points/active')
    return response.map((item) => mapToDSOffice(item))
  },

  async getById(id: string | number): Promise<DSOffice> {
    const response = await apiClient.get<BackendPensionPoint>(`/pension-points/${id}`)
    return mapToDSOffice(response)
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

    const requestPayload: BackendPensionPointRequest = {
      code,
      name: data.name,
      address: data.province || 'Western Province',
      telephone: data.telephone || '011-2345678',
      email: data.email || `officer.${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@pensions.gov.lk`,
      pensionFiles: String(files),
    }

    await apiClient.post('/pension-points', requestPayload)
    const created = await apiClient.get<BackendPensionPoint>(`/pension-points/code/${encodeURIComponent(code)}`)
    return mapToDSOffice(created)
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

    const requestPayload: BackendPensionPointRequest = {
      code,
      name: data.name,
      address: data.province || 'Western Province',
      telephone: data.telephone || '011-2345678',
      email: data.email || `officer.${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@pensions.gov.lk`,
      pensionFiles: String(files),
    }

    await apiClient.put(`/pension-points/${id}`, requestPayload)
    return this.getById(id)
  },

  async delete(id: string | number): Promise<void> {
    await apiClient.put(`/pension-points/${id}/deactivate`)
  },
}
