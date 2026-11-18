import { calculateEligibleDevices } from "../models/pension"
import type { CreateRequestDto, ItemRequest, RequestStatus } from "../models/request"
import type { User } from "../models/user"
import { ApiError, apiClient } from "./ApiClient"


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

interface BackendItem {
  id: number
  itemCode: string
  name: string
}

interface BackendPensionPoint {
  pensionFiles?: number | string
}

function parseId(value: string | number | null | undefined, label: string): number {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) throw new Error(`A valid ${label} ID is required.`)
  return id
}

function mapBackendToRequest(b: BackendItemRequest, itemName = 'Hardware Asset', itemCode = 'HW-01'): ItemRequest {
  const files = Number(b.pensionFiles) || 0
  const eligible = calculateEligibleDevices(files)
  const reqNum = `REQ-${new Date().getFullYear()}-${String(b.id).padStart(4, '0')}`

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
    assignedDevices: 0,
    availableQuota: eligible,
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
    const [requests, items] = await Promise.all([
      apiClient.get<BackendItemRequest[]>('/item-requests'),
      apiClient.get<BackendItem[]>('/items'),
    ])
    const itemMap = new Map(items.map((item) => [item.id, item]))
    return requests.map((request) => {
      const item = itemMap.get(request.itemId)
      return mapBackendToRequest(request, item?.name, item?.itemCode)
    })
  },

  async getMyRequests(userId: string): Promise<ItemRequest[]> {
    const numericUserId = parseId(userId, 'user')
    const [requests, items] = await Promise.all([
      apiClient.get<BackendItemRequest[]>('/item-requests/my', { userId: numericUserId }),
      apiClient.get<BackendItem[]>('/items'),
    ])
    const itemMap = new Map(items.map((item) => [item.id, item]))
    return requests.map((request) => {
      const item = itemMap.get(request.itemId)
      return mapBackendToRequest(request, item?.name, item?.itemCode)
    })
  },

  async createRequest(dto: CreateRequestDto, user: User): Promise<ItemRequest> {
    if (dto.quantity !== 1) {
      throw new ApiError('The backend currently accepts one serialized item per request.', 501)
    }
    const numericUserId = parseId(user.id, 'user')
    const numericItemId = parseId(dto.itemId, 'item')
    const numericPensionPointId = parseId(dto.dsOfficeId ?? user.pensionPointId, 'pension point')
    const [item, pensionPoint] = await Promise.all([
      apiClient.get<BackendItem>(`/items/${numericItemId}`),
      apiClient.get<BackendPensionPoint>(`/pension-points/${numericPensionPointId}`),
    ])
    const requestId = await apiClient.post<string>('/item-requests', {
      itemId: numericItemId,
      pensionPointId: numericPensionPointId,
      pensionFiles: String(pensionPoint.pensionFiles ?? 0),
      reason: dto.reason,
    }, { userId: numericUserId })
    const created = await apiClient.get<BackendItemRequest>(`/item-requests/${parseId(requestId, 'request')}`)
    return mapBackendToRequest(created, item.name, item.itemCode)
  },

  async updateRequestStatus(
    requestId: string,
    status: RequestStatus,
    approverId?: string | number,
    remarks?: string
  ): Promise<ItemRequest> {
    const numericId = parseId(requestId, 'request')
    const adminId = parseId(approverId, 'approver')

    if (status === 'APPROVED') {
      await apiClient.put(`/item-requests/${numericId}/approve`, undefined, { adminId })
    } else if (status === 'REJECTED') {
      await apiClient.put(`/item-requests/${numericId}/reject`, {
        action: 'REJECT',
        rejectionReason: remarks || 'Rejected by administrator',
      }, { adminId })
    } else {
      throw new ApiError(`The backend does not support changing a request to ${status}.`, 501)
    }

    const updated = await apiClient.get<BackendItemRequest>(`/item-requests/${numericId}`)
    const item = await apiClient.get<BackendItem>(`/items/${updated.itemId}`)
    return mapBackendToRequest(updated, item.name, item.itemCode)
  },
}
