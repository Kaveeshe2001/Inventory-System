import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Calculator,
  Send,
  AlertTriangle,
  Laptop,
  ArrowLeft,
  Info,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import type { InventoryItem } from '../../models/inventory'
import { inventoryService } from '../../services/InventoryService'
import { pensionService } from '../../services/PensionService'
import { assignmentService } from '../../services/AssignmentService'
import { requestService } from '../../services/RequestService'
import { Input } from '../../components/ui/Input/Input'
import { formatNumber } from '../../utils/format'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'

export const DeviceRequestFormPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error } = useToast()

  const [items, setItems] = useState<InventoryItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState('')
  const [dsOfficeName, setDsOfficeName] = useState(user?.department || 'Pension point not assigned')
  const [pensionFiles, setPensionFiles] = useState(0)
  const [alreadyAssigned, setAlreadyAssigned] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedItem = items.find((item) => item.id === selectedItemId)
  const eligibleDevices = Math.floor(pensionFiles / 1500)
  const availableToRequest = Math.max(0, eligibleDevices - alreadyAssigned)

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [inventory, office, assignments] = await Promise.all([
          inventoryService.getItems(),
          user?.pensionPointId ? pensionService.getById(user.pensionPointId) : Promise.resolve(null),
          user?.pensionPointId ? assignmentService.getByPensionPoint(user.pensionPointId) : Promise.resolve([]),
        ])
        setItems(inventory.filter((item) => item.status === 'IN_STOCK'))
        setSelectedItemId(inventory.find((item) => item.status === 'IN_STOCK')?.id || '')
        if (office) {
          setDsOfficeName(office.name)
          setPensionFiles(office.pensionFiles)
        }
        setAlreadyAssigned(assignments.filter((assignment) => assignment.status === 'ASSIGNED').length)
      } catch (loadError) {
        error(loadError instanceof Error ? loadError.message : 'Failed to load request data.')
      } finally {
        setIsLoading(false)
      }
    }
    void loadFormData()
  }, [error, user?.pensionPointId])

  const isExceeding = quantity > availableToRequest

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      error('Official justification / reason is mandatory.')
      return
    }
    if (quantity < 1) {
      error('Quantity must be at least 1 device.')
      return
    }
    if (!selectedItem || !user?.pensionPointId) {
      error('A backend inventory item and pension point must be assigned before requesting a device.')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await requestService.createRequest({
        itemId: selectedItem.id,
        quantity,
        reason: reason.trim(),
        dsOfficeId: String(user.pensionPointId),
      }, user)
      success(`Request ${created.requestNumber} submitted successfully.`)
      navigate('/ds-office/dashboard')
    } catch (submitError) {
      error(submitError instanceof Error ? submitError.message : 'Failed to submit device request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="py-4 space-y-6">
      {/* Back button & Title */}
      <div className="max-w-[720px] mx-auto flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to DS Dashboard</span>
        </button>

        <span className="text-[11px] font-bold text-[#1E40AF] bg-blue-50 px-2.5 py-1 rounded-[6px] border border-blue-200">
          Statutory Ratio Verification Active
        </span>
      </div>

      {/* Centered Form Card (max-width: 720px) */}
      <div className="max-w-[720px] mx-auto rounded-[8px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#E2E8F0] bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[8px] bg-[#1E40AF] text-white flex items-center justify-center shadow-xs">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                New IT Device Requisition
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit request for hardware allocation to your Divisional Secretariat.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. DS Office Field (auto-filled, disabled) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              DS Office (Auto-Filled)
            </label>
            <div className="relative">
              <input
                type="text"
                disabled
                value={dsOfficeName}
                className="w-full rounded-[6px] border border-[#E2E8F0] bg-slate-100/80 px-3.5 py-2.5 text-xs font-bold text-slate-700 cursor-not-allowed pl-10"
              />
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-slate-400">
              Locked to your authenticated Divisional Secretariat division.
            </p>
          </div>

          {/* 2. Select Item (Searchable dropdown with thumbnail) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Select Item / Hardware Model <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full rounded-[6px] border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.category}) — In Stock: {item.quantity} units
                  </option>
                ))}
              </select>

              {/* Selected Item Thumbnail & Specs Banner */}
              {selectedItem && (
                <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-12 h-12 object-cover rounded-[6px] border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{selectedItem.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Category: {selectedItem.category} • Depot Stock: {selectedItem.quantity} units available
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-[#1E40AF] bg-blue-50 px-2 py-1 rounded shrink-0">
                    {selectedItem.itemCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Quantity (number, with helper text) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Quantity <span className="text-red-500">*</span>
            </label>
            <div className="w-48">
              <Input
                type="number"
                min={1}
                max={Math.max(1, Math.min(1, availableToRequest))}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(1, parseInt(e.target.value) || 1)))}
                helperText="Must not exceed your remaining eligibility quota."
                required
              />
            </div>
          </div>

          {/* 4. Reason (textarea, 4 rows, required) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Justification / Reason for Request <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the specific public pension disbursement counter, monthly file intake volume, or field verification requirement..."
              className="w-full rounded-[6px] border border-[#E2E8F0] bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF] leading-relaxed"
            />
            <p className="text-[11px] text-slate-400">
              Required by Government Audit Circular No. 2024/04.
            </p>
          </div>

          {/* Below form: Info Panel showing eligibility math */}
          <div className="rounded-[8px] border-2 border-dashed border-blue-200 bg-blue-50/60 p-4 space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200/80 font-sans">
              <span className="text-xs font-bold text-[#1E40AF] flex items-center gap-1.5 uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-[#1E40AF]" />
                <span>Eligibility Math Panel</span>
              </span>
              <span className="text-[11px] bg-white text-[#1E40AF] font-bold px-2 py-0.5 rounded border border-blue-200">
                1 : 1,500 Rule
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-800">
              <div className="flex justify-between py-0.5">
                <span>Your Pension Files:</span>
                <span className="font-bold text-slate-900">{formatNumber(pensionFiles)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Eligible Devices:</span>
                <span className="font-bold text-[#1E40AF]">{eligibleDevices}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Already Assigned:</span>
                <span className="font-bold text-slate-900">{alreadyAssigned}</span>
              </div>
              <div className="flex justify-between py-0.5 font-bold pt-1 border-t border-blue-200">
                <span className="text-[#16A34A]">Available to Request:</span>
                <span className="text-base text-[#16A34A]">{availableToRequest}</span>
              </div>
            </div>

            <div className="pt-1 text-[11px] text-slate-600 font-sans flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#1E40AF] shrink-0" />
              <span>Rule: 1 device per 1,500 pension files (Sec. 4.2 Departmental Regulations).</span>
            </div>
          </div>

          {/* Dynamic Warning if exceeding ratio */}
          {isExceeding && (
            <div className="p-3.5 rounded-[6px] bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">Request Exceeds Normal Quota Balance</p>
                <p className="mt-0.5">
                  You are requesting {quantity} device(s), but only {availableToRequest} unit is available under the 1:1,500 formula. This will require special IT Officer ministerial approval.
                </p>
              </div>
            </div>
          )}

          {/* Sticky footer: [Cancel] [Submit Request] buttons */}
          <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <PrimaryButton
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/ds-office/dashboard')}
            >
              Cancel
            </PrimaryButton>
            <PrimaryButton
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting || isLoading}
              disabled={isLoading || !selectedItem || !user?.pensionPointId || availableToRequest < 1}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit Request
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}
