import React, { useEffect, useState } from 'react'
import {
  Building2,
  Eye,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import type { ItemRequest } from '../../models/request'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../../components/ui/Table/Table'
import { formatDate, formatNumber, getRequestStatusBadge } from '../../utils/format'
import { Badge } from '../../components/ui/Badge/Badge'
import { RequestReviewModal } from '../../components/shared/RequestReviewModal'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { requestService } from '../../services/RequestService'

export const RequestsApprovalPage: React.FC = () => {
  const { success, error } = useToast()
  const { user } = useAuth()
  const [requests, setRequests] = useState<ItemRequest[]>([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedRequest, setSelectedRequest] = useState<ItemRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    requestService.getAllRequests()
      .then(setRequests)
      .catch((loadError: unknown) => error(loadError instanceof Error ? loadError.message : 'Failed to load requests.'))
  }, [error])

  const handleOpenReview = (req: ItemRequest) => {
    setSelectedRequest(req)
    setIsModalOpen(true)
  }

  const handleApprove = async (req: ItemRequest) => {
    try {
      const updated = await requestService.updateRequestStatus(req.id, 'APPROVED', user?.id)
      setRequests((previous) => previous.map((request) => request.id === updated.id ? updated : request))
      success(`Requisition #${req.requestNumber} approved successfully.`)
    } catch (actionError) {
      error(actionError instanceof Error ? actionError.message : 'Failed to approve request.')
    }
  }

  const handleReject = async (req: ItemRequest, reason: string) => {
    try {
      const updated = await requestService.updateRequestStatus(req.id, 'REJECTED', user?.id, reason)
      setRequests((previous) => previous.map((request) => request.id === updated.id ? updated : request))
      success(`Requisition #${req.requestNumber} rejected.`)
    } catch (actionError) {
      error(actionError instanceof Error ? actionError.message : 'Failed to reject request.')
    }
  }

  const filtered = requests.filter(
    (r) => statusFilter === 'ALL' || r.status === statusFilter
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Requisition Approvals & Ratio Audit
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#1E40AF] border border-blue-200">
              IT Officer Review Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Validate hardware requisitions submitted by Divisional Secretariats against the statutory 1:1,500 active pension file standard.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 rounded-[6px] border border-[#E2E8F0] bg-white text-xs font-semibold text-slate-800"
          >
            <option value="ALL">All Requisitions ({requests.length})</option>
            <option value="PENDING">Pending Review ({requests.filter((r) => r.status === 'PENDING').length})</option>
            <option value="APPROVED">Approved ({requests.filter((r) => r.status === 'APPROVED').length})</option>
            <option value="ASSIGNED">Assigned ({requests.filter((r) => r.status === 'ASSIGNED').length})</option>
            <option value="DELIVERED">Delivered ({requests.filter((r) => r.status === 'DELIVERED').length})</option>
            <option value="REJECTED">Rejected ({requests.filter((r) => r.status === 'REJECTED').length})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Requisition ID</TableHead>
              <TableHead>DS Office</TableHead>
              <TableHead>Item Requested</TableHead>
              <TableHead>Pension Files</TableHead>
              <TableHead>Quota Entitlement</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filtered.map((req) => {
              const badge = getRequestStatusBadge(req.status)

              return (
                <TableRow key={req.id}>
                  <TableCell className="font-mono font-bold text-slate-900">
                    #{req.requestNumber}
                    <span className="text-[11px] text-slate-400 block font-sans font-normal">
                      {formatDate(req.createdAt)}
                    </span>
                  </TableCell>

                  <TableCell className="font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-[#1E40AF]" />
                      <span>{req.dsOfficeName}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal pl-5">
                      By {req.requestedBy}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="font-bold text-slate-800">{req.itemName}</span>
                    <span className="text-xs text-slate-500 block">
                      Qty: <strong>{req.quantity}</strong> {req.unit}
                    </span>
                  </TableCell>

                  <TableCell className="font-medium text-slate-800">
                    {formatNumber(req.pensionFiles)} files
                  </TableCell>

                  <TableCell>
                    <div className="text-xs">
                      <span className="font-bold text-[#1E40AF]">
                        {req.eligibleDevices} Entitled
                      </span>{' '}
                      <span className="text-slate-500">
                        ({req.assignedDevices} in use, {req.availableQuota} rem.)
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={badge.variant} size="sm">
                      {badge.label}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <PrimaryButton
                      variant={req.status === 'PENDING' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleOpenReview(req)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      {req.status === 'PENDING' ? 'Review & Decide' : 'View Dossier'}
                    </PrimaryButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Screen 5 Modal Integration */}
      <RequestReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
