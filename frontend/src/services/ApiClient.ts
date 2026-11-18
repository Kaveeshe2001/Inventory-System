import { storage } from "../utils/storage"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

export class ApiError extends Error {
  public readonly status: number
  public readonly details?: unknown

  constructor(
    message: string,
    status: number,
    details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
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
    const method = rest.method || 'GET'

    const isPublicAuth = /^\/auth\/(login|register|verify-otp)(\?|$)/.test(endpoint)

    const token = isPublicAuth ? null : storage.getToken()
    const requestHeaders = new Headers(headers)
    requestHeaders.set('Accept', 'application/json, text/plain, */*')
    if (rest.body !== undefined) requestHeaders.set('Content-Type', 'application/json')
    if (token) requestHeaders.set('Authorization', `Bearer ${token}`)

    try {
      const response = await fetch(url, {
        ...rest,
        method,
        headers: requestHeaders,
      })
      const responseText = await response.text()
      let responseBody: unknown = undefined
      if (responseText) {
        try {
          responseBody = JSON.parse(responseText)
        } catch {
          responseBody = responseText
        }
      }

      if (!response.ok) {
        const errorBody = responseBody && typeof responseBody === 'object'
          ? responseBody as Record<string, unknown>
          : undefined
        const validationErrors = errorBody?.validationErrors
        const validationMessage = validationErrors && typeof validationErrors === 'object'
          ? Object.values(validationErrors).filter((value) => typeof value === 'string').join(', ')
          : ''
        const errorMessage = validationMessage || (typeof errorBody?.message === 'string'
          ? errorBody.message
          : typeof errorBody?.error === 'string'
            ? errorBody.error
            : typeof responseBody === 'string' && responseBody
              ? responseBody
              : `HTTP Error ${response.status}: ${response.statusText}`)

        const isAuthEndpoint =
          /^\/auth\/(login|verify-otp|register)(\?|$)/.test(endpoint)

        if (response.status === 401 && !isAuthEndpoint) {
          storage.clearAuth()
          window.dispatchEvent(new CustomEvent('auth:unauthorized'))
          throw new ApiError('Unauthorized session. Please log in again.', response.status, responseBody)
        }

        throw new ApiError(errorMessage, response.status, responseBody)
      }

      return responseBody as T
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error
      if (error instanceof TypeError) {
        throw new ApiError(`Unable to connect to the API at ${this.baseUrl}. Check that the backend is running.`, 0)
      }
      throw new ApiError(error instanceof Error ? error.message : 'Unexpected API request failure.', 0)
    }
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  post<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      params,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  }

  put<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      params,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  }

  delete<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', params })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
