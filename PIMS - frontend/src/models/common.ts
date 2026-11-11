export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface StatMetric {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  iconName: string
  badgeText?: string
}
