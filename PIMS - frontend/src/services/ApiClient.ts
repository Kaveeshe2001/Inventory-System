import { storage } from "../utils/storage"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    let fullUrl = this.baseUrl ? `${this.baseUrl.replace(/\/$/, '')}${cleanEndpoint}` : cleanEndpoint

    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString
      }
    }
    return fullUrl
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers = {}, ...rest } = options
    const url = this.buildUrl(endpoint, params)

    const token = storage.getToken()
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string>),
    }

    try {
      const response = await fetch(url, {
        ...rest,
        headers: requestHeaders,
      })

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`
        try {
          const errorBody = await response.json()
          errorMessage = errorBody.message || errorBody.error || errorMessage
        } catch {
          try {
            const errorText = await response.text()
            if (errorText) errorMessage = errorText
          } catch {
            // fallback
          }
        }

        const isAuthEndpoint =
          endpoint.includes('/auth/login') ||
          endpoint.includes('/auth/verify-otp') ||
          endpoint.includes('/auth/register')

        if (response.status === 401 && !isAuthEndpoint) {
          storage.clearAuth()
          window.dispatchEvent(new CustomEvent('auth:unauthorized'))
          throw new Error('Unauthorized session. Please log in again.')
        }

        throw new Error(errorMessage)
      }

      // Handle both JSON responses and plain text Spring Boot responses
      const responseText = await response.text()

      if (!responseText) {
        return undefined as T
      }

      try {
        return JSON.parse(responseText) as T
      } catch {
        // Backend returned plain text
        return responseText as unknown as T
      }
    } catch (error: unknown) {
      const err = error as Error
      throw err
    }
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  post<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      params,
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  put<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      params,
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  delete<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', params })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
