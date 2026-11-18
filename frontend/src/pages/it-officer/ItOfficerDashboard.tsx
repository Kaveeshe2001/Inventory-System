import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Calculator, Clock, Building2, Laptop, Wrench } from 'lucide-react'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { StatCard } from '../../components/shared/StatCard'
import { requestService } from '../../services/RequestService'
import { pensionService } from '../../services/PensionService'
import { assignmentService } from '../../services/AssignmentService'
import { maintenanceService } from '../../services/MaintenanceService'

export const ItOfficerDashboard: React.FC = () => {
  const navigate = useNavigate()

  const [pendingRequests, setPendingRequests] = useState(0)
  const [totalOffices, setTotalOffices] = useState(0)
  const [activeDeployments, setActiveDeployments] = useState(0)
  const [openMaintenance, setOpenMaintenance] = useState(0)

  useEffect(() => {
    Promise.all([
      requestService.getAllRequests(),
      pensionService.getAll(),
      assignmentService.getActive(),
      maintenanceService.getAll(),
    ])
      .then(([requests, offices, assignments, maintenance]) => {
        setPendingRequests(requests.filter((r) => r.status === 'PENDING').length)
        setTotalOffices(offices.length)
        setActiveDeployments(assignments.length)
        setOpenMaintenance(maintenance.filter((m) => m.status === 'PENDING' || m.status === 'IN_REPAIR').length)
      })
      .catch((err) => console.error('Failed to load IT officer dashboard KPIs', err))
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              IT Officer Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#1E40AF] border border-blue-200">
              Central IT Administration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Overseeing statutory IT device quotas across Divisional Secretariats (Allocation rule: 1 device per 1,500 active pension files).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <PrimaryButton
            variant="outline"
            size="sm"
            onClick={() => navigate('/it-officer/pension-points')}
            leftIcon={<Calculator className="w-4 h-4 text-[#1E40AF]" />}
          >
            Pension Points Registry
          </PrimaryButton>
          <PrimaryButton
            variant="primary"
            size="sm"
            onClick={() => navigate('/it-officer/assignments')}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Assign Devices
          </PrimaryButton>
        </div>
      </div>

      {/* Row 1: 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          change="Awaiting audit"
          trend="neutral"
          subtitle="Awaiting ratio review"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-amber-50 text-[#F59E0B]"
        />

        <StatCard
          title="Pension Points"
          value={totalOffices}
          change="Registered locations"
          trend="up"
          subtitle="DS offices in network"
          icon={<Building2 className="w-5 h-5" />}
          iconBg="bg-blue-50 text-[#1E40AF]"
        />

        <StatCard
          title="Active Deployments"
          value={activeDeployments}
          change="Hardware in field"
          trend="up"
          subtitle="Active counter units"
          icon={<Laptop className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-[#16A34A]"
        />

        <StatCard
          title="Maintenance Tickets"
          value={openMaintenance}
          change="Under repair / pending"
          trend="down"
          subtitle="Hardware triage"
          icon={<Wrench className="w-5 h-5" />}
          iconBg="bg-purple-50 text-purple-700"
        />
      </div>
    </div>
  )
}
