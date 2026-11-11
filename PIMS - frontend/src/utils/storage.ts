const TOKEN_KEY = 'invent_access_token'
const REFRESH_TOKEN_KEY = 'invent_refresh_token'
const USER_KEY = 'invent_user_data'

export const storage = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY)
  },
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token)
  },
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY)
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },
  removeRefreshToken: (): void => {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  getUser: <T>(): T | null => {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },
  setUser: <T>(user: T): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  removeUser: (): void => {
    localStorage.removeItem(USER_KEY)
  },

  clearAuth: (): void => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
