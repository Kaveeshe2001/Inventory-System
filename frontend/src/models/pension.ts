export type DSOfficeStatus = 'COMPLIANT' | 'NEEDS_ALLOCATION' | 'QUOTA_REACHED' | 'OVER_ALLOCATED'

export interface DSOffice {
  id: string
  code: string
  name: string
  province: string
  district: string
  officerName: string
  officerEmail: string
  pensionFiles: number
  assignedDevices: number
  eligibleDevices: number
  remainingEligibility: number
  status: DSOfficeStatus
  lastUpdated: string
}

/**
 * Government Pension Department allocation formula:
 * 1 device per 1,500 active pension files.
 */
export const PENSION_FILES_PER_DEVICE = 1500

export function calculateEligibleDevices(pensionFiles: number): number {
  return Math.floor(Math.max(0, pensionFiles) / PENSION_FILES_PER_DEVICE)
}

export function calculateRemainingEligibility(pensionFiles: number, assigned: number): number {
  const eligible = calculateEligibleDevices(pensionFiles)
  return Math.max(0, eligible - assigned)
}

export function getDSOfficeStatus(pensionFiles: number, assigned: number): DSOfficeStatus {
  const eligible = calculateEligibleDevices(pensionFiles)
  if (assigned > eligible) return 'OVER_ALLOCATED'
  if (assigned === eligible) return 'QUOTA_REACHED'
  if (eligible - assigned >= 2) return 'NEEDS_ALLOCATION'
  return 'COMPLIANT'
}
