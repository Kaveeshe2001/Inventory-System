import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Truck,
  RotateCcw,
  Boxes,
  ArrowRight,
  PackageCheck,
  Building2,
} from 'lucide-react'
import { inventoryService } from '../../services/InventoryService'
import { assignmentService, type BackendAssignment } from '../../services/AssignmentService'
import { pensionService } from '../../services/PensionService'
import type { InventoryItem } from '../../models/inventory'
import type { DSOffice } from '../../models/pension'
import { StatCard } from '../../components/shared/StatCard'
import { Badge } from '../../components/ui/Badge/Badge'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'

export const StoreDashboard: React.FC = () => {
  const navigate = useNavigate()

  const [items, setItems] = useState<InventoryItem[]>([])
  const [assignments, setAssignments] = useState<BackendAssignment[]>([])
  const [offices, setOffices] = useState<DSOffice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        const [loadedItems, loadedAssignments, loadedOffices] = await Promise.all([
          inventoryService.getItems(),
          assignmentService.getAll(),
          pensionService.getAll(),
        ])
        setItems(loadedItems)
        setAssignments(loadedAssignments)
        setOffices(loadedOffices)
      } catch (err) {
        console.error('Failed to load store dashboard data', err)
      } finally {
        setIsLoading(false)
      }
    }
    void loadStoreData()
  }, [])

  const activeAssignments = assignments.filter((a) => a.status === 'ASSIGNED')
  const returnedAssignments = assignments.filter((a) => a.status === 'RETURNED')
  const totalStockCount = items.reduce((acc, i) => acc + i.quantity, 0)
  const officeMap = new Map(offices.map((o) => [Number(o.id), o.name]))
  const itemMap = new Map(items.map((i) => [i.id, i]))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Store Keeper Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-[#0D9488] border border-teal-200">
              Central Equipment Depot
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Physical receipt, warehousing, courier dispatch, and field returns for the Department of Pensions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <PrimaryButton
            variant="outline"
            size="sm"
            onClick={() => navigate('/store/returns')}
            leftIcon={<RotateCcw className="w-4 h-4 text-[#0D9488]" />}
          >
            Process Returns
          </PrimaryButton>
          <PrimaryButton
            variant="secondary"
            size="sm"
            onClick={() => navigate('/store/deliveries')}
            leftIcon={<Truck className="w-4 h-4 text-white" />}
          >
            Incoming Deliveries
          </PrimaryButton>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Field Deployments"
          value={activeAssignments.length}
          change="Dispatched to DS offices"
          trend="neutral"
          subtitle="Currently deployed"
          icon={<Truck className="w-5 h-5" />}
          iconBg="bg-teal-50 text-[#0D9488]"
        />

        <StatCard
          title="Total Assigned Records"
          value={assignments.length}
          change="All recorded dispatches"
          trend="up"
          subtitle="Total assignments"
          icon={<PackageCheck className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-[#16A34A]"
        />

        <StatCard
          title="Inward Returned Units"
          value={returnedAssignments.length}
          change="Back in depot bay"
          trend="down"
          subtitle="Returned from field"
          icon={<RotateCcw className="w-5 h-5" />}
          iconBg="bg-amber-50 text-[#F59E0B]"
        />

        <StatCard
          title="Available Inventory Stock"
          value={totalStockCount}
          change="In depot bays"
          trend="neutral"
          subtitle="Stock items ready"
          icon={<Boxes className="w-5 h-5" />}
          iconBg="bg-blue-50 text-[#1E40AF]"
        />
      </div>

      {/* 2-Column Split: Active Deployments vs Inward Returns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Field Deployments Card */}
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Field Deployments</h3>
                <p className="text-xs text-slate-500">Hardware dispatched and deployed to Divisional Secretariats</p>
              </div>
              <Badge variant="warning" size="sm">
                {activeAssignments.length} Active
              </Badge>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <p className="text-xs text-slate-400 py-4 text-center">Loading deployments...</p>
              ) : activeAssignments.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No active field deployments currently recorded.</p>
              ) : (
                activeAssignments.slice(0, 4).map((assign) => {
                  const item = itemMap.get(String(assign.itemId))
                  const officeName = officeMap.get(assign.pensionPointId) || `DS Office #${assign.pensionPointId}`
                  return (
                    <div
                      key={assign.id}
                      className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-[#1E40AF]" />
                          <span className="font-bold text-xs text-slate-900">{officeName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">#ASG-{assign.id}</span>
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-1">
                          {item?.name || `Item #${assign.itemId}`} (Code: {item?.itemCode || 'N/A'})
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Dispatched: {assign.assignedAt ? assign.assignedAt.slice(0, 10) : 'Recent'}
                        </p>
                      </div>

                      <PrimaryButton
                        variant="success"
                        size="sm"
                        onClick={() => navigate('/store/deliveries')}
                        className="shrink-0 text-xs py-1 px-3 bg-[#16A34A] hover:bg-green-700 text-white font-bold"
                      >
                        View
                      </PrimaryButton>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <PrimaryButton
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => navigate('/store/deliveries')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Full Deliveries Registry
            </PrimaryButton>
          </div>
        </div>

        {/* Right: Inward Returns Desk Card */}
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Inward Returns Desk</h3>
                <p className="text-xs text-slate-500">Decommissioned or returned units received from DS offices</p>
              </div>
              <Badge variant="purple" size="sm">
                Intake Desk
              </Badge>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <p className="text-xs text-slate-400 py-4 text-center">Loading returned items...</p>
              ) : returnedAssignments.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No units currently returned to depot.</p>
              ) : (
                returnedAssignments.slice(0, 4).map((ret) => {
                  const item = itemMap.get(String(ret.itemId))
                  const officeName = officeMap.get(ret.pensionPointId) || `DS Office #${ret.pensionPointId}`
                  return (
                    <div
                      key={ret.id}
                      className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-purple-700" />
                          <span className="font-bold text-xs text-slate-900">{officeName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">#RET-{ret.id}</span>
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-1">
                          {item?.name || `Item #${ret.itemId}`}
                        </p>
                        <p className="text-[11px] text-slate-500 italic mt-0.5 truncate">
                          "{ret.remarks || 'Returned to depot'}"
                        </p>
                      </div>

                      <PrimaryButton
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/store/returns')}
                        className="shrink-0 text-xs py-1 px-3 border-teal-300 text-teal-700 hover:bg-teal-50"
                      >
                        Inspect
                      </PrimaryButton>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <PrimaryButton
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => navigate('/store/returns')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Returns Management
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}
