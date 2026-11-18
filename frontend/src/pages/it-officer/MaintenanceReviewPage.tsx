import React, { useEffect, useState } from 'react'
import {
  Wrench,
  CheckCircle2,
  Building2,
  Laptop,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import type { MaintenanceRequest } from '../../models/maintenance'
import { maintenanceService } from '../../services/MaintenanceService'
import { formatDate, getMaintenanceStatusBadge } from '../../utils/format'
import { Badge } from '../../components/ui/Badge/Badge'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'

export const MaintenanceReviewPage: React.FC = () => {
  const { success, error } = useToast()
  const [tickets, setTickets] = useState<MaintenanceRequest[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState('')

  const currentTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0]

  // Action Form state
  const [scheduleDate, setScheduleDate] = useState('2026-10-16')
  const [technician, setTechnician] = useState('Jagath Kumara (Senior Hardware Tech)')
  const [actionNotes, setActionNotes] = useState(
    'Hardware dispatch authorized for central workshop motherboard diagnostic.'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    maintenanceService.getAll()
      .then((data) => {
        setTickets(data)
        setSelectedTicketId(data[0]?.id || '')
      })
      .catch((loadError: unknown) => error(loadError instanceof Error ? loadError.message : 'Failed to load maintenance requests.'))
  }, [error])

  const handleApproveAndSchedule = async () => {
    if (!currentTicket) return
    setIsSubmitting(true)
    try {
      await maintenanceService.startMaintenance(currentTicket.id)
      const updated = await maintenanceService.getById(currentTicket.id)
      if (updated) setTickets((previous) => previous.map((ticket) => ticket.id === updated.id ? updated : ticket))
      success(`Ticket #${currentTicket.ticketNumber} moved to in-progress.`)
    } catch (actionError) {
      error(actionError instanceof Error ? actionError.message : 'Failed to start maintenance.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!currentTicket) return
    setIsSubmitting(true)
    try {
      await maintenanceService.cancelMaintenance(currentTicket.id)
      const updated = await maintenanceService.getById(currentTicket.id)
      if (updated) setTickets((previous) => previous.map((ticket) => ticket.id === updated.id ? updated : ticket))
      success(`Ticket #${currentTicket.ticketNumber} cancelled.`)
    } catch (actionError) {
      error(actionError instanceof Error ? actionError.message : 'Failed to cancel maintenance.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Maintenance Triage & Review
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              Field Hardware Repair Queue
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review reported breakdowns from Divisional Secretariats, triage component faults, and schedule technician dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-[6px]">
            {tickets.filter((t) => t.status === 'PENDING').length} Awaiting Triage
          </span>
        </div>
      </div>

      {/* Split View Layout (Left = Tickets List, Right = Detail & Action Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Maintenance Requests with Status Badges (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Reported Tickets ({tickets.length})
            </h2>
            <span className="text-[11px] text-slate-400">Click to view ticket</span>
          </div>

          <div className="space-y-2.5">
            {tickets.map((t) => {
              const isSelected = t.id === selectedTicketId
              const badge = getMaintenanceStatusBadge(t.status)
              const priorityColors = {
                Urgent: 'text-[#DC2626] bg-red-50 border-red-200',
                High: 'text-amber-700 bg-amber-50 border-amber-200',
                Medium: 'text-blue-700 bg-blue-50 border-blue-200',
                Low: 'text-slate-600 bg-slate-50 border-slate-200',
              }

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-4 rounded-[8px] border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1E40AF] bg-blue-50/40 shadow-sm ring-1 ring-[#1E40AF]/20'
                      : 'border-[#E2E8F0] bg-white hover:bg-slate-50/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{t.dsOfficeName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{t.ticketNumber}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-medium truncate">{t.deviceName}</p>
                    </div>

                    <Badge variant={badge.variant} size="sm">
                      {badge.label}
                    </Badge>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{t.issueCategory} issue</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold border text-[10px] ${
                        priorityColors[t.priority]
                      }`}
                    >
                      {t.priority} Priority
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Detail Panel showing device info, issue description, photos & Action Area (7 cols) */}
        {currentTicket && (
          <div className="lg:col-span-7 rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-6">
            {/* Ticket Header Strip */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Incident #{currentTicket.ticketNumber}
                  </h3>
                  <Badge variant={getMaintenanceStatusBadge(currentTicket.status).variant} size="sm">
                    {getMaintenanceStatusBadge(currentTicket.status).label}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Logged by {currentTicket.dsOfficeName} on {formatDate(currentTicket.createdAt)}
                </p>
              </div>

              <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {currentTicket.priority} Priority
              </span>
            </div>

            {/* Device Dossier 2-Column Grid */}
            <div className="p-4 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Office Division:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-[#1E40AF]" />
                  {currentTicket.dsOfficeName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Equipment:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Laptop className="w-3.5 h-3.5 text-slate-600" />
                  {currentTicket.deviceName}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 sm:border-t-0">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Serial Number:</span>
                <span className="font-mono font-bold text-[#1E40AF] mt-0.5 block">
                  {currentTicket.serialNumber}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 sm:border-t-0">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Fault Domain:</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {currentTicket.issueCategory}
                </span>
              </div>
            </div>

            {/* Issue Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Reported Breakdown Description:
              </label>
              <div className="p-3.5 rounded-[6px] bg-white border border-[#E2E8F0] text-slate-800 text-[13px] leading-relaxed">
                {currentTicket.description}
              </div>
            </div>

            {/* Attached Photo Preview (if present) */}
            {currentTicket.photoUrl && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Attached Field Defect Photo:
                </label>
                <div className="p-2 rounded-[6px] border border-[#E2E8F0] bg-slate-50 max-w-sm">
                  <img
                    src={currentTicket.photoUrl}
                    alt="Defect visual preview"
                    className="w-full h-44 object-cover rounded-[4px] border border-slate-200"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    Inspection image captured onsite at {currentTicket.dsOfficeName}
                  </p>
                </div>
              </div>
            )}

            {/* Action Area: Date Picker "Schedule Date", Technician dropdown, Notes textarea, Buttons */}
            <div className="p-4 rounded-[8px] bg-slate-50 border border-[#E2E8F0] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#1E40AF]" />
                <span>IT Officer Action & Schedule Dispatch</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Date Picker: "Schedule Date" */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Schedule Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full rounded-[6px] border border-[#E2E8F0] bg-white p-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
                    />
                  </div>
                </div>

                {/* Technician Dropdown */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Assign Technician
                  </label>
                  <select
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full rounded-[6px] border border-[#E2E8F0] bg-white p-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
                  >
                    <option value="Jagath Kumara (Senior Hardware Tech)">
                      Jagath Kumara — Senior Hardware Tech
                    </option>
                    <option value="Nimal Silva (Dell Onsite Partner)">
                      Nimal Silva — Dell Certified Onsite Partner
                    </option>
                    <option value="Sampath Perera (Printer & Imaging Specialist)">
                      Sampath Perera — Printer & Imaging Specialist
                    </option>
                    <option value="Central Workshop Diagnostic Team">
                      Central Workshop Diagnostic Team
                    </option>
                  </select>
                </div>
              </div>

              {/* Notes Textarea */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Technician Work Order / Dispatch Notes
                </label>
                <textarea
                  rows={2}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Specify replacement parts, motherboard swap authorization, or pickup protocol..."
                  className="w-full rounded-[6px] border border-[#E2E8F0] bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 leading-relaxed"
                />
              </div>

              {/* Action Buttons: [Reject] (outline red) [Approve & Schedule] (solid blue) */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <PrimaryButton
                  variant="outline"
                  size="md"
                  onClick={handleReject}
                  isLoading={isSubmitting}
                  className="border-[#DC2626] text-[#DC2626] hover:bg-red-50 hover:border-red-600"
                >
                  Reject
                </PrimaryButton>
                <PrimaryButton
                  variant="primary"
                  size="md"
                  onClick={handleApproveAndSchedule}
                  isLoading={isSubmitting}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Approve & Schedule
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
