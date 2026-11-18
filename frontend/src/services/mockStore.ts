
import type { Category, InventoryItem } from '../models/inventory'
import type { MaintenanceRequest } from '../models/maintenance'
import type { DSOffice } from '../models/pension'
import type { ItemRequest } from '../models/request'
import type { User } from '../models/user'
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_ITEMS,
  INITIAL_REQUESTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DS_OFFICES,
  INITIAL_MAINTENANCES,
  type AuditLog,
} from '../utils/mockData'

const STORE_KEYS = {
  USERS: 'invent_store_users',
  ITEMS: 'invent_store_items',
  CATEGORIES: 'invent_store_categories',
  REQUESTS: 'invent_store_requests',
  LOGS: 'invent_store_logs',
  DS_OFFICES: 'invent_store_ds_offices',
  MAINTENANCE: 'invent_store_maintenance',
}

class MockStore {
  getUsers(): User[] {
    const raw = localStorage.getItem(STORE_KEYS.USERS)
    if (!raw) {
      this.setUsers(INITIAL_USERS)
      return INITIAL_USERS
    }
    try {
      return JSON.parse(raw)
    } catch {
      return INITIAL_USERS
    }
  }

  setUsers(users: User[]): void {
    localStorage.setItem(STORE_KEYS.USERS, JSON.stringify(users))
  }

  addUser(user: User): void {
    const users = this.getUsers()
    users.unshift(user)
    this.setUsers(users)
    this.addLog({
      id: `log-${Date.now()}`,
      action: 'USER_REGISTERED',
      actor: user.createdBy || 'IT_OFFICER',
      role: 'IT_OFFICER',
      details: `Registered account ${user.username} (${user.role})`,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
    })
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers()
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) return null
    users[idx] = { ...users[idx], ...updates }
    this.setUsers(users)
    return users[idx]
  }

  getItems(): InventoryItem[] {
    const raw = localStorage.getItem(STORE_KEYS.ITEMS)
    if (!raw) {
      this.setItems(INITIAL_ITEMS)
      return INITIAL_ITEMS
    }
    try {
      return JSON.parse(raw)
    } catch {
      return INITIAL_ITEMS
    }
  }

  setItems(items: InventoryItem[]): void {
    localStorage.setItem(STORE_KEYS.ITEMS, JSON.stringify(items))
  }

  addItem(item: InventoryItem): void {
    const items = this.getItems()
    items.unshift(item)
    this.setItems(items)
  }

  updateItem(id: string, updates: Partial<InventoryItem>): InventoryItem | null {
    const items = this.getItems()
    const idx = items.findIndex((i) => i.id === id)
    if (idx === -1) return null
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() }
    this.setItems(items)
    return items[idx]
  }

  deleteItem(id: string): void {
    const items = this.getItems().filter((i) => i.id !== id)
    this.setItems(items)
  }

  getCategories(): Category[] {
    const raw = localStorage.getItem(STORE_KEYS.CATEGORIES)
    if (!raw) {
      this.setCategories(INITIAL_CATEGORIES)
      return INITIAL_CATEGORIES
    }
    try {
      return JSON.parse(raw)
    } catch {
      return INITIAL_CATEGORIES
    }
  }

  setCategories(cats: Category[]): void {
    localStorage.setItem(STORE_KEYS.CATEGORIES, JSON.stringify(cats))
  }

  getRequests(): ItemRequest[] {
    const raw = localStorage.getItem(STORE_KEYS.REQUESTS)
    if (!raw) {
      this.setRequests(INITIAL_REQUESTS)
      return INITIAL_REQUESTS
    }
    try {
      return JSON.parse(raw)
    } catch {
      return INITIAL_REQUESTS
    }
  }

  setRequests(reqs: ItemRequest[]): void {
    localStorage.setItem(STORE_KEYS.REQUESTS, JSON.stringify(reqs))
  }

  addRequest(req: ItemRequest): void {
    const reqs = this.getRequests()
    reqs.unshift(req)
    this.setRequests(reqs)
  }

  updateRequest(id: string, updates: Partial<ItemRequest>): ItemRequest | null {
    const reqs = this.getRequests()
    const idx = reqs.findIndex((r) => r.id === id)
    if (idx === -1) return null
    reqs[idx] = { ...reqs[idx], ...updates }
    this.setRequests(reqs)
    return reqs[idx]
  }

  getLogs(): AuditLog[] {
    const raw = localStorage.getItem(STORE_KEYS.LOGS)
    if (!raw) {
      this.setLogs(INITIAL_AUDIT_LOGS)
      return INITIAL_AUDIT_LOGS
    }
    try {
      return JSON.parse(raw)
    } catch {
      return INITIAL_AUDIT_LOGS
    }
  }

  setLogs(logs: AuditLog[]): void {
    localStorage.setItem(STORE_KEYS.LOGS, JSON.stringify(logs))
  }

  addLog(log: AuditLog): void {
    const logs = this.getLogs()
    logs.unshift(log)
    this.setLogs(logs)
  }

  getDSOffices(): DSOffice[] {
    const raw = localStorage.getItem(STORE_KEYS.DS_OFFICES)
    if (!raw) {
      this.setDSOffices(INITIAL_DS_OFFICES)
      return INITIAL_DS_OFFICES
    }
    try {
      return JSON.parse(raw)
    } catch {
      return INITIAL_DS_OFFICES
    }
  }

  setDSOffices(offices: DSOffice[]): void {
    localStorage.setItem(STORE_KEYS.DS_OFFICES, JSON.stringify(offices))
  }

  addDSOffice(office: DSOffice): void {
    const offices = this.getDSOffices()
    offices.unshift(office)
    this.setDSOffices(offices)
  }

  updateDSOffice(id: string, updates: Partial<DSOffice>): DSOffice | null {
    const offices = this.getDSOffices()
    const idx = offices.findIndex((o) => o.id === id)
    if (idx === -1) return null
    offices[idx] = { ...offices[idx], ...updates, lastUpdated: new Date().toISOString() }
    this.setDSOffices(offices)
    return offices[idx]
  }

  deleteDSOffice(id: string): void {
    const offices = this.getDSOffices().filter((o) => o.id !== id)
    this.setDSOffices(offices)
  }

  getMaintenance(): MaintenanceRequest[] {
    const raw = localStorage.getItem(STORE_KEYS.MAINTENANCE)
    if (!raw) {
      this.setMaintenance(INITIAL_MAINTENANCES)
      return INITIAL_MAINTENANCES
    }
    try {
      return JSON.parse(raw)
    } catch {
      return INITIAL_MAINTENANCES
    }
  }

  setMaintenance(records: MaintenanceRequest[]): void {
    localStorage.setItem(STORE_KEYS.MAINTENANCE, JSON.stringify(records))
  }

  addMaintenance(record: MaintenanceRequest): void {
    const records = this.getMaintenance()
    records.unshift(record)
    this.setMaintenance(records)
  }

  updateMaintenance(id: string, updates: Partial<MaintenanceRequest>): MaintenanceRequest | null {
    const records = this.getMaintenance()
    const idx = records.findIndex((r) => r.id === id)
    if (idx === -1) return null
    records[idx] = { ...records[idx], ...updates, updatedAt: new Date().toISOString() }
    this.setMaintenance(records)
    return records[idx]
  }
}

export const mockStore = new MockStore()
