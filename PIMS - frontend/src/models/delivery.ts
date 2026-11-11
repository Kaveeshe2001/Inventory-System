export type DeliveryStatus = 'PENDING_DELIVERY' | 'DELIVERED'
export type ReturnStatus = 'RETURN_REQUESTED' | 'APPROVED' | 'RECEIVED'

export interface DeliveryRecord {
  id: string
  requestId: string
  dsOfficeName: string
  item: string
  quantity: number
  serialNumbers: string[]
  assignedBy: string
  date: string
  status: DeliveryStatus
  recipientOfficer?: string
  signatureNote?: string
  deliveredAt?: string
}

export interface ReturnRecord {
  id: string
  dsOfficeName: string
  deviceName: string
  serialNumber: string
  reason: string
  requestedDate: string
  status: ReturnStatus
  receivedDate?: string
  inspectorNotes?: string
  conditions?: {
    goodCondition: boolean
    damaged: boolean
    missingParts: boolean
  }
}
