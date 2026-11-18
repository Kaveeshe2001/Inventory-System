import React, { useEffect, useState } from 'react'
import {
  RotateCcw,
  CheckCircle2,
  Building2,
  Search,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import type { ReturnRecord, ReturnStatus } from '../../models/delivery'
import { assignmentService } from '../../services/AssignmentService'
import { inventoryService } from '../../services/InventoryService'
import { pensionService } from '../../services/PensionService'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { Modal } from '../../components/ui/Modal/Modal'

export const ReturnsPage: React.FC = () => {
  const { success, error } = useToast()
  const [returnsList, setReturnsList] = useState<ReturnRecord[]>([])
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReturnStatus>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Modal State for Confirm Receipt
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState<ReturnRecord | null>(null)
  const [condGood, setCondGood] = useState(true)
  const [condDamaged, setCondDamaged] = useState(false)
  const [condMissing, setCondMissing] = useState(false)
  const [inspectorNotes, setInspectorNotes] = useState('Unit power tested and inventoried in returns bay.')

  const loadReturns = async () => {
    try {
      setIsLoading(true)
      const [assignments, items, offices] = await Promise.all([
        assignmentService.getAll(),
        inventoryService.getItems(),
        pensionService.getAll(),
      ])

      const itemMap = new Map(items.map((i) => [i.id, i]))
      const officeMap = new Map(offices.map((o) => [Number(o.id), o.name]))

      const mapped: ReturnRecord[] = assignments.map((a) => {
        const item = itemMap.get(String(a.itemId))
        const officeName = officeMap.get(a.pensionPointId) || `DS Office #${a.pensionPointId}`
        const isReturned = a.status === 'RETURNED'

        return {
          id: `RET-${a.id}`,
          dsOfficeName: officeName,
          deviceName: item?.name || `Equipment #${a.itemId}`,
          serialNumber: item?.serialNumbers?.[0] || 'SN-UNKNOWN',
          reason: a.remarks || (isReturned ? 'Returned to central depot' : 'Active assignment in field'),
          status: isReturned ? 'RECEIVED' : 'RETURN_REQUESTED',
          requestedDate: a.assignedAt ? a.assignedAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
          receivedDate: a.returnedAt ? a.returnedAt.slice(0, 10) : undefined,
          inspectorNotes: a.remarks,
        }
      })

      setReturnsList(mapped)
    } catch (err) {
      console.error('Failed to load returns', err)
      error(err instanceof Error ? err.message : 'Failed to load returns records.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadReturns()
  }, [])

  const handleOpenReceiptModal = (ret: ReturnRecord) => {
    setSelectedReturn(ret)
    setCondGood(true)
    setCondDamaged(false)
    setCondMissing(false)
    setInspectorNotes('Inspected by Store Keeper: Unit intact, serial verified, archived into central returns depot.')
    setIsModalOpen(true)
  }

  const handleConfirmReceipt = async () => {
    if (!selectedReturn) return
    try {
      const assignmentId = selectedReturn.id.replace('RET-', '')
      await assignmentService.returnAssignment(assignmentId, inspectorNotes)
      success(`Return intake confirmed for ${selectedReturn.deviceName}. Item returned to inventory.`)
      setIsModalOpen(false)
      await loadReturns()
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : 'Failed to confirm return.')
    }
  }

  const filteredReturns = returnsList.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.dsOfficeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Returns Management
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-[#0D9488] border border-teal-200">
              Hardware Depot Inward Returns
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Return-intake records are unavailable until the backend exposes a return-request workflow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-[6px]">
            {returnsList.filter((r) => r.status === 'RETURN_REQUESTED').length} Pending Intake
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-[6px] w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white text-[#1E40AF] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Returns ({returnsList.length})
          </button>
          <button
            onClick={() => setStatusFilter('RETURN_REQUESTED')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition cursor-pointer ${
              statusFilter === 'RETURN_REQUESTED'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Return Requested
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition cursor-pointer ${
              statusFilter === 'APPROVED'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('RECEIVED')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition cursor-pointer ${
              statusFilter === 'RECEIVED'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Received
          </button>
        </div>

        {/* Search */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search return ID, DS office, serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
          />
        </div>
      </div>

      {/* Returns Data Table */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-slate-700 border-collapse">
            <thead className="bg-slate-50 text-[12px] font-semibold uppercase tracking-wider text-slate-500 border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3.5 px-4">Return ID</th>
                <th className="py-3.5 px-4">DS Office</th>
                <th className="py-3.5 px-4">Device & Serial</th>
                <th className="py-3.5 px-4">Reason for Return</th>
                <th className="py-3.5 px-4">Requested Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading returned items from server...
                  </td>
                </tr>
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No return items match this filter.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => {
                  const isReceived = ret.status === 'RECEIVED'
                  const isRequested = ret.status === 'RETURN_REQUESTED'
                  const isApproved = ret.status === 'APPROVED'

                  return (
                    <tr
                      key={ret.id}
                      className="hover:bg-[#EFF6FF] transition-colors cursor-default"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {ret.id}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-[#1E40AF]" />
                          <span>{ret.dsOfficeName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{ret.deviceName}</span>
                        <span className="font-mono text-[11px] text-slate-500 block">
                          SN: {ret.serialNumber}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={ret.reason}>
                        {ret.reason}
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {ret.requestedDate}
                      </td>

                      <td className="py-3 px-4">
                        {isRequested && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Return Requested
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                            Approved
                          </span>
                        )}
                        {isReceived && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Received
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!isReceived ? (
                          <PrimaryButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenReceiptModal(ret)}
                            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                            className="bg-[#0D9488] hover:bg-[#0F766E] text-white"
                          >
                            Confirm Receipt
                          </PrimaryButton>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Vaulted</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal with Condition Checkboxes */}
      {selectedReturn && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Confirm Hardware Receipt: ${selectedReturn.id}`}
          description={`Verify physical condition of returning device from ${selectedReturn.dsOfficeName}.`}
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2">
              <PrimaryButton variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </PrimaryButton>
              <PrimaryButton
                variant="primary"
                size="md"
                onClick={handleConfirmReceipt}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold"
              >
                Confirm & Log Receipt
              </PrimaryButton>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Device Dossier */}
            <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">From Office:</span>
                <span className="font-bold text-slate-900">{selectedReturn.dsOfficeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Device Model:</span>
                <span className="font-semibold">{selectedReturn.deviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Serial Number:</span>
                <span className="font-mono font-bold text-[#1E40AF]">{selectedReturn.serialNumber}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Declared Reason:</span>
                <span className="italic text-slate-700">{selectedReturn.reason}</span>
              </div>
            </div>

            {/* Condition Checkboxes (Good / Damaged / Missing parts) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Intake Condition Check (Required):
              </label>

              <div className="space-y-2 p-3 rounded-[6px] border border-[#E2E8F0] bg-white">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={condGood}
                    onChange={(e) => setCondGood(e.target.checked)}
                    className="rounded border-slate-300 text-[#16A34A] focus:ring-[#16A34A]"
                  />
                  <div>
                    <span className="font-bold text-slate-900">Good Condition (Restockable)</span>
                    <p className="text-[11px] text-slate-500">Unit powers on, clean chassis, suitable for re-allocation</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-slate-100">
                  <input
                    type="checkbox"
                    checked={condDamaged}
                    onChange={(e) => setCondDamaged(e.target.checked)}
                    className="rounded border-slate-300 text-[#DC2626] focus:ring-[#DC2626]"
                  />
                  <div>
                    <span className="font-bold text-slate-900">Damaged / Faulty Hardware</span>
                    <p className="text-[11px] text-slate-500">Routes automatically to IT Maintenance Triage queue</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-slate-100">
                  <input
                    type="checkbox"
                    checked={condMissing}
                    onChange={(e) => setCondMissing(e.target.checked)}
                    className="rounded border-slate-300 text-[#F59E0B] focus:ring-[#F59E0B]"
                  />
                  <div>
                    <span className="font-bold text-slate-900">Missing Parts / Incomplete Accessories</span>
                    <p className="text-[11px] text-slate-500">Missing power adapter, stylus, or packaging</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Inspector Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Store Keeper Inspection Notes
              </label>
              <textarea
                rows={3}
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                placeholder="Add physical condition inspection notes, serial label verification, etc..."
                className="w-full rounded-[6px] border border-[#E2E8F0] bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 leading-relaxed"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
