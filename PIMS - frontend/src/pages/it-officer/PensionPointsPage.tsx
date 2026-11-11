import React, { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Calculator,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { calculateEligibleDevices, calculateRemainingEligibility, type DSOffice } from '../../models/pension'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { formatNumber, getDSOfficeStatusBadge } from '../../utils/format'
import { Badge } from '../../components/ui/Badge/Badge'
import { Modal } from '../../components/ui/Modal/Modal'
import { Input } from '../../components/ui/Input/Input'
import { pensionService } from '../../services/PensionService'

export const PensionPointsPage: React.FC = () => {
  const { success, error } = useToast()
  const [offices, setOffices] = useState<DSOffice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState<'files' | 'eligible' | 'remaining' | 'name'>('files')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const loadOffices = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await pensionService.getAll()
      setOffices(data)
    } catch {
      error('Failed to load Pension Points data.')
    } finally {
      setIsLoading(false)
    }
  }, [error])

  React.useEffect(() => {
    loadOffices()
  }, [loadOffices])

  // Add/Edit DS Office Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOffice, setEditingOffice] = useState<DSOffice | null>(null)
  const [modalName, setModalName] = useState('')
  const [modalProvince, setModalProvince] = useState('Western Province')
  const [modalFiles, setModalFiles] = useState(3000)
  const [modalAssigned, setModalAssigned] = useState(1)

  // View Details Modal state
  const [viewOffice, setViewOffice] = useState<DSOffice | null>(null)

  // Delete confirm modal state
  const [deleteOffice, setDeleteOffice] = useState<DSOffice | null>(null)

  const handleOpenAdd = () => {
    setEditingOffice(null)
    setModalName('')
    setModalProvince('Western Province')
    setModalFiles(3000)
    setModalAssigned(1)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (office: DSOffice) => {
    setEditingOffice(office)
    setModalName(office.name)
    setModalProvince(office.province)
    setModalFiles(office.pensionFiles)
    setModalAssigned(office.assignedDevices)
    setIsModalOpen(true)
  }

  const handleSaveOffice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalName.trim()) {
      error('Please enter the DS Office name.')
      return
    }

    const files = Math.max(0, Number(modalFiles))
    const assigned = Math.max(0, Number(modalAssigned))

    try {
      if (editingOffice) {
        await pensionService.update(editingOffice.id, {
          name: modalName,
          province: modalProvince,
          pensionFiles: files,
          assignedDevices: assigned,
        })
        success(`Updated ${modalName} quota metrics successfully.`)
      } else {
        await pensionService.create({
          name: modalName,
          province: modalProvince,
          pensionFiles: files,
          assignedDevices: assigned,
        })
        const eligible = calculateEligibleDevices(files)
        success(`Added new DS Office: ${modalName} with eligible quota of ${eligible} devices.`)
      }
      setIsModalOpen(false)
      loadOffices()
    } catch (err: any) {
      error(err.message || 'Operation failed')
    }
  }

  const handleDelete = async () => {
    if (!deleteOffice) return
    try {
      await pensionService.delete(deleteOffice.id)
      success(`Removed ${deleteOffice.name} from active registry.`)
      setDeleteOffice(null)
      loadOffices()
    } catch (err: any) {
      error(err.message || 'Failed to remove office')
    }
  }

  // Filter and sort logic
  const filteredOffices = offices
    .filter((o) => {
      const matchesSearch =
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.code.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === 'files') comparison = a.pensionFiles - b.pensionFiles
      else if (sortBy === 'eligible') comparison = a.eligibleDevices - b.eligibleDevices
      else if (sortBy === 'remaining') comparison = a.remainingEligibility - b.remainingEligibility
      else if (sortBy === 'name') comparison = a.name.localeCompare(b.name)
      return sortOrder === 'desc' ? -comparison : comparison
    })

  // Live modal quota calculation
  const previewEligible = calculateEligibleDevices(modalFiles)
  const previewRemaining = calculateRemainingEligibility(modalFiles, modalAssigned)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pension Points</h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#1E40AF] border border-blue-200">
              Statutory Quota Manager
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Divisional Secretariat hardware entitlements strictly based on the departmental standard: <strong>1 device per 1,500 active pension files</strong>.
          </p>
        </div>

        <PrimaryButton
          variant="primary"
          size="md"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add DS Office
        </PrimaryButton>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search DS Office name, code, or province..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-white border border-[#E2E8F0] rounded-[6px] text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLIANT">Compliant</option>
              <option value="NEEDS_ALLOCATION">Eligible for Allocation</option>
              <option value="QUOTA_REACHED">Quota Reached</option>
              <option value="OVER_ALLOCATED">Over-Allocated</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1.5 px-2.5 bg-white border border-[#E2E8F0] rounded-[6px] text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
            >
              <option value="files">Pension Files</option>
              <option value="eligible">Eligible Devices</option>
              <option value="remaining">Remaining Quota</option>
              <option value="name">Office Name</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 rounded-[6px] border border-[#E2E8F0] bg-slate-50 hover:bg-slate-100 text-xs text-slate-600 cursor-pointer font-bold"
              title="Toggle ascending / descending"
            >
              {sortOrder === 'asc' ? '▲' : '▼'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-slate-700 border-collapse">
            <thead className="bg-slate-50 text-[12px] font-semibold uppercase tracking-wider text-slate-500 border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3.5 px-4">DS Office</th>
                <th className="py-3.5 px-4">Pension Files</th>
                <th className="py-3.5 px-4">Eligible Devices</th>
                <th className="py-3.5 px-4">Assigned</th>
                <th className="py-3.5 px-4 min-w-[200px]">Remaining Eligibility</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] bg-white">
              {filteredOffices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No Divisional Secretariat offices match your criteria.
                  </td>
                </tr>
              ) : (
                filteredOffices.map((office) => {
                  const badge = getDSOfficeStatusBadge(office.status)
                  const percent = Math.min(
                    100,
                    Math.round((office.assignedDevices / Math.max(1, office.eligibleDevices)) * 100)
                  )

                  return (
                    <tr
                      key={office.id}
                      className="hover:bg-[#EFF6FF] transition-colors duration-150 cursor-default group"
                    >
                      {/* DS Office Column */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#1E40AF]" />
                          <span>{office.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-normal pl-6 mt-0.5">
                          <span className="font-mono">{office.code}</span>
                          <span>•</span>
                          <span>{office.province}</span>
                        </div>
                      </td>

                      {/* Pension Files */}
                      <td className="py-3 px-4 font-medium text-slate-800">
                        <span className="font-semibold">{formatNumber(office.pensionFiles)}</span>
                        <span className="text-[11px] text-slate-400 block">cases</span>
                      </td>

                      {/* Eligible Devices */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span className="text-base text-[#1E40AF]">{office.eligibleDevices}</span>
                        <span className="text-[11px] text-slate-400 font-normal block">entitled</span>
                      </td>

                      {/* Assigned */}
                      <td className="py-3 px-4 font-bold text-slate-800">
                        <span className="text-base">{office.assignedDevices}</span>
                        <span className="text-[11px] text-slate-400 font-normal block">in use</span>
                      </td>

                      {/* Remaining Eligibility with Mini Progress Bar */}
                      <td className="py-3 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">
                              {office.remainingEligibility} {office.remainingEligibility === 1 ? 'device' : 'devices'} remaining
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                office.assignedDevices > office.eligibleDevices
                                  ? 'bg-[#DC2626]'
                                  : percent >= 100
                                  ? 'bg-[#16A34A]'
                                  : 'bg-[#1E40AF]'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {office.remainingEligibility > 0
                              ? `May request ${office.remainingEligibility} more device(s)`
                              : 'Statutory quota fully allocated'}
                          </p>
                        </div>
                      </td>

                      {/* Status Chip */}
                      <td className="py-3 px-4">
                        <Badge variant={badge.variant} size="sm">
                          {badge.label}
                        </Badge>
                      </td>

                      {/* Row Actions (View / Edit / Delete) */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewOffice(office)}
                            title="View Quota Breakdown"
                            className="p-1.5 rounded-[6px] text-slate-400 hover:text-[#1E40AF] hover:bg-blue-50 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(office)}
                            title="Edit Files & Count"
                            className="p-1.5 rounded-[6px] text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteOffice(office)}
                            title="Delete Office Entry"
                            className="p-1.5 rounded-[6px] text-slate-400 hover:text-[#DC2626] hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit DS Office Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOffice ? `Edit ${editingOffice.name}` : 'Add Divisional Secretariat Office'}
        description="Configure active pension file count to automatically calculate eligible hardware quota."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <PrimaryButton variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </PrimaryButton>
            <PrimaryButton variant="primary" size="md" onClick={handleSaveOffice}>
              {editingOffice ? 'Save Changes' : 'Register DS Office'}
            </PrimaryButton>
          </div>
        }
      >
        <form onSubmit={handleSaveOffice} className="space-y-4">
          <Input
            label="DS Office Name"
            placeholder="e.g. DS Office Matara"
            value={modalName}
            onChange={(e) => setModalName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Province
            </label>
            <select
              value={modalProvince}
              onChange={(e) => setModalProvince(e.target.value)}
              className="w-full rounded-[6px] border border-[#E2E8F0] p-2 text-sm text-slate-900 bg-white"
            >
              <option value="Western Province">Western Province</option>
              <option value="Central Province">Central Province</option>
              <option value="Southern Province">Southern Province</option>
              <option value="Northern Province">Northern Province</option>
              <option value="Eastern Province">Eastern Province</option>
              <option value="North Western Province">North Western Province</option>
              <option value="North Central Province">North Central Province</option>
              <option value="Uva Province">Uva Province</option>
              <option value="Sabaragamuwa Province">Sabaragamuwa Province</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Active Pension Files"
              type="number"
              min="0"
              value={modalFiles}
              onChange={(e) => setModalFiles(Number(e.target.value))}
              helperText="Official caseload"
              required
            />

            <Input
              label="Already Assigned"
              type="number"
              min="0"
              value={modalAssigned}
              onChange={(e) => setModalAssigned(Number(e.target.value))}
              helperText="Current active units"
              required
            />
          </div>

          {/* Live Ratio Math Preview Card */}
          <div className="p-3.5 rounded-[8px] bg-blue-50 border border-blue-200 text-xs space-y-1.5">
            <p className="font-bold text-[#1E40AF] flex items-center gap-1.5">
              <Calculator className="w-4 h-4" />
              <span>Real-Time Statutory Formula Preview:</span>
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 font-semibold text-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Eligible Units:</span>
                <span className="text-base text-[#1E40AF] font-bold">{previewEligible}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Assigned:</span>
                <span className="text-base">{modalAssigned}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Remaining:</span>
                <span className="text-base text-[#16A34A] font-bold">{previewRemaining}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 pt-1 border-t border-blue-200/60">
              Formula: floor({modalFiles} ÷ 1,500) = {previewEligible} eligible devices.
            </p>
          </div>
        </form>
      </Modal>

      {/* View Office Quota Modal */}
      {viewOffice && (
        <Modal
          isOpen={!!viewOffice}
          onClose={() => setViewOffice(null)}
          title={`Quota Dossier: ${viewOffice.name}`}
          size="md"
          footer={
            <PrimaryButton variant="primary" size="sm" onClick={() => setViewOffice(null)}>
              Close
            </PrimaryButton>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Registry Code:</span>
                <span className="font-bold font-mono">{viewOffice.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Province & District:</span>
                <span className="font-semibold">{viewOffice.province}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authorized DS Officer:</span>
                <span className="font-semibold">{viewOffice.officerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Email:</span>
                <span className="font-mono text-[11px]">{viewOffice.officerEmail}</span>
              </div>
            </div>

            <div className="p-4 rounded-[8px] bg-emerald-50 border border-emerald-200 space-y-2">
              <p className="font-bold text-emerald-900 text-sm">Statutory Allocation Standing</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-emerald-700">Pension Files Handled:</span>
                  <p className="text-base font-bold text-slate-900">{formatNumber(viewOffice.pensionFiles)}</p>
                </div>
                <div>
                  <span className="text-emerald-700">Eligible Devices:</span>
                  <p className="text-base font-bold text-[#1E40AF]">{viewOffice.eligibleDevices}</p>
                </div>
                <div>
                  <span className="text-emerald-700">Currently In Deployment:</span>
                  <p className="text-base font-bold text-slate-900">{viewOffice.assignedDevices}</p>
                </div>
                <div>
                  <span className="text-emerald-700">Remaining Request Quota:</span>
                  <p className="text-base font-bold text-[#16A34A]">{viewOffice.remainingEligibility}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteOffice && (
        <Modal
          isOpen={!!deleteOffice}
          onClose={() => setDeleteOffice(null)}
          title="Confirm Removal"
          size="sm"
          footer={
            <div className="flex items-center justify-end gap-2">
              <PrimaryButton variant="ghost" size="sm" onClick={() => setDeleteOffice(null)}>
                Cancel
              </PrimaryButton>
              <PrimaryButton variant="danger" size="md" onClick={handleDelete}>
                Delete Office
              </PrimaryButton>
            </div>
          }
        >
          <p className="text-xs text-slate-600">
            Are you sure you want to remove <strong>{deleteOffice.name}</strong> from the Pension Points Registry? All quota calculations and historic logs for this office will be archived.
          </p>
        </Modal>
      )}
    </div>
  )
}
