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
    return apiClient.get<BackendAssignment[]>('/item-assignments')
  },

  async getActive(): Promise<BackendAssignment[]> {
    return apiClient.get<BackendAssignment[]>('/item-assignments/active')
  },

  async getById(id: number | string): Promise<BackendAssignment> {
    return apiClient.get<BackendAssignment>(`/item-assignments/${id}`)
  },

  async getByPensionPoint(pensionPointId: number | string): Promise<BackendAssignment[]> {
    return apiClient.get<BackendAssignment[]>(`/item-assignments/pension-point/${pensionPointId}`)
  },

  async create(dto: CreateAssignmentDto): Promise<string> {
    return apiClient.post<string>('/item-assignments', dto)
  },

  async returnAssignment(id: number | string, returnRemarks?: string): Promise<string> {
    return apiClient.put<string>(`/item-assignments/${id}/return`, {
      remarks: returnRemarks || 'Device returned in normal operating order',
    })
  },
}
