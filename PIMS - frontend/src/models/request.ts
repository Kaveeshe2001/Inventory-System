export type RequestStatus = 'PENDING' | 'APPROVED' | 'ASSIGNED' | 'DISPATCHED' | 'DELIVERED' | 'REJECTED'

export interface ItemRequest {
  id: string
  requestNumber: string
  dsOfficeId: string
  dsOfficeName: string
  department?: string
  requestedBy: string
  requestedById: string
  pensionFiles: number
  eligibleDevices: number
  assignedDevices: number
  availableQuota: number
  itemId: string
  itemName: string
  itemCode: string
  itemImage?: string
  quantity: number
  unit: string
  reason: string
  status: RequestStatus
  createdAt: string
  approvedBy?: string
  approvedAt?: string
  assignedSerialNumbers?: string[]
  assignedToStoreKeeper?: string
  deliveryNotes?: string
  rejectionReason?: string
  remarks?: string
}

export interface CreateRequestDto {
  itemId: string
  quantity: number
  reason: string
  dsOfficeId?: string
  department?: string
}

export interface UpdateRequestStatusDto {
  requestId: string
  status: RequestStatus
  remarks?: string
  rejectionReason?: string
}
