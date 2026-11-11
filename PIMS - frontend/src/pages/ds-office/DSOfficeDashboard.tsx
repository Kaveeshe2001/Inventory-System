import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calculator,
  Laptop,
  PlusCircle,
  Wrench,
  Clock,
  FileText,
} from 'lucide-react'
import { INITIAL_MAINTENANCES, INITIAL_REQUESTS } from '../../utils/mockData'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { StatCard } from '../../components/shared/StatCard'
import { formatNumber } from '../../utils/format'
import { Badge } from '../../components/ui/Badge/Badge'

export const DSOfficeDashboard: React.FC = () => {
  const navigate = useNavigate()

  // Colombo DS Office specific figures
  const pensionFiles = 3240
  const eligibleDevices = 2 // Math.floor(3240 / 1500)
  const assignedDevices = 1
  const availableToRequest = 1

  const myRequests = INITIAL_REQUESTS.filter((r) => r.dsOfficeName.includes('Colombo'))
  const myMaintenance = INITIAL_MAINTENANCES.filter((m) => m.dsOfficeName.includes('Colombo'))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              DS Office Colombo Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              Western Province
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
              Your office manages <strong>3,240 active pension files</strong>. Statutory entitlement is <strong>2 devices</strong>. Currently deployed: <strong>1 device</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[11px] text-slate-500 uppercase font-bold block">Available to Request:</span>
            <span className="text-xl font-black text-[#16A34A]">1 Device</span>
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
          subtitle="Colombo Divisional cases"
          icon={<FileText className="w-5 h-5" />}
          iconBg="bg-blue-50 text-[#1E40AF]"
        />

        <StatCard
          title="Eligible Devices Quota"
          value={eligibleDevices}
          subtitle="Formula: floor(3,240 / 1,500)"
          icon={<Calculator className="w-5 h-5" />}
          iconBg="bg-teal-50 text-[#0D9488]"
        />

        <StatCard
          title="Assigned in Deployment"
          value={assignedDevices}
          subtitle="Active on counter desks"
          icon={<Laptop className="w-5 h-5" />}
          iconBg="bg-slate-100 text-slate-700"
        />

        <StatCard
          title="Pending Request"
          value={myRequests.filter((r) => r.status === 'PENDING').length}
          subtitle="Requisition #REQ-2024-018"
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
              <p className="text-xs text-slate-500">Equipment currently located at Colombo DS counters</p>
            </div>
            <Badge variant="primary" size="sm">
              1 Active Unit
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Dell Latitude 5430 Core i5 Government Edition
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Serial: DL-5430-8821 • Tag: GOV-LAP-001
                  </p>
                </div>
                <Badge variant="success" size="sm">
                  In Use
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-500">Counter 03 (Disbursements)</span>
                <button
                  onClick={() => navigate('/ds-office/maintenance-request')}
                  className="text-purple-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Report Defect</span>
                </button>
              </div>
            </div>
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
            {/* Requisition #REQ-2024-018 */}
            <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900">
                    Requisition #REQ-2024-018
                  </span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    1x Dell Latitude 5430 Workstation
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Pending IT Review
                </span>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                "Active intake counter processing 1,500+ monthly case files..."
              </p>
            </div>

            {/* Maintenance Ticket #MNT-2024-042 */}
            <div className="p-3.5 rounded-[6px] bg-purple-50/40 border border-purple-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-purple-950">
                    Maintenance Ticket #MNT-2024-042
                  </span>
                  <p className="text-[11px] text-purple-800 mt-0.5">
                    Hardware: Power failure after lightning storm
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Pending Triage
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Logged on Oct 12 • Priority: Urgent
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
