import type { LoginRequest, LoginResponse } from '../models/auth'
import type { User, UserRole } from '../models/user'
import { storage } from '../utils/storage'
import { apiClient } from './ApiClient'
import { mockStore } from './mockStore'

export interface LoginStepResult {
  requiresOtp: boolean
  username?: string
  response?: LoginResponse
}

export function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function mapBackendRoles(roles: any): UserRole {
  if (!roles) return 'IT_OFFICER'
  const roleArray = (Array.isArray(roles) ? roles : [roles])
    .map((r) => String(r).toUpperCase().replace(/^ROLE_/, ''))

  if (roleArray.includes('ADMIN') || roleArray.includes('IT_OFFICER')) return 'IT_OFFICER'
  if (roleArray.includes('HO_OFFICER') || roleArray.includes('HO_ACCOUNTANT') || roleArray.includes('STORE_KEEPER')) return 'STORE_KEEPER'
  if (roleArray.includes('PENSION_POINT_OFFICER') || roleArray.includes('DS_OFFICER')) return 'DS_OFFICER'
  if (roleArray.includes('INVENTORY_MANAGER')) return 'INVENTORY_MANAGER'
  if (roleArray.includes('STAFF')) return 'STAFF'
  return 'IT_OFFICER'
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginStepResult> {
    try {
      const response = await apiClient.post<any>('/auth/login', credentials)

      // Spring Boot returns { message: "OTP sent successfully" } or string
      const message = typeof response === 'string' ? response : (response?.message || '')

      if (message.toLowerCase().includes('otp')) {
        return {
          requiresOtp: true,
          username: credentials.username,
        }
      }

      // If backend returned a token directly (e.g. bypass or direct token)
      const token = typeof response === 'string' && response.includes('.')
        ? response
        : (response?.token || response?.accessToken)

      if (token) {
        const payload = decodeJwtPayload(token)
        const mappedRole = mapBackendRoles(response?.roles || payload?.roles)

        const user: User = {
          id: String(response?.id || payload?.userId || payload?.sub || credentials.username),
          username: response?.username || payload?.sub || credentials.username,
          fullName: response?.fullName || payload?.fullName || payload?.sub || credentials.username,
          email: response?.email || payload?.email || `${credentials.username}@pensions.gov.lk`,
          phone: response?.phone || payload?.phone || '',
          department: response?.department || payload?.department || (
            (response?.pensionPointId || payload?.pensionPointId)
              ? `DS Office #${response?.pensionPointId || payload?.pensionPointId}`
              : 'IT Directorate'
          ),
          pensionPointId: response?.pensionPointId ?? payload?.pensionPointId ?? null,
          role: mappedRole,
          status: 'ACTIVE',
          createdAt: payload?.createdAt || new Date().toISOString(),
        }

        const loginResp: LoginResponse = {
          accessToken: token,
          refreshToken: '',
          tokenType: 'Bearer',
          user,
        }

        storage.setToken(loginResp.accessToken)
        storage.setUser(loginResp.user)
        return { requiresOtp: false, response: loginResp }
      }

      throw new Error(message || 'Unexpected response from authentication server.')
    } catch (err: any) {
      console.error('Backend login error:', err)
      throw new Error(err?.message || 'Unable to authenticate with the server.')
    }
  },

  async verifyOtp(username: string, otp: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<any>('/auth/verify-otp', {
        username: username.trim(),
        otp: otp.trim(),
      })

      // Backend returns AuthResponse: { token, id, username, phone, pensionPointId, roles }
      // or legacy plain string token
      const token = typeof response === 'string' ? response : (response?.token || '')

      if (!token) {
        throw new Error('No authentication token received from server.')
      }

      const payload = decodeJwtPayload(token)
      const rawRoles = response?.roles || payload?.roles || []
      const mappedRole = mapBackendRoles(rawRoles)

      const user: User = {
        id: String(response?.id || payload?.userId || payload?.sub || username),
        username: response?.username || payload?.sub || username,
        fullName: response?.fullName || payload?.fullName || payload?.sub || username,
        email: response?.email || payload?.email || `${username}@pensions.gov.lk`,
        phone: response?.phone || payload?.phone || '',
        department: response?.department || payload?.department || (
          (response?.pensionPointId ?? payload?.pensionPointId)
            ? `DS Office #${response?.pensionPointId ?? payload?.pensionPointId}`
            : 'IT Directorate'
        ),
        pensionPointId: response?.pensionPointId ?? payload?.pensionPointId ?? null,
        role: mappedRole,
        status: 'ACTIVE',
        createdAt: payload?.createdAt || new Date().toISOString(),
      }

      const loginResp: LoginResponse = {
        accessToken: token,
        refreshToken: `refresh-${Date.now()}`,
        tokenType: 'Bearer',
        user,
      }

      storage.setToken(loginResp.accessToken)
      storage.setUser(loginResp.user)

      mockStore.addLog({
        id: `log-${Date.now()}`,
        action: 'AUTH_2FA_VERIFIED',
        actor: user.username,
        role: user.role,
        details: `Two-factor OTP verified successfully for ${user.username}`,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
        status: 'SUCCESS',
      })

      return loginResp
    } catch (err: any) {
      throw new Error(err.message || 'Invalid or expired OTP. Please check the backend console.')
    }
  },

  async register(data: {
    username: string
    fullName: string
    email: string
    phone: string
    password: string
    department?: string
    pensionPointId?: number | null
    roles?: string[]
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<any>('/auth/register', {
        username: data.username.trim(),
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        password: data.password,
        department: data.department || 'PENSION',
        pensionPointId: data.pensionPointId || null,
        roles: data.roles || ['PENSION_POINT_OFFICER'],
      })

      const message = typeof response === 'string'
        ? response
        : (response?.message || response?.Success || 'User registered successfully')

      // Sync mockStore for frontend local pages
      try {
        const mappedRole = mapBackendRoles(data.roles || ['PENSION_POINT_OFFICER'])
        mockStore.addUser({
          id: `usr-${Date.now()}`,
          username: data.username.trim(),
          fullName: data.fullName.trim(),
          email: data.email.trim(),
          department: data.department || 'PENSION',
          role: mappedRole,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          phone: data.phone.trim(),
          pensionPointId: data.pensionPointId || null,
        })
      } catch {
        // mock store fallback is best effort
      }

      return { success: true, message }
    } catch (err: any) {
      console.error('Registration error:', err)
      throw new Error(err?.message || 'Registration failed.')
    }
  },

  async validateToken(token: string): Promise<boolean> {
    try {
      const res = await apiClient.get<any>(`/auth/validate?token=${encodeURIComponent(token)}`)
      return res?.valid === true
    } catch {
      return false
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // ignore
    } finally {
      storage.clearAuth()
    }
  },

  getCurrentUser(): User | null {
    return storage.getUser<User>()
  },
}
