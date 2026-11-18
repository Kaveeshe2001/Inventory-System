
import type { Category, CreateItemDto, InventoryItem, ItemStatus, StockAdjustmentDto, UpdateItemDto } from '../models/inventory'
import { ApiError, apiClient } from './ApiClient'

export interface BackendCategory {
  id?: number
  Id?: number
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
    const [backendItems, backendCategories] = await Promise.all([
      apiClient.get<BackendItem[]>('/items'),
      apiClient.get<BackendCategory[]>('/category'),
    ])
    const catMap = new Map(backendCategories.map((category) => [category.id, category.name]))
    return backendItems.map((item) => mapBackendToItem(item, catMap.get(item.categoryId) || 'IT Equipment'))
  },

  async getItemById(id: string): Promise<InventoryItem> {
    const backendItem = await apiClient.get<BackendItem>(`/items/${id}`)
    const categories = await apiClient.get<BackendCategory[]>('/category')
    const categoryName = categories.find((category) => category.id === backendItem.categoryId)?.name
    return mapBackendToItem(backendItem, categoryName)
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

    await apiClient.post('/items', payload)
    const savedItems = await apiClient.get<BackendItem[]>('/items')
    const savedItem = savedItems.find((item) => item.itemCode === payload.itemCode)
    if (!savedItem) throw new Error('Item was created but could not be reloaded from the server.')
    return this.getItemById(String(savedItem.id))
  },

  async updateItem(dto: UpdateItemDto): Promise<InventoryItem> {
    const existing = await this.getItemById(dto.id)
    const payload = {
      itemCode: dto.itemCode?.trim().toUpperCase() || existing.itemCode,
      name: dto.name?.trim() || existing.name,
      categoryId: Number(dto.categoryId || existing.categoryId),
      brand: dto.supplier ?? existing.supplier ?? '',
      model: dto.name || existing.name,
      serialNumber: dto.serialNumbers?.[0] || existing.serialNumbers[0] || '',
      purchaseDate: existing.lastRestocked?.slice(0, 10),
      purchasePrice: dto.unitPrice ?? existing.unitPrice,
      warrantyExpiry: undefined,
      itemCondition: 'NEW',
      status: 'AVAILABLE',
      location: dto.location ?? existing.location,
      description: dto.name ?? existing.name,
    }

    await apiClient.put(`/items/${dto.id}`, payload)
    return this.getItemById(dto.id)
  },

  async deleteItem(id: string): Promise<void> {
    await apiClient.delete(`/items/${id}`)
  },

  async adjustStock(dto: StockAdjustmentDto): Promise<InventoryItem> {
    throw new ApiError(`Stock adjustment is not supported by the backend API yet (item ${dto.itemId}).`, 501)
  },

  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<BackendCategory[]>('/category')
    return response.map((category, index) => {
      const resolvedId = category.id ?? category.Id ?? (index + 1)
      return {
        id: String(resolvedId),
        name: category.name,
        code: category.name.substring(0, 3).toUpperCase(),
        description: category.description,
        itemCount: 0,
      }
    })
  },

  async createCategory(name: string, code: string, description?: string): Promise<Category> {
    await apiClient.post('/category', { name: name.trim(), description: description?.trim() })
    const categories = await this.getCategories()
    const savedCategory = categories.find((category) => category.name === name.trim())
    if (!savedCategory) throw new Error('Category was created but could not be reloaded from the server.')
    return { ...savedCategory, code: code.trim().toUpperCase() || savedCategory.code }
  },

  async updateCategory(id: string, name: string, code: string, description?: string): Promise<Category> {
    await apiClient.put(`/category/${id}`, { name: name.trim(), description: description?.trim() })
    const categories = await this.getCategories()
    const savedCategory = categories.find((category) => category.id === id)
    if (!savedCategory) throw new Error('Category was updated but could not be reloaded from the server.')
    return { ...savedCategory, code: code.trim().toUpperCase() || savedCategory.code }
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/category/${id}`)
  },
}
