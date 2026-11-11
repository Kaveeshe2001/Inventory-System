import type { UserRole } from "../models/user";

export const ROLE_CONFIG: Record<
  UserRole,
  { label: string; path: string; description: string; badgeColor: string; chipBg: string }
> = {
  IT_OFFICER: {
    label: 'IT Officer',
    path: '/it-officer/dashboard',
    description: 'Central IT Administration, Pension points & Quota allocations',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    chipBg: 'bg-blue-700 text-white',
  },
  STORE_KEEPER: {
    label: 'Store Keeper',
    path: '/store/dashboard',
    description: 'Central Stores, physical deliveries, dispatches & returns',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    chipBg: 'bg-teal-700 text-white',
  },
  DS_OFFICER: {
    label: 'DS Office Officer',
    path: '/ds-office/dashboard',
    description: 'Divisional Secretariat device requisitions & fault reporting',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    chipBg: 'bg-emerald-700 text-white',
  },
  INVENTORY_MANAGER: {
    label: 'Store Keeper',
    path: '/store/dashboard',
    description: 'Central Stores, physical deliveries, dispatches & returns',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    chipBg: 'bg-teal-700 text-white',
  },
  STAFF: {
    label: 'DS Office Officer',
    path: '/ds-office/dashboard',
    description: 'Divisional Secretariat device requisitions & fault reporting',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    chipBg: 'bg-emerald-700 text-white',
  },
}

export function getDefaultDashboardPath(role?: UserRole): string {
  if (!role) return '/login'
  return ROLE_CONFIG[role]?.path || '/login'
}

export function hasRequiredRole(userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false
  if (allowedRoles.includes(userRole)) return true
  // Handle aliases
  if (userRole === 'STORE_KEEPER' && allowedRoles.includes('INVENTORY_MANAGER')) return true
  if (userRole === 'INVENTORY_MANAGER' && allowedRoles.includes('STORE_KEEPER')) return true
  if (userRole === 'DS_OFFICER' && allowedRoles.includes('STAFF')) return true
  if (userRole === 'STAFF' && allowedRoles.includes('DS_OFFICER')) return true
  return false
}
