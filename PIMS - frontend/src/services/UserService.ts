
import type { CreateUserDto, UpdateUserDto, User, UserStatus } from '../models/user'
import type { AuditLog } from '../utils/mockData'
import { apiClient } from './ApiClient'
import { mockStore } from './mockStore'

export const userService = {
  async getUsers(): Promise<User[]> {
    try {
      return await apiClient.get<User[]>('/users')
    } catch {
      return mockStore.getUsers()
    }
  },

  async registerUser(dto: CreateUserDto, creatorUsername?: string): Promise<User> {
    const backendRoles =
      dto.role === 'IT_OFFICER'
        ? ['ADMIN']
        : dto.role === 'STORE_KEEPER'
        ? ['HO_OFFICER']
        : ['PENSION_POINT_OFFICER']

    try {
      await apiClient.post<{ Success: string }>('/auth/register', {
        username: dto.username.trim(),
        phone: '0712345678',
        password: dto.password,
        pensionPointId: 1,
        roles: backendRoles,
      })
    } catch {
      // Proceed with mock store fallback
    }

    // Validate uniqueness in mock store
    const existing = mockStore.getUsers()
    if (existing.some((u) => u.username.toLowerCase() === dto.username.toLowerCase())) {
      throw new Error(`Username "${dto.username}" is already registered.`)
    }
    if (existing.some((u) => u.email.toLowerCase() === dto.email.toLowerCase())) {
      throw new Error(`Email "${dto.email}" is already registered.`)
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: dto.username.trim(),
      fullName: dto.fullName.trim(),
      email: dto.email.trim(),
      department: dto.department.trim(),
      role: dto.role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      createdBy: creatorUsername || 'it.officer',
    }

    mockStore.addUser(newUser)
    return newUser
  },

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    try {
      return await apiClient.put<User>(`/users/${id}`, dto)
    } catch {
      const updated = mockStore.updateUser(id, dto)
      if (!updated) throw new Error('User not found.')
      return updated
    }
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    try {
      return await apiClient.put<User>(`/users/${id}/status`, { status })
    } catch {
      const updated = mockStore.updateUser(id, { status })
      if (!updated) throw new Error('User not found.')
      return updated
    }
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      return await apiClient.get<AuditLog[]>('/system/audit-logs')
    } catch {
      return mockStore.getLogs()
    }
  },
}
