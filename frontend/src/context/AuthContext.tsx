import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User } from '../models/user'
import type { LoginRequest } from '../models/auth'
import { storage } from '../utils/storage'
import { authService, decodeJwtPayload, type LoginStepResult } from '../services/AuthService'

interface LoginOutcome {
  requiresOtp: boolean
  user?: User
  username?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<LoginOutcome>
  verifyOtp: (username: string, otp: string) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Initialize auth state from storage on mount and validate expiration
  useEffect(() => {
    const savedToken = storage.getToken()
    const savedUser = storage.getUser<User>()

    if (savedToken && savedUser) {
      const payload = decodeJwtPayload(savedToken)
      if (payload?.exp && payload.exp * 1000 < Date.now()) {
        storage.clearAuth()
        setToken(null)
        setUser(null)
      } else {
        setToken(savedToken)
        setUser(savedUser)
      }
    }
    setIsLoading(false)

    const handleUnauthorized = () => {
      setUser(null)
      setToken(null)
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const login = useCallback(async (credentials: LoginRequest): Promise<LoginOutcome> => {
    setIsLoading(true)
    try {
      const stepResult: LoginStepResult = await authService.login(credentials)
      if (stepResult.requiresOtp) {
        return {
          requiresOtp: true,
          username: stepResult.username,
        }
      }
      if (stepResult.response) {
        setUser(stepResult.response.user)
        setToken(stepResult.response.accessToken)
        return {
          requiresOtp: false,
          user: stepResult.response.user,
        }
      }
      throw new Error('Authentication failed.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyOtp = useCallback(async (username: string, otp: string): Promise<User> => {
    setIsLoading(true)
    try {
      const response = await authService.verifyOtp(username, otp)
      setUser(response.user)
      setToken(response.accessToken)
      return response.user
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      await authService.logout()
    } finally {
      setUser(null)
      setToken(null)
      setIsLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
