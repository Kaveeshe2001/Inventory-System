import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Bell,
  Search,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const Navbar: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)

  // Generate dynamic breadcrumb from location path
  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean)
    if (parts.length === 0) return ['Dashboard']
    return parts.map((p) =>
      p
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    )
  }

  const breadcrumbs = getBreadcrumbs()

  const getRoleLabel = () => {
    if (!user?.role) return 'Staff'
    if (user.role === 'IT_OFFICER') return 'IT Officer'
    if (user.role === 'STORE_KEEPER' || user.role === 'INVENTORY_MANAGER') return 'Store Keeper'
    if (user.role === 'DS_OFFICER') return 'DS Officer'
    return user.role
  }

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md px-6 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Left: Breadcrumbs & Search */}
      <div className="flex items-center gap-6 flex-1 max-w-2xl">
        {/* Breadcrumb Trail */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium whitespace-nowrap">
          <span className="text-slate-400">Pensions IMS</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className="text-slate-300">/</span>
              <span className={idx === breadcrumbs.length - 1 ? 'font-bold text-[#1E40AF]' : 'text-slate-600'}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search DS offices, items, serial numbers..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF] focus:bg-white transition"
          />
        </div>
      </div>

      {/* Right: Read-Only Role Badge + Notifications + User Avatar */}
      <div className="flex items-center gap-3">
        {/* Authenticated Role Badge (Display Only - Determined by Credentials) */}
        {user?.role && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-blue-100 bg-blue-50/60 text-xs font-semibold text-[#1E40AF]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span className="text-slate-500 font-medium">Role:</span>
            <span className="font-bold">{getRoleLabel()}</span>
          </div>
        )}

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-[6px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative cursor-pointer"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC2626]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-[12px] bg-white border border-[#E2E8F0] shadow-xl p-3 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  3 New
                </span>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                <div className="p-2 rounded bg-blue-50/50 border border-blue-100 text-xs">
                  <p className="font-semibold text-slate-800">New Requisition #REQ-2024-018</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">DS Office Colombo requested 1 Dell Laptop.</p>
                  <p className="text-[10px] text-slate-400 mt-1">15 mins ago</p>
                </div>
                <div className="p-2 rounded bg-amber-50/50 border border-amber-100 text-xs">
                  <p className="font-semibold text-slate-800">Low Stock Alert: Tablets</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Samsung Tab S9 FE inventory down to 4 units.</p>
                  <p className="text-[10px] text-slate-400 mt-1">2 hours ago</p>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100 text-xs">
                  <p className="font-semibold text-slate-800">Maintenance Scheduled</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Ticket #MNT-2024-041 technician assigned for Oct 15.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Yesterday</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
          <div className="w-8 h-8 rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.fullName || user?.username || 'User'}</p>
            <p className="text-[10px] text-slate-500">{user?.department || 'Pension Dept'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
