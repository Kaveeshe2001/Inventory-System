import type { ItemStatus } from "../models/inventory"
import type { MaintenanceStatus } from "../models/maintenance"
import type { DSOfficeStatus } from "../models/pension"
import type { RequestStatus } from "../models/request"
import type { UserStatus } from "../models/user"


export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A'
  try {
    const d = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d)
  } catch {
    return dateString
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return 'N/A'
  try {
    const d = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return dateString
  }
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(val)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getItemStatusBadge(status: ItemStatus) {
  switch (status) {
    case 'IN_STOCK':
      return { label: 'In Stock', variant: 'success' as const }
    case 'LOW_STOCK':
      return { label: 'Low Stock', variant: 'warning' as const }
    case 'OUT_OF_STOCK':
      return { label: 'Out of Stock', variant: 'danger' as const }
    case 'DISCONTINUED':
      return { label: 'Discontinued', variant: 'neutral' as const }
    default:
      return { label: status, variant: 'neutral' as const }
  }
}

export function getRequestStatusBadge(status: RequestStatus) {
  switch (status) {
    case 'PENDING':
      return { label: 'Pending', variant: 'warning' as const, bg: 'bg-amber-50 text-amber-700 border-amber-200' }
    case 'APPROVED':
      return { label: 'Approved', variant: 'info' as const, bg: 'bg-blue-50 text-blue-700 border-blue-200' }
    case 'ASSIGNED':
      return { label: 'Assigned', variant: 'purple' as const, bg: 'bg-purple-50 text-purple-700 border-purple-200' }
    case 'DELIVERED':
      return { label: 'Delivered', variant: 'success' as const, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'REJECTED':
      return { label: 'Rejected', variant: 'danger' as const, bg: 'bg-red-50 text-red-700 border-red-200' }
    default:
      return { label: status, variant: 'neutral' as const, bg: 'bg-slate-50 text-slate-700 border-slate-200' }
  }
}

export function getMaintenanceStatusBadge(status: MaintenanceStatus) {
  switch (status) {
    case 'PENDING':
      return { label: 'Pending Triage', variant: 'warning' as const, bg: 'bg-amber-50 text-amber-700 border-amber-200' }
    case 'SCHEDULED':
      return { label: 'Scheduled', variant: 'purple' as const, bg: 'bg-purple-50 text-purple-700 border-purple-200' }
    case 'IN_REPAIR':
      return { label: 'In Repair', variant: 'info' as const, bg: 'bg-blue-50 text-blue-700 border-blue-200' }
    case 'RESOLVED':
      return { label: 'Resolved', variant: 'success' as const, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'REJECTED':
      return { label: 'Rejected', variant: 'danger' as const, bg: 'bg-red-50 text-red-700 border-red-200' }
    default:
      return { label: status, variant: 'neutral' as const, bg: 'bg-slate-50 text-slate-700 border-slate-200' }
  }
}

export function getDSOfficeStatusBadge(status: DSOfficeStatus) {
  switch (status) {
    case 'COMPLIANT':
      return { label: 'Compliant', variant: 'success' as const, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'NEEDS_ALLOCATION':
      return { label: 'Eligible for Allocation', variant: 'info' as const, bg: 'bg-blue-50 text-blue-700 border-blue-200' }
    case 'QUOTA_REACHED':
      return { label: 'Quota Reached', variant: 'neutral' as const, bg: 'bg-slate-100 text-slate-700 border-slate-200' }
    case 'OVER_ALLOCATED':
      return { label: 'Over-Allocated', variant: 'danger' as const, bg: 'bg-rose-50 text-rose-700 border-rose-200' }
    default:
      return { label: status, variant: 'neutral' as const, bg: 'bg-slate-50 text-slate-700 border-slate-200' }
  }
}

export function getUserStatusBadge(status: UserStatus) {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Active', variant: 'success' as const }
    case 'INACTIVE':
      return { label: 'Inactive', variant: 'neutral' as const }
    case 'SUSPENDED':
      return { label: 'Suspended', variant: 'danger' as const }
    default:
      return { label: status, variant: 'neutral' as const }
  }
}
