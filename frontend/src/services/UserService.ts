
import type { CreateUserDto, UpdateUserDto, User, UserStatus } from '../models/user'
import type { AuditLog } from '../utils/mockData'
import { ApiError, apiClient } from './ApiClient'
import { mapBackendRoles } from './AuthService'

interface BackendUserResponse {
  id: number
  username: string
  fullName?: string
  email?: string
  phone?: string
  department?: string
  pensionPointId?: number | null
  roles?: string | string[]
  status?: string
  createdAt?: string
}

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<BackendUserResponse[]>('/auth/users')
    return response.map((u) => {
      const rawRoles = Array.isArray(u.roles) ? u.roles : typeof u.roles === 'string' ? u.roles.split(',') : []
      const role = mapBackendRoles(rawRoles)
      return {
        id: String(u.id),
        username: u.username,
        fullName: u.fullName || u.username,
        email: u.email || `${u.username}@pensions.gov.lk`,
        phone: u.phone || '',
        department: u.department || (u.pensionPointId ? `DS Office #${u.pensionPointId}` : 'Central IT Directorate'),
        pensionPointId: u.pensionPointId ?? null,
        role,
        status: (u.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE') as UserStatus,
        createdAt: u.createdAt || new Date().toISOString(),
      }
    })
  },

  async registerUser(dto: CreateUserDto, creatorUsername?: string): Promise<User> {
    const backendRoles =
      dto.role === 'IT_OFFICER'
        ? ['ADMIN']
        : dto.role === 'STORE_KEEPER'
        ? ['HO_OFFICER']
        : ['PENSION_POINT_OFFICER']

    const response = await apiClient.post<BackendUserResponse>('/auth/register', {
      username: dto.username.trim(),
      fullName: dto.fullName.trim(),
      email: dto.email.trim(),
      phone: dto.phone.trim(),
      password: dto.password,
      department: dto.department.trim(),
      pensionPointId: dto.pensionPointId ?? null,
      roles: backendRoles,
    })
    return {
      id: String(response.id),
      username: response.username,
      fullName: response.fullName || response.username,
      email: response.email || dto.email,
      phone: response.phone,
      department: response.department || dto.department,
      pensionPointId: response.pensionPointId,
      role: dto.role,
      status: response.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      createdAt: response.createdAt || new Date().toISOString(),
      createdBy: creatorUsername,
    }
  },

  async updateUser(id: string, _dto: UpdateUserDto): Promise<User> {
    throw new ApiError(`The backend does not currently provide an update endpoint for user ${id}.`, 501)
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    throw new ApiError(`The backend does not currently provide a status endpoint for user ${id} (${status}).`, 501)
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    throw new ApiError('The backend does not currently provide an audit-log endpoint.', 501)
  },
}
