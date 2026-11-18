import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calculator,
  Laptop,
  PlusCircle,
  Wrench,
  Clock,
  FileText,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { pensionService } from '../../services/PensionService'
import { assignmentService, type BackendAssignment } from '../../services/AssignmentService'
import { requestService } from '../../services/RequestService'
import { maintenanceService } from '../../services/MaintenanceService'
import { inventoryService } from '../../services/InventoryService'
import type { ItemRequest } from '../../models/request'
import type { MaintenanceRequest } from '../../models/maintenance'
import type { InventoryItem } from '../../models/inventory'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { StatCard } from '../../components/shared/StatCard'
import { formatNumber } from '../../utils/format'
import { Badge } from '../../components/ui/Badge/Badge'

export const DSOfficeDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [officeName, setOfficeName] = useState(user?.department || 'DS Office')
  const [province, setProvince] = useState('Western Province')
  const [pensionFiles, setPensionFiles] = useState(0)
  const [eligibleDevices, setEligibleDevices] = useState(0)
  const [assignedCount, setAssignedCount] = useState(0)
  const [myRequests, setMyRequests] = useState<ItemRequest[]>([])
  const [deployedItems, setDeployedItems] = useState<{ assignment: BackendAssignment; item?: InventoryItem }[]>([])
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [office, assignments, requests, maintenance, items] = await Promise.all([
          user?.pensionPointId ? pensionService.getById(user.pensionPointId) : Promise.resolve(null),
          user?.pensionPointId ? assignmentService.getByPensionPoint(user.pensionPointId) : Promise.resolve([]),
          user?.id ? requestService.getMyRequests(user.id) : requestService.getAllRequests(),
          maintenanceService.getAll(),
          inventoryService.getItems(),
        ])

        if (office) {
          setOfficeName(office.name)
          setProvince(office.province || 'Western Province')
          setPensionFiles(office.pensionFiles)
          setEligibleDevices(office.eligibleDevices)
        }

        const activeAssignments = assignments.filter((a) => a.status === 'ASSIGNED')
        setAssignedCount(activeAssignments.length)

        const itemMap = new Map(items.map((i) => [i.id, i]))
        setDeployedItems(activeAssignments.map((a) => ({ assignment: a, item: itemMap.get(String(a.itemId)) })))
        setMyRequests(requests)
        setMaintenanceTickets(maintenance)
      } catch (err) {
        console.error('Failed to load DS office dashboard data', err)
      } finally {
        setIsLoading(false)
      }
    }
    void loadDashboard()
  }, [user?.pensionPointId, user?.id])

  const availableToRequest = Math.max(0, eligibleDevices - assignedCount)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {officeName} Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              {province}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Divisional Secretariat hardware quota administration and maintenance reporting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <PrimaryButton
            variant="outline"
            size="sm"
            onClick={() => navigate('/ds-office/maintenance-request')}
            leftIcon={<Wrench className="w-4 h-4 text-purple-600" />}
          >
            Report Breakdown
          </PrimaryButton>
          <PrimaryButton
            variant="primary"
            size="sm"
            onClick={() => navigate('/ds-office/request-device')}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Request Device
          </PrimaryButton>
        </div>
      </div>

      {/* Statutory Ratio Highlight Banner (1 device per 1,500 files) */}
      <div className="p-4 rounded-[8px] bg-blue-50/70 border border-blue-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-[#1E40AF] text-white flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E40AF]">
              Statutory Pension Ratio Standing: 1 Device per 1,500 Pension Files
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Your office manages <strong>{formatNumber(pensionFiles)} active pension files</strong>. Statutory entitlement is <strong>{eligibleDevices} devices</strong>. Currently deployed: <strong>{assignedCount} devices</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[11px] text-slate-500 uppercase font-bold block">Available to Request:</span>
            <span className="text-xl font-black text-[#16A34A]">{availableToRequest} {availableToRequest === 1 ? 'Device' : 'Devices'}</span>
          </div>
          <PrimaryButton
            variant="primary"
            size="sm"
            onClick={() => navigate('/ds-office/request-device')}
          >
            Claim Quota
          </PrimaryButton>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Pension Files"
          value={formatNumber(pensionFiles)}
          subtitle={`${officeName} records`}
          icon={<FileText className="w-5 h-5" />}
          iconBg="bg-blue-50 text-[#1E40AF]"
        />

        <StatCard
          title="Eligible Devices Quota"
          value={eligibleDevices}
          subtitle={`Formula: floor(${formatNumber(pensionFiles)} / 1,500)`}
          icon={<Calculator className="w-5 h-5" />}
          iconBg="bg-teal-50 text-[#0D9488]"
        />

        <StatCard
          title="Assigned in Deployment"
          value={assignedCount}
          subtitle="Active on counter desks"
          icon={<Laptop className="w-5 h-5" />}
          iconBg="bg-slate-100 text-slate-700"
        />

        <StatCard
          title="Pending Requests"
          value={myRequests.filter((r) => r.status === 'PENDING').length}
          subtitle="Awaiting central approval"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-amber-50 text-[#F59E0B]"
        />
      </div>

      {/* 2-Column Split: My Office Active Devices vs Requisition Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Deployed Equipment & Fault Reporting */}
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Deployed Hardware in Office</h3>
              <p className="text-xs text-slate-500">Equipment currently located at this DS office</p>
            </div>
            <Badge variant="primary" size="sm">
              {deployedItems.length} {deployedItems.length === 1 ? 'Unit' : 'Units'}
            </Badge>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading deployed equipment...</p>
            ) : deployedItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No hardware currently deployed to this office.</p>
            ) : (
              deployedItems.map(({ assignment, item }) => (
                <div key={assignment.id} className="p-4 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {item?.name || `Item #${assignment.itemId}`}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Code: {item?.itemCode || 'N/A'} • Assigned: {assignment.assignedAt ? assignment.assignedAt.slice(0, 10) : 'Active'}
                      </p>
                    </div>
                    <Badge variant="success" size="sm">
                      In Use
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-slate-500">{assignment.remarks || 'Active Counter Desk'}</span>
                    <button
                      onClick={() => navigate('/ds-office/maintenance-request')}
                      className="text-purple-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Report Defect</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Requisitions & Maintenance Status */}
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Requisitions & Ticket Status</h3>
              <p className="text-xs text-slate-500">Live approval and maintenance tracking</p>
            </div>
            <button
              onClick={() => navigate('/ds-office/request-device')}
              className="text-[#1E40AF] text-xs font-bold hover:underline cursor-pointer"
            >
              + New Request
            </button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading requests...</p>
            ) : myRequests.length === 0 && maintenanceTickets.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No active requisitions or maintenance tickets.</p>
            ) : (
              <>
                {myRequests.slice(0, 3).map((req) => (
                  <div key={req.id} className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900">
                          Requisition #{req.requestNumber}
                        </span>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {req.quantity}x {req.itemName}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        req.status === 'REJECTED' ? 'bg-red-50 text-red-800 border border-red-200' :
                        'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    {req.reason && (
                      <p className="text-[11px] text-slate-500 italic">
                        "{req.reason}"
                      </p>
                    )}
                  </div>
                ))}

                {maintenanceTickets.slice(0, 2).map((mnt) => (
                  <div key={mnt.id} className="p-3.5 rounded-[6px] bg-purple-50/40 border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-purple-950">
                          Ticket #{mnt.ticketNumber} ({mnt.issueCategory})
                        </span>
                        <p className="text-[11px] text-purple-800 mt-0.5">
                          {mnt.deviceName}: {mnt.description}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {mnt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
