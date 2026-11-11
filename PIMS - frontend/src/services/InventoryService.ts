
import type { Category, CreateItemDto, InventoryItem, ItemStatus, StockAdjustmentDto, UpdateItemDto } from '../models/inventory'
import { apiClient } from './ApiClient'
import { mockStore } from './mockStore'

export interface BackendCategory {
  id: number
  name: string
  description?: string
  active?: boolean
}

export interface BackendItem {
  id: number
  itemCode: string
  name: string
  categoryId: number
  brand?: string
  model?: string
  serialNumber?: string
  purchaseDate?: string
  purchasePrice?: number
  warrantyExpiry?: string
  condition?: string
  status?: string
  location?: string
  description?: string
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

function mapBackendToItem(b: BackendItem, catName = 'IT Equipment'): InventoryItem {
  let status: ItemStatus = 'IN_STOCK'
  if (b.status === 'RETIRED' || !b.active) status = 'DISCONTINUED'
  else if (b.status === 'ASSIGNED') status = 'OUT_OF_STOCK'
  else if (b.status === 'IN_MAINTENANCE') status = 'LOW_STOCK'

  return {
    id: String(b.id),
    itemCode: b.itemCode,
    name: b.name,
    category: catName,
    categoryId: String(b.categoryId),
    quantity: b.status === 'AVAILABLE' ? 1 : 0,
    minThreshold: 1,
    unit: 'Units',
    unitPrice: Number(b.purchasePrice) || 0,
    status,
    location: b.location || 'Depot Central',
    supplier: b.brand,
    serialNumbers: b.serialNumber ? [b.serialNumber] : [],
    lastRestocked: b.createdAt || new Date().toISOString(),
    updatedAt: b.updatedAt || new Date().toISOString(),
  }
}

export const inventoryService = {
  async getItems(): Promise<InventoryItem[]> {
    try {
      const [backendItems, backendCategories] = await Promise.all([
        apiClient.get<BackendItem[]>('/items'),
        apiClient.get<BackendCategory[]>('/category').catch(() => []),
      ])

      if (Array.isArray(backendItems) && backendItems.length > 0) {
        const catMap = new Map<number, string>()
        if (Array.isArray(backendCategories)) {
          backendCategories.forEach((c) => catMap.set(c.id, c.name))
        }

        return backendItems.map((bi) => mapBackendToItem(bi, catMap.get(bi.categoryId) || 'IT Equipment'))
      }
      return mockStore.getItems()
    } catch {
      return mockStore.getItems()
    }
  },

  async getItemById(id: string): Promise<InventoryItem> {
    try {
      const backendItem = await apiClient.get<BackendItem>(`/items/${id}`)
      return mapBackendToItem(backendItem)
    } catch {
      const item = mockStore.getItems().find((i) => i.id === id)
      if (!item) throw new Error('Item not found.')
      return item
    }
  },

  async createItem(dto: CreateItemDto): Promise<InventoryItem> {
    const payload = {
      itemCode: dto.itemCode.trim().toUpperCase(),
      name: dto.name.trim(),
      categoryId: Number(dto.categoryId) || 1,
      brand: dto.supplier || 'Government Asset Fleet',
      model: dto.name,
      serialNumber: dto.serialNumbers?.[0] || `SN-${Date.now().toString().slice(-4)}`,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: dto.unitPrice,
      warrantyExpiry: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 3).toISOString().split('T')[0],
      itemCondition: 'NEW',
      status: 'AVAILABLE',
      location: dto.location || 'Central Depot',
      description: `${dto.name} (${dto.itemCode})`,
    }

    try {
      await apiClient.post<{ Success: string }>('/items', payload)
    } catch {
      // Proceed to mock fallback
    }

    const categories = mockStore.getCategories()
    const category = categories.find((c) => c.id === dto.categoryId)

    let status: ItemStatus = 'IN_STOCK'
    if (dto.quantity <= 0) status = 'OUT_OF_STOCK'
    else if (dto.quantity <= dto.minThreshold) status = 'LOW_STOCK'

    const newItem: InventoryItem = {
      id: `itm-${Date.now()}`,
      itemCode: dto.itemCode.trim().toUpperCase(),
      name: dto.name.trim(),
      category: category?.name || 'General Equipment',
      categoryId: dto.categoryId,
      quantity: dto.quantity,
      minThreshold: dto.minThreshold,
      unit: dto.unit,
      unitPrice: dto.unitPrice,
      status,
      location: dto.location,
      supplier: dto.supplier,
      serialNumbers: dto.serialNumbers || ['SN-' + Date.now().toString().slice(-4)],
      lastRestocked: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockStore.addItem(newItem)
    return newItem
  },

  async updateItem(dto: UpdateItemDto): Promise<InventoryItem> {
    const payload = {
      itemCode: dto.itemCode?.trim().toUpperCase(),
      name: dto.name?.trim(),
      categoryId: dto.categoryId ? Number(dto.categoryId) : undefined,
      brand: dto.supplier,
      model: dto.name,
      serialNumber: dto.serialNumbers?.[0],
      purchasePrice: dto.unitPrice,
      status: 'AVAILABLE',
      location: dto.location,
      description: dto.name,
    }

    try {
      await apiClient.put<string>(`/items/${dto.id}`, payload)
    } catch {
      // Proceed to mock fallback
    }

    const existing = mockStore.getItems().find((i) => i.id === dto.id)
    if (!existing) throw new Error('Item not found')

    const updatedQty = dto.quantity !== undefined ? dto.quantity : existing.quantity
    const updatedThreshold = dto.minThreshold !== undefined ? dto.minThreshold : existing.minThreshold

    let status: ItemStatus = existing.status
    if (updatedQty <= 0) status = 'OUT_OF_STOCK'
    else if (updatedQty <= updatedThreshold) status = 'LOW_STOCK'
    else status = 'IN_STOCK'

    const categories = mockStore.getCategories()
    const category = dto.categoryId
      ? categories.find((c) => c.id === dto.categoryId)?.name
      : existing.category

    const updated = mockStore.updateItem(dto.id, {
      ...dto,
      category,
      status,
    })
    if (!updated) throw new Error('Item not found.')
    return updated
  },

  async deleteItem(id: string): Promise<void> {
    try {
      await apiClient.delete(`/items/${id}`)
    } catch {
      // Proceed to mock fallback
    }
    mockStore.deleteItem(id)
  },

  async adjustStock(dto: StockAdjustmentDto): Promise<InventoryItem> {
    const item = mockStore.getItems().find((i) => i.id === dto.itemId)
    if (!item) throw new Error('Item not found.')

    let newQty = item.quantity
    if (dto.type === 'IN') newQty += dto.quantity
    else if (dto.type === 'OUT') {
      if (newQty < dto.quantity) throw new Error('Insufficient inventory quantity.')
      newQty -= dto.quantity
    } else {
      newQty = dto.quantity
    }

    let status: ItemStatus = 'IN_STOCK'
    if (newQty <= 0) status = 'OUT_OF_STOCK'
    else if (newQty <= item.minThreshold) status = 'LOW_STOCK'

    const updated = mockStore.updateItem(item.id, {
      quantity: newQty,
      status,
      lastRestocked: dto.type === 'IN' ? new Date().toISOString() : item.lastRestocked,
    })

    if (!updated) throw new Error('Item update failed.')
    return updated
  },

  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<BackendCategory[]>('/category')
      if (Array.isArray(response) && response.length > 0) {
        return response.map((c) => ({
          id: String(c.id),
          name: c.name,
          code: c.name.substring(0, 3).toUpperCase(),
          description: c.description,
          itemCount: 0,
        }))
      }
      return mockStore.getCategories()
    } catch {
      return mockStore.getCategories()
    }
  },

  async createCategory(name: string, code: string, description?: string): Promise<Category> {
    try {
      await apiClient.post<{ Success: string }>('/category', {
        name: name.trim(),
        description: description?.trim(),
      })
    } catch {
      // Fallback
    }

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description?.trim(),
      itemCount: 0,
    }
    const cats = mockStore.getCategories()
    cats.push(newCat)
    mockStore.setCategories(cats)
    return newCat
  },
}
