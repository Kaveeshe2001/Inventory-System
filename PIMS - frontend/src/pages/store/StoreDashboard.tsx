import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Truck,
  RotateCcw,
  Boxes,
  ArrowRight,
  PackageCheck,
  Building2,
} from 'lucide-react'
import { INITIAL_DELIVERIES, INITIAL_ITEMS, INITIAL_RETURNS } from '../../utils/mockData'
import { StatCard } from '../../components/shared/StatCard'
import { Badge } from '../../components/ui/Badge/Badge'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'

export const StoreDashboard: React.FC = () => {
  const navigate = useNavigate()

  const pendingDeliveries = INITIAL_DELIVERIES.filter((d) => d.status === 'PENDING_DELIVERY')
  const completedDeliveries = INITIAL_DELIVERIES.filter((d) => d.status === 'DELIVERED')
  const pendingReturns = INITIAL_RETURNS.filter((r) => r.status === 'RETURN_REQUESTED')

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
          title="Dispatches In Transit"
          value={pendingDeliveries.length}
          change="Awaiting counter receipt"
          trend="neutral"
          subtitle="Field waybills"
          icon={<Truck className="w-5 h-5" />}
          iconBg="bg-teal-50 text-[#0D9488]"
        />

        <StatCard
          title="Delivered This Month"
          value={completedDeliveries.length + 28}
          change="+18% vs last month"
          trend="up"
          subtitle="Signed acknowledgments"
          icon={<PackageCheck className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-[#16A34A]"
        />

        <StatCard
          title="Pending Inward Returns"
          value={pendingReturns.length}
          change="Inspection needed"
          trend="down"
          subtitle="DS office returns"
          icon={<RotateCcw className="w-5 h-5" />}
          iconBg="bg-amber-50 text-[#F59E0B]"
        />

        <StatCard
          title="Total Catalogued Items"
          value={INITIAL_ITEMS.reduce((acc, i) => acc + i.quantity, 0)}
          change="In depot bays"
          trend="neutral"
          subtitle="Active stock count"
          icon={<Boxes className="w-5 h-5" />}
          iconBg="bg-blue-50 text-[#1E40AF]"
        />
      </div>

      {/* 2-Column Split: Pending Deliveries vs Inward Returns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pending Deliveries Card */}
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pending Field Deliveries</h3>
                <p className="text-xs text-slate-500">Hardware dispatched, awaiting Divisional Secretariat confirmation</p>
              </div>
              <Badge variant="warning" size="sm">
                {pendingDeliveries.length} Pending
              </Badge>
            </div>

            <div className="space-y-3">
              {pendingDeliveries.map((del) => (
                <div
                  key={del.id}
                  className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-[#1E40AF]" />
                      <span className="font-bold text-xs text-slate-900">{del.dsOfficeName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">#{del.id}</span>
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-1">
                      {del.item} • Qty: {del.quantity}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Serials: {del.serialNumbers.join(', ')}
                    </p>
                  </div>

                  <PrimaryButton
                    variant="success"
                    size="sm"
                    onClick={() => navigate('/store/deliveries')}
                    className="shrink-0 text-xs py-1 px-3 bg-[#16A34A] hover:bg-green-700 text-white font-bold"
                  >
                    Confirm Delivery
                  </PrimaryButton>
                </div>
              ))}
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
                <p className="text-xs text-slate-500">Decommissioned or faulty units returned from DS offices</p>
              </div>
              <Badge variant="purple" size="sm">
                Intake Desk
              </Badge>
            </div>

            <div className="space-y-3">
              {INITIAL_RETURNS.map((ret) => (
                <div
                  key={ret.id}
                  className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-purple-700" />
                      <span className="font-bold text-xs text-slate-900">{ret.dsOfficeName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">#{ret.id}</span>
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-1">
                      {ret.deviceName} (SN: {ret.serialNumber})
                    </p>
                    <p className="text-[11px] text-slate-500 italic mt-0.5 truncate">
                      "{ret.reason}"
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
              ))}
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
