export type UserRole =
  | 'IT_OFFICER'
  | 'STORE_KEEPER'
  | 'DS_OFFICER'
  | 'INVENTORY_MANAGER'
  | 'STAFF'

export type UserStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'

export interface User {
  id: string
  username: string
  fullName: string
  email: string
  phone?: string
  department: string
  pensionPointId?: number | null
  role: UserRole
  status: UserStatus
  createdAt: string
  lastLogin?: string
  createdBy?: string
}

export interface CreateUserDto {
  username: string
  fullName: string
  email: string
  phone: string
  password: string
  department: string
  pensionPointId?: number | null
  role: UserRole
}

export interface UpdateUserDto {
  fullName?: string
  email?: string
  phone?: string
  department?: string
  pensionPointId?: number | null
  role?: UserRole
  status?: UserStatus
}