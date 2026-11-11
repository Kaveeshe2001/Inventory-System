import { calculateEligibleDevices } from "../models/pension"
import type { CreateRequestDto, ItemRequest, RequestStatus } from "../models/request"
import type { User } from "../models/user"
import { apiClient } from "./ApiClient"
import { mockStore } from "./mockStore"


export interface BackendItemRequest {
  id: number
  itemId: number
  requestedBy: number
  pensionPointId: number
  pensionFiles: number | string
  reason: string
  status: string
  requestedAt?: string
  approvedBy?: number
  approvedAt?: string
  rejectionReason?: string
}

function mapBackendToRequest(b: BackendItemRequest, itemName = 'Hardware Asset', itemCode = 'HW-01'): ItemRequest {
  const files = Number(b.pensionFiles) || 3000
  const eligible = calculateEligibleDevices(files)
  const reqNum = `REQ-2026-${String(b.id).padStart(4, '0')}`

  let status: RequestStatus = 'PENDING'
  if (b.status === 'APPROVED') status = 'APPROVED'
  else if (b.status === 'REJECTED') status = 'REJECTED'
  else if (b.status === 'CANCELLED') status = 'REJECTED'
  else if (b.status === 'ASSIGNED') status = 'ASSIGNED'
  else if (b.status === 'DISPATCHED') status = 'DISPATCHED'
  else if (b.status === 'DELIVERED') status = 'DELIVERED'

  return {
    id: String(b.id),
    requestNumber: reqNum,
    dsOfficeId: String(b.pensionPointId || 1),
    dsOfficeName: `DS Office #${b.pensionPointId || 1}`,
    requestedBy: `Officer #${b.requestedBy || 1}`,
    requestedById: String(b.requestedBy || 1),
    pensionFiles: files,
    eligibleDevices: eligible,
    assignedDevices: 1,
    availableQuota: Math.max(0, eligible - 1),
    itemId: String(b.itemId),
    itemName,
    itemCode,
    quantity: 1,
    unit: 'Units',
    reason: b.reason || 'Official duties require additional hardware units.',
    status,
    createdAt: b.requestedAt || new Date().toISOString(),
    approvedBy: b.approvedBy ? `Admin #${b.approvedBy}` : undefined,
    approvedAt: b.approvedAt,
    rejectionReason: b.rejectionReason,
  }
}

export const requestService = {
  async getAllRequests(): Promise<ItemRequest[]> {
    try {
      const response = await apiClient.get<BackendItemRequest[]>('/item-requests')
      if (Array.isArray(response) && response.length > 0) {
        const items = mockStore.getItems()
        const itemMap = new Map(items.map((i) => [i.id, i]))
        return response.map((r) => {
          const item = itemMap.get(String(r.itemId))
          return mapBackendToRequest(r, item?.name, item?.itemCode)
        })
      }
      return mockStore.getRequests()
    } catch {
      return mockStore.getRequests()
    }
  },

  async getMyRequests(userId: string): Promise<ItemRequest[]> {
    const numericUserId = Number(userId.replace(/\D/g, '')) || 1
    try {
      const response = await apiClient.get<BackendItemRequest[]>('/item-requests/my', {
        userId: numericUserId,
      })
      if (Array.isArray(response) && response.length > 0) {
        const items = mockStore.getItems()
        const itemMap = new Map(items.map((i) => [i.id, i]))
        return response.map((r) => {
          const item = itemMap.get(String(r.itemId))
          return mapBackendToRequest(r, item?.name, item?.itemCode)
        })
      }
      return mockStore.getRequests().filter((r) => r.requestedById === userId)
    } catch {
      return mockStore.getRequests().filter((r) => r.requestedById === userId)
    }
  },

  async createRequest(dto: CreateRequestDto, user: User): Promise<ItemRequest> {
    const numericUserId = Number(user.id.replace(/\D/g, '')) || 1
    const numericItemId = Number(dto.itemId.replace(/\D/g, '')) || 1
    const numericPensionPointId = Number(dto.dsOfficeId?.replace(/\D/g, '')) || 1

    try {
      await apiClient.post<string>(
        '/item-requests',
        {
          itemId: numericItemId,
          pensionPointId: numericPensionPointId,
          pensionFiles: '3000',
          reason: dto.reason,
        },
        { userId: numericUserId }
      )
    } catch {
      // Fallback
    }

    const items = mockStore.getItems()
    const item = items.find((i) => i.id === dto.itemId) || items[0]

    const count = mockStore.getRequests().length + 1
    const requestNumber = `REQ-2026-${String(count).padStart(4, '0')}`

    const newRequest: ItemRequest = {
      id: `req-${Date.now()}`,
      requestNumber,
      dsOfficeId: dto.dsOfficeId || 'ds-1',
      dsOfficeName: dto.department || user.department,
      pensionFiles: 3240,
      eligibleDevices: 2,
      assignedDevices: 1,
      availableQuota: 1,
      itemId: item ? item.id : dto.itemId,
      itemName: item ? item.name : 'Standard IT Laptop',
      itemCode: item ? item.itemCode : 'LPT-2026-001',
      quantity: dto.quantity,
      unit: item?.unit || 'Units',
      reason: dto.reason,
      requestedBy: user.fullName,
      requestedById: user.id,
      department: user.department,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }

    mockStore.addRequest(newRequest)
    return newRequest
  },

  async updateRequestStatus(
    requestId: string,
    status: RequestStatus,
    approverName?: string,
    remarks?: string
  ): Promise<ItemRequest> {
    const numericId = Number(requestId.replace(/\D/g, ''))
    const adminId = 1

    if (!isNaN(numericId) && numericId > 0) {
      try {
        if (status === 'APPROVED') {
          await apiClient.put<string>(`/item-requests/${numericId}/approve`, undefined, { adminId })
        } else if (status === 'REJECTED') {
          await apiClient.put<string>(
            `/item-requests/${numericId}/reject`,
            { decision: 'REJECT', reason: remarks || 'Rejected by Admin' },
            { adminId }
          )
        }
      } catch {
        // Fallback
      }
    }

    const existing = mockStore.getRequests().find((r) => r.id === requestId)
    if (!existing) throw new Error('Request not found')

    const updates: Partial<ItemRequest> = {
      status,
      remarks,
      approvedBy: approverName || 'Central IT Officer',
      approvedAt: new Date().toISOString(),
    }

    if (status === 'DISPATCHED' && existing.status !== 'DISPATCHED') {
      const item = mockStore.getItems().find((i) => i.id === existing.itemId)
      if (item) {
        const newQty = Math.max(0, item.quantity - existing.quantity)
        mockStore.updateItem(item.id, {
          quantity: newQty,
          status: newQty === 0 ? 'OUT_OF_STOCK' : newQty <= item.minThreshold ? 'LOW_STOCK' : 'IN_STOCK',
        })
      }
    }

    const updated = mockStore.updateRequest(requestId, updates)
    if (!updated) throw new Error('Failed to update request')
    return updated
  },
}
