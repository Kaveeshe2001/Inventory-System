import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Send,
  Truck,
  Hash,
  User,
  ShieldCheck,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { INITIAL_ITEMS, INITIAL_REQUESTS } from '../../utils/mockData'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { Badge } from '../../components/ui/Badge/Badge'

export const AssignmentScreenPage: React.FC = () => {
  const navigate = useNavigate()
  const { success, error } = useToast()

  // Filter approved or assigned requests
  const approvedRequests = INITIAL_REQUESTS.filter(
    (r) => r.status === 'APPROVED' || r.status === 'PENDING'
  )

  const [selectedRequestId, setSelectedRequestId] = useState(
    approvedRequests[0]?.id || ''
  )

  const currentRequest =
    approvedRequests.find((r) => r.id === selectedRequestId) || approvedRequests[0]

  // Available serial numbers for this item
  const matchedItem = INITIAL_ITEMS.find((i) => i.id === currentRequest?.itemId) || INITIAL_ITEMS[0]
  const availableSerials = matchedItem?.serialNumbers || ['SN-001', 'SN-002', 'SN-003']

  const [selectedSerials, setSelectedSerials] = useState<string[]>([availableSerials[0] || ''])
  const [storeKeeper, setStoreKeeper] = useState('Sunil Perera (Central Equipment Depot)')
  const [deliveryNotes, setDeliveryNotes] = useState(
    'Dispatched via Government Courier Service to Central Province Secretariat with counter seal'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleSerial = (serial: string) => {
    if (selectedSerials.includes(serial)) {
      setSelectedSerials(selectedSerials.filter((s) => s !== serial))
    } else {
      if (selectedSerials.length >= (currentRequest?.quantity || 1)) {
        // replace first
        setSelectedSerials([...selectedSerials.slice(1), serial])
      } else {
        setSelectedSerials([...selectedSerials, serial])
      }
    }
  }

  const handleSendToStoreKeeper = () => {
    if (selectedSerials.length === 0) {
      error('Please select at least one physical device serial number.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      success(
        `Assignment for ${currentRequest.dsOfficeName} (#${currentRequest.requestNumber}) sent to Store Keeper ${storeKeeper}!`
      )
      navigate('/store/deliveries')
    }, 600)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Assign Approved Requests
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#1E40AF] border border-blue-200">
              Hardware Depot Dispatch
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Allocate physical warehouse serial numbers to verified requests and assign to Store Keeper for delivery.
          </p>
        </div>

        <PrimaryButton
          variant="outline"
          size="sm"
          onClick={() => navigate('/store/deliveries')}
          leftIcon={<Truck className="w-4 h-4 text-teal-600" />}
        >
          View Depot Deliveries
        </PrimaryButton>
      </div>

      {/* 2-Column Split: Left = Selectable Requests, Right = Assignment Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Selectable Approved Requests (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Approved Requisitions ({approvedRequests.length})
            </h2>
            <span className="text-[11px] text-slate-400">Click card to assign</span>
          </div>

          <div className="space-y-2.5">
            {approvedRequests.map((req) => {
              const isSelected = req.id === selectedRequestId
              return (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedRequestId(req.id)
                    setSelectedSerials([availableSerials[0] || ''])
                  }}
                  className={`p-4 rounded-[8px] border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1E40AF] bg-blue-50/40 shadow-sm ring-1 ring-[#1E40AF]/20'
                      : 'border-[#E2E8F0] bg-white hover:bg-slate-50/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{req.dsOfficeName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{req.requestNumber}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{req.itemName}</p>
                    </div>

                    <Badge variant={isSelected ? 'primary' : 'neutral'} size="sm">
                      {req.quantity} {req.unit}
                    </Badge>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {req.requestedBy}
                    </span>
                    <span className="font-semibold text-[#1E40AF]">
                      Quota: {req.availableQuota} avail.
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Assignment Details Panel (7 cols) */}
        {currentRequest && (
          <div className="lg:col-span-7 rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Assignment Dossier: #{currentRequest.requestNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allocate items from central stock and generate store dispatch manifest.
                </p>
              </div>
              <Badge variant="success" size="sm">
                Approved for Allocation
              </Badge>
            </div>

            {/* Request Summary Strip */}
            <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Destination:</span>
                <span className="font-bold text-slate-900">{currentRequest.dsOfficeName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Requested Item:</span>
                <span className="font-bold text-slate-900">{currentRequest.itemName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Quantity Required:</span>
                <span className="font-bold text-[#1E40AF] text-sm">{currentRequest.quantity} Unit(s)</span>
              </div>
            </div>

            {/* 1. Select Device Serial Numbers */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Select Physical Serial Number(s) <span className="text-red-500">*</span></span>
                <span className="text-slate-400 font-normal normal-case">
                  Selected: {selectedSerials.length} of {currentRequest.quantity} required
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableSerials.map((serial) => {
                  const isChecked = selectedSerials.includes(serial)
                  return (
                    <div
                      key={serial}
                      onClick={() => toggleSerial(serial)}
                      className={`p-3 rounded-[6px] border flex items-center justify-between cursor-pointer transition ${
                        isChecked
                          ? 'border-[#1E40AF] bg-blue-50/70 text-[#1E40AF] font-bold'
                          : 'border-[#E2E8F0] bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-xs">{serial}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-[#1E40AF] focus:ring-[#1E40AF]"
                      />
                    </div>
                  )
                })}
              </div>
              <p className="text-[11px] text-slate-400">
                Central Warehouse serial tags verified against barcode inventory.
              </p>
            </div>

            {/* 2. Assign to Store Keeper */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Assign to Store Keeper (Fulfillment Officer) <span className="text-red-500">*</span>
              </label>
              <select
                value={storeKeeper}
                onChange={(e) => setStoreKeeper(e.target.value)}
                className="w-full rounded-[6px] border border-[#E2E8F0] bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
              >
                <option value="Sunil Perera (Central Equipment Depot)">
                  Sunil Perera — Central Equipment Depot & Stores
                </option>
                <option value="K. Gamage (Regional Hub Colombo)">
                  K. Gamage — Regional Transit Hub Colombo
                </option>
                <option value="P. Jayasuriya (Logistics Dispatch)">
                  P. Jayasuriya — Government Courier Dispatch Lead
                </option>
              </select>
            </div>

            {/* 3. Delivery Notes / Instructions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Delivery Notes & Waybill Instructions
              </label>
              <textarea
                rows={3}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Specify special handling, required signatures, or courier tracking code..."
                className="w-full rounded-[6px] border border-[#E2E8F0] bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 leading-relaxed"
              />
            </div>

            {/* Bottom Button: "Send to Store Keeper" */}
            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Ready for physical handover manifest</span>
              </span>

              <PrimaryButton
                type="button"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                onClick={handleSendToStoreKeeper}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Send to Store Keeper
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
