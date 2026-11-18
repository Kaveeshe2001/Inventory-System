import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wrench,
  Upload,
  ArrowLeft,
  Image as ImageIcon,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import type { IssueCategory, MaintenancePriority } from '../../models/maintenance'
import type { InventoryItem } from '../../models/inventory'
import { assignmentService } from '../../services/AssignmentService'
import { inventoryService } from '../../services/InventoryService'
import { maintenanceService } from '../../services/MaintenanceService'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'

export const MaintenanceRequestFormPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error } = useToast()
  const [assignedOfficeDevices, setAssignedOfficeDevices] = useState<InventoryItem[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [issueCategory, setIssueCategory] = useState<IssueCategory>('Hardware')
  const [priority, setPriority] = useState<MaintenancePriority>('High')
  const [description, setDescription] = useState('')
  const [photoName, setPhotoName] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedDevice = assignedOfficeDevices.find((device) => device.id === selectedDeviceId)

  useEffect(() => {
    const loadAssignedDevices = async () => {
      try {
        if (!user?.pensionPointId) throw new Error('Your account is not linked to a pension point.')
        const assignments = await assignmentService.getByPensionPoint(user.pensionPointId)
        const activeAssignments = assignments.filter((assignment) => assignment.status === 'ASSIGNED')
        const devices = await Promise.all(activeAssignments.map((assignment) => inventoryService.getItemById(String(assignment.itemId))))
        setAssignedOfficeDevices(devices)
        setSelectedDeviceId(devices[0]?.id || '')
      } catch (loadError) {
        error(loadError instanceof Error ? loadError.message : 'Failed to load assigned devices.')
      } finally {
        setIsLoading(false)
      }
    }
    void loadAssignedDevices()
  }, [error, user?.pensionPointId])

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPhotoName(e.dataTransfer.files[0].name)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoName(e.target.files[0].name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      error('Please provide a description of the fault or breakdown.')
      return
    }
    if (!selectedDevice) {
      error('Select an assigned device before submitting a maintenance request.')
      return
    }

    setIsSubmitting(true)
    try {
      const ticket = await maintenanceService.create({
        deviceId: selectedDevice.id,
        deviceCode: selectedDevice.itemCode,
        issueCategory,
        description: description.trim(),
      })
      success(`Maintenance ticket ${ticket.ticketNumber} submitted successfully.`)
      navigate('/ds-office/dashboard')
    } catch (submitError) {
      error(submitError instanceof Error ? submitError.message : 'Failed to submit maintenance request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="py-4 space-y-6">
      {/* Top Breadcrumb Header */}
      <div className="max-w-[720px] mx-auto flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to DS Dashboard</span>
        </button>

        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-[6px] border border-purple-200">
          Hardware Defect & Field Repair Triage
        </span>
      </div>

      {/* Main Card Form (max-width: 720px) */}
      <div className="max-w-[720px] mx-auto rounded-[8px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-[#E2E8F0] bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Report Device Breakdown / Maintenance
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit issue description for authorized IT repair, onsite technician scheduling, or replacement.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. Select Device (Dropdown, only devices assigned to this office) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Select Device (Office Inventory) <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full rounded-[6px] border border-[#E2E8F0] bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
            >
              {assignedOfficeDevices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} — Serial: {device.serialNumbers[0] || 'Not recorded'}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              {isLoading ? 'Loading assigned devices...' : 'Showing equipment assigned to your pension point.'}
            </p>
          </div>

          {/* 2. Issue Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Issue Category <span className="text-red-500">*</span>
            </label>
            <select
              value={issueCategory}
              onChange={(e) => setIssueCategory(e.target.value as IssueCategory)}
              className="w-full rounded-[6px] border border-[#E2E8F0] bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
            >
              <option value="Hardware">Hardware (Power failure, motherboard, display, roller jam)</option>
              <option value="Software">Software (OS crash, pension database driver, malware, OS freeze)</option>
              <option value="Physical damage">Physical Damage (Dropped device, broken hinge, water ingress)</option>
              <option value="Other">Other / Network Interface Issues</option>
            </select>
          </div>

          {/* 3. Priority Radio Cards */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Incident Priority Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['Low', 'Medium', 'High', 'Urgent'] as MaintenancePriority[]).map((p) => {
                const isSelected = priority === p
                const colors = {
                  Low: 'border-slate-300 text-slate-700',
                  Medium: 'border-blue-400 text-blue-800',
                  High: 'border-amber-400 text-amber-800',
                  Urgent: 'border-rose-400 text-rose-800',
                }
                const activeBgs = {
                  Low: 'bg-slate-100 border-slate-500',
                  Medium: 'bg-blue-50 border-blue-600',
                  High: 'bg-amber-50 border-amber-600',
                  Urgent: 'bg-rose-50 border-rose-600',
                }

                return (
                  <label
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`p-3 rounded-[6px] border text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 ${
                      isSelected ? `${activeBgs[p]} font-bold shadow-xs` : `${colors[p]} bg-white hover:bg-slate-50`
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={isSelected}
                      onChange={() => setPriority(p)}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold">{p}</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {p === 'Urgent'
                        ? 'Halts counter'
                        : p === 'High'
                        ? 'Severe impact'
                        : p === 'Medium'
                        ? 'Degraded'
                        : 'Minor flaw'}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* 4. Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Technical Defect Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, any displayed BIOS/LED error codes, whether the unit powers on, and steps taken before failure..."
              className="w-full rounded-[6px] border border-[#E2E8F0] bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 leading-relaxed"
            />
          </div>

          {/* 5. Attach Photo (Drag & Drop Zone) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Attach Defect Photo / Diagnostic Screenshot (Optional)
            </label>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-[#E2E8F0] hover:border-[#1E40AF] rounded-[8px] p-6 text-center bg-slate-50/60 hover:bg-blue-50/20 transition cursor-pointer relative"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Upload className="w-5 h-5" />
                </div>
                {photoName ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1E40AF]">
                    <ImageIcon className="w-4 h-4" />
                    <span>{photoName} (Attached)</span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-slate-700">
                      Drag & drop image here, or <span className="text-[#1E40AF] underline">browse files</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      PNG, JPG up to 10MB (damage verification)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Submit Footer */}
          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
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
              isLoading={isSubmitting}
              leftIcon={<Wrench className="w-4 h-4" />}
            >
              Submit Maintenance Request
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}
