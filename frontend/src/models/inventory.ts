export type ItemStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED'

export interface Category {
  id: string
  name: string
  code: string
  description?: string
  icon?: string
  itemCount: number
}

export interface InventoryItem {
  id: string
  itemCode: string
  name: string
  category: string
  categoryId: string
  image?: string
  quantity: number
  minThreshold: number
  unit: string
  unitPrice: number
  status: ItemStatus
  location: string
  supplier?: string
  serialNumbers: string[]
  lastRestocked?: string
  updatedAt: string
}

export interface CreateItemDto {
  itemCode: string
  name: string
  categoryId: string
  image?: string
  quantity: number
  minThreshold: number
  unit: string
  unitPrice: number
  location: string
  supplier?: string
  serialNumbers?: string[]
}

export interface UpdateItemDto extends Partial<CreateItemDto> {
  id: string
}

export interface StockAdjustmentDto {
  itemId: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  reason: string
}
