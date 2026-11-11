import { apiClient } from "./ApiClient"

export interface BackendAssignment {
  id: number
  itemId: number
  pensionPointId: number
  assignedTo: number
  assignedAt?: string
  returnedAt?: string
  status: string
  remarks?: string
}

export interface CreateAssignmentDto {
  itemId: number
  pensionPointId: number
  assignedTo: number
  remarks?: string
}

export const assignmentService = {
  async getAll(): Promise<BackendAssignment[]> {
    try {
      return await apiClient.get<BackendAssignment[]>('/item-assignments')
    } catch {
      return []
    }
  },

  async getActive(): Promise<BackendAssignment[]> {
    try {
      return await apiClient.get<BackendAssignment[]>('/item-assignments/active')
    } catch {
      return []
    }
  },

  async getById(id: number | string): Promise<BackendAssignment | null> {
    try {
      return await apiClient.get<BackendAssignment>(`/item-assignments/${id}`)
    } catch {
      return null
    }
  },

  async getByPensionPoint(pensionPointId: number | string): Promise<BackendAssignment[]> {
    try {
      return await apiClient.get<BackendAssignment[]>(`/item-assignments/pension-point/${pensionPointId}`)
    } catch {
      return []
    }
  },

  async create(dto: CreateAssignmentDto): Promise<string> {
    try {
      return await apiClient.post<string>('/item-assignments', dto)
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create item assignment')
    }
  },

  async returnAssignment(id: number | string, returnRemarks?: string): Promise<string> {
    try {
      return await apiClient.put<string>(`/item-assignments/${id}/return`, {
        returnRemarks: returnRemarks || 'Device returned in normal operating order',
      })
    } catch (err: any) {
      throw new Error(err.message || 'Failed to process item return')
    }
  },
}
