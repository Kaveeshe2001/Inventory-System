import React, { useState } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  Building2,
  User,
  Laptop,
  FileText,
  Calculator,
  XCircle,
} from 'lucide-react'
import type { ItemRequest } from '../../models/request'
import { Modal } from '../ui/Modal/Modal'
import { PrimaryButton } from '../ui/Button/PrimaryButton'
import { formatNumber } from '../../utils/format'

interface RequestReviewModalProps {
  isOpen: boolean
  onClose: () => void
  request: ItemRequest | null
  onApprove: (request: ItemRequest) => void
  onReject: (request: ItemRequest, reason: string) => void
}

export const RequestReviewModal: React.FC<RequestReviewModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}) => {
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [validationError, setValidationError] = useState('')

  if (!request) return null

  // Business logic check: is the requested quantity within available quota?
  const isWithinRatio = request.quantity <= request.availableQuota

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) {
      setValidationError('Please provide a mandatory reason for rejecting this requisition.')
      return
    }
    onReject(request, rejectionReason)
    setIsRejecting(false)
    setRejectionReason('')
    setValidationError('')
    onClose()
  }

  const handleConfirmApprove = () => {
    onApprove(request)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsRejecting(false)
        setValidationError('')
        onClose()
      }}
      title={`Review Device Request #${request.requestNumber}`}
      description="Validate compliance with statutory pension allocation quota before dispatch authorization."
      size="640"
      footer={
        <div className="w-full flex items-center justify-between gap-3">
          <PrimaryButton
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsRejecting(false)
              onClose()
            }}
          >
            Cancel
          </PrimaryButton>

          <div className="flex items-center gap-2">
            {request.status === 'PENDING' ? (
              !isRejecting ? (
                <>
                  <PrimaryButton
                    variant="outline"
                    size="md"
                    onClick={() => setIsRejecting(true)}
                    className="border-[#DC2626] text-[#DC2626] hover:bg-red-50 hover:border-red-600"
                  >
                    Reject Request
                  </PrimaryButton>
                  <PrimaryButton
                    variant="primary"
                    size="md"
                    onClick={handleConfirmApprove}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Approve Requisition
                  </PrimaryButton>
                </>
              ) : (
                <>
                  <PrimaryButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsRejecting(false)
                      setValidationError('')
                    }}
                  >
                    Back
                  </PrimaryButton>
                  <PrimaryButton
                    variant="danger"
                    size="md"
                    onClick={handleConfirmReject}
                    leftIcon={<XCircle className="w-4 h-4" />}
                  >
                    Confirm Rejection
                  </PrimaryButton>
                </>
              )
            ) : (
              <span className="text-xs text-slate-500 font-semibold px-3 py-1.5 bg-slate-100 rounded border border-slate-200">
                Decision Finalized: {request.status}
              </span>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* 2-Column Detail Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
          {/* Row 1 */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Requesting Office</p>
            <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5 text-sm">
              <Building2 className="w-3.5 h-3.5 text-[#1E40AF]" />
              {request.dsOfficeName}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Requested By</p>
            <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5 text-sm">
              <User className="w-3.5 h-3.5 text-[#0D9488]" />
              {request.requestedBy}
            </p>
          </div>

          {/* Row 2 */}
          <div className="pt-2 border-t border-slate-200/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Requested Item</p>
            <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-slate-600" />
              {request.itemName}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quantity</p>
            <p className="font-bold text-[#1E40AF] mt-0.5 text-sm">
              {request.quantity} {request.unit}
            </p>
          </div>

          {/* Row 3: Pension Files & Ratio */}
          <div className="pt-2 border-t border-slate-200/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Pension Files</p>
            <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5 text-sm">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              {formatNumber(request.pensionFiles)} Files
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Statutory Quota</p>
            <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5 text-sm">
              <Calculator className="w-3.5 h-3.5 text-slate-500" />
              {request.eligibleDevices} Eligible ({request.assignedDevices} Assigned)
            </p>
          </div>
        </div>

        {/* Reason Full Width Text Block */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
            Official Justification / Reason:
          </label>
          <div className="p-3 rounded-[6px] bg-white border border-[#E2E8F0] text-slate-800 text-[13px] leading-relaxed">
            {request.reason}
          </div>
        </div>

        {/* Eligibility Check Panel (Green Check or Amber Warning) */}
        {isWithinRatio ? (
          <div className="p-3.5 rounded-[8px] bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-emerald-900">
                Statutory Ratio Compliant (1 device per 1,500 files)
              </p>
              <p className="text-emerald-700 mt-0.5">
                This DS Office has {formatNumber(request.pensionFiles)} active files and is eligible for {request.eligibleDevices} devices. Current allocation: {request.assignedDevices}. Available quota remaining: {request.availableQuota}.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-[8px] bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-amber-900">
                Quota Threshold Warning
              </p>
              <p className="text-amber-700 mt-0.5">
                This request of {request.quantity} units exceeds the office's calculated quota balance of {request.availableQuota}. Approval requires IT Officer discretionary override.
              </p>
            </div>
          </div>
        )}

        {/* Expandable Rejection Reason Textarea */}
        {isRejecting && (
          <div className="pt-2 animate-in fade-in space-y-1.5">
            <label className="block text-xs font-bold text-[#DC2626] uppercase tracking-wider">
              Reason for Rejection (Required)*
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value)
                setValidationError('')
              }}
              placeholder="e.g. Exceeds statutory quota of 1 device per 1,500 pension files. Current quota fully utilized."
              className="w-full rounded-[6px] border border-[#DC2626] p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
            {validationError && (
              <p className="text-xs text-[#DC2626] font-medium">{validationError}</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
