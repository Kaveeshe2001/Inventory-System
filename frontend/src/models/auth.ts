import type { User, UserRole } from "./user"

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  user: User
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface DecodedToken {
  sub: string
  role: UserRole
  exp: number
  iat: number
}
