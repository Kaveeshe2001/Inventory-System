import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  Send,
  AlertTriangle,
  Wrench,
  Eye,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calculator,
  Building2,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import type { ItemRequest } from '../../models/request'
import { INITIAL_DS_OFFICES, INITIAL_REQUESTS } from '../../utils/mockData'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { StatCard } from '../../components/shared/StatCard'
import { formatNumber, getDSOfficeStatusBadge, getRequestStatusBadge } from '../../utils/format'
import { Badge } from '../../components/ui/Badge/Badge'
import { RequestReviewModal } from '../../components/shared/RequestReviewModal'


export const ItOfficerDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { success, error } = useToast()

  const [requests, setRequests] = useState<ItemRequest[]>(INITIAL_REQUESTS)
  const [selectedRequest, setSelectedRequest] = useState<ItemRequest | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  // Quick review action handler
  const handleOpenReview = (req: ItemRequest) => {
    setSelectedRequest(req)
    setIsReviewOpen(true)
  }

  const handleApprove = (req: ItemRequest) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === req.id
          ? {
              ...r,
              status: 'APPROVED',
              approvedBy: 'K. Bandara',
              approvedAt: new Date().toISOString(),
            }
          : r
      )
    )
    success(`Request #${req.requestNumber} for ${req.dsOfficeName} approved successfully. Ready for Store Keeper assignment.`)
  }

  const handleReject = (req: ItemRequest, reason: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === req.id
          ? {
              ...r,
              status: 'REJECTED',
              rejectionReason: reason,
            }
          : r
      )
    )
    error(`Request #${req.requestNumber} rejected: ${reason}`)
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              IT Officer Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#1E40AF] border border-blue-200">
              Central IT Administration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Overseeing statutory IT device quotas across Divisional Secretariats (Allocation rule: 1 device per 1,500 active pension files).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <PrimaryButton
            variant="outline"
            size="sm"
            onClick={() => navigate('/it-officer/pension-points')}
            leftIcon={<Calculator className="w-4 h-4 text-[#1E40AF]" />}
          >
            Pension Points Registry
          </PrimaryButton>
          <PrimaryButton
            variant="primary"
            size="sm"
            onClick={() => navigate('/it-officer/assignments')}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Assign Devices
          </PrimaryButton>
        </div>
      </div>

      {/* Row 1: 4 KPI Stat Cards */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Requests"
          value="12"
          change="+3 new today"
          trend="up"
          subtitle="Awaiting ratio review"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-amber-50 text-[#F59E0B]"
        />

      </div> */}
    </div>
  )
}
