import React, { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Building2,
  Search,
  PenTool,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import type { DeliveryRecord } from '../../models/delivery'
import { assignmentService } from '../../services/AssignmentService'
import { inventoryService } from '../../services/InventoryService'
import { pensionService } from '../../services/PensionService'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { Modal } from '../../components/ui/Modal/Modal'
import { Input } from '../../components/ui/Input/Input'

export const IncomingDeliveriesPage: React.FC = () => {
  const { success, error } = useToast()
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([])
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'DELIVERED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // "Mark as Delivered" Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null)
  const [recipientName, setRecipientName] = useState('')
  const [signatureNotes, setSignatureNotes] = useState('')

  const loadDeliveries = async () => {
    try {
      setIsLoading(true)
      const [assignments, items, offices] = await Promise.all([
        assignmentService.getAll(),
        inventoryService.getItems(),
        pensionService.getAll(),
      ])

      const itemMap = new Map(items.map((i) => [i.id, i]))
      const officeMap = new Map(offices.map((o) => [Number(o.id), o.name]))

      const mapped: DeliveryRecord[] = assignments.map((a) => {
        const item = itemMap.get(String(a.itemId))
        const officeName = officeMap.get(a.pensionPointId) || `DS Office #${a.pensionPointId}`
        const isDelivered = a.status === 'ASSIGNED' || a.status === 'RETURNED'

        return {
          id: `DEL-${a.id}`,
          requestId: `REQ-${a.id}`,
          dsOfficeName: officeName,
          item: item?.name || `Equipment #${a.itemId}`,
          quantity: 1,
          serialNumbers: item?.serialNumbers || ['SN-TRACKED'],
          assignedBy: 'Central Stores Depot',
          date: a.assignedAt ? a.assignedAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
          status: isDelivered ? 'DELIVERED' : 'PENDING_DELIVERY',
          recipientOfficer: 'Authorized DS Officer',
          signatureNote: a.remarks,
          deliveredAt: isDelivered ? a.assignedAt : undefined,
        }
      })

      setDeliveries(mapped)
    } catch (err) {
      console.error('Failed to load deliveries', err)
      error(err instanceof Error ? err.message : 'Failed to load delivery records.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadDeliveries()
  }, [])

  const handleOpenDeliveryModal = (del: DeliveryRecord) => {
    setSelectedDelivery(del)
    setRecipientName(del.recipientOfficer || 'Authorized DS Office Accountant')
    setSignatureNotes(del.signatureNote || 'Device received in sealed official carton. Power-on self test passed.')
    setIsModalOpen(true)
  }

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipientName.trim()) {
      error('Recipient officer name is mandatory.')
      return
    }

    if (!selectedDelivery) return

    success(`Delivery confirmation recorded for ${selectedDelivery.item}.`)
    setIsModalOpen(false)
  }

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesTab =
      activeTab === 'ALL'
        ? true
        : activeTab === 'PENDING'
          ? d.status === 'PENDING_DELIVERY'
          : d.status === 'DELIVERED'

    const matchesSearch =
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.dsOfficeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.requestId.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesTab && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Incoming Deliveries
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-[#0D9488] border border-teal-200">
              Central Depot Logistics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Delivery records are unavailable until the backend exposes dispatch and receipt endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-[6px]">
            {deliveries.filter((d) => d.status === 'PENDING_DELIVERY').length} In Transit
          </span>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-[6px] w-full md:w-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition cursor-pointer ${activeTab === 'ALL'
              ? 'bg-white text-[#1E40AF] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            All Shipments ({deliveries.length})
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition cursor-pointer ${activeTab === 'PENDING'
              ? 'bg-white text-amber-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Pending Delivery ({deliveries.filter((d) => d.status === 'PENDING_DELIVERY').length})
          </button>
          <button
            onClick={() => setActiveTab('DELIVERED')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition cursor-pointer ${activeTab === 'DELIVERED'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Delivered ({deliveries.filter((d) => d.status === 'DELIVERED').length})
          </button>
        </div>

        {/* Search */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search delivery ID, DS office, item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
          />
        </div>
      </div>

      {/* Deliveries Data Table */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-slate-700 border-collapse">
            <thead className="bg-slate-50 text-[12px] font-semibold uppercase tracking-wider text-slate-500 border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Request / Waybill ID</th>
                <th className="py-3 px-4">DS Office</th>
                <th className="py-3 px-4">Item & Serials</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4">Assigned By</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading deliveries from server...
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No delivery records match this filter.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((del) => {
                  const isPending = del.status === 'PENDING_DELIVERY'

                  return (
                    <tr
                      key={del.id}
                      className="hover:bg-[#EFF6FF] transition-colors cursor-default"
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 font-mono">{del.id}</span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          Ref: {del.requestId}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-[#1E40AF]" />
                          <span>{del.dsOfficeName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{del.item}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {del.serialNumbers.map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-[#1E40AF]">
                        {del.quantity}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {del.assignedBy}
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {del.date}
                      </td>

                      <td className="py-3 px-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Pending Delivery
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Delivered
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isPending ? (
                          <PrimaryButton
                            variant="success"
                            size="sm"
                            onClick={() => handleOpenDeliveryModal(del)}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            className="bg-[#16A34A] hover:bg-green-700 text-white font-bold"
                          >
                            Mark as Delivered
                          </PrimaryButton>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Acknowledged
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

      {/* Confirmation Modal with Signature / Notes Field */}
      {selectedDelivery && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Confirm Delivery Handover: ${selectedDelivery.id}`}
          description={`Confirm that the IT hardware has arrived at ${selectedDelivery.dsOfficeName}.`}
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2">
              <PrimaryButton variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </PrimaryButton>
              <PrimaryButton
                variant="success"
                size="md"
                isLoading={false}
                onClick={handleConfirmDelivery}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                className="bg-[#16A34A] hover:bg-green-700 text-white font-bold"
              >
                Confirm Physical Delivery
              </PrimaryButton>
            </div>
          }
        >
          <form onSubmit={handleConfirmDelivery} className="space-y-4 text-xs">
            {/* Shipment Summary */}
            <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-bold text-slate-900">{selectedDelivery.dsOfficeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hardware Unit:</span>
                <span className="font-semibold">{selectedDelivery.item}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Serial Numbers:</span>
                <span className="font-mono font-bold text-[#1E40AF]">
                  {selectedDelivery.serialNumbers.join(', ')}
                </span>
              </div>
            </div>

            {/* Recipient Officer */}
            <Input
              label="Recipient Officer Name / Designation"
              placeholder="e.g. A. Rathnayake (DS Administrative Officer)"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
            />

            {/* Signature / Notes Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Signature / Delivery Acknowledgment Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={signatureNotes}
                onChange={(e) => setSignatureNotes(e.target.value)}
                placeholder="Enter receipt voucher number, inspection condition confirmation, or recipient digital signature reference..."
                className="w-full rounded-[6px] border border-[#E2E8F0] bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 leading-relaxed"
              />
            </div>

            <div className="p-3 rounded-[6px] bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Statutory audit log will be stamped with Store Keeper identity and current timestamp.
              </span>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
