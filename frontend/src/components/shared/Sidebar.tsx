import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Calculator,
  ClipboardCheck,
  Send,
  Wrench,
  Boxes,
  Layers,
  Truck,
  RotateCcw,
  PlusCircle,
  Laptop,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

interface SidebarProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth()
  const role = user?.role || 'IT_OFFICER'

  // Configure navigation strictly per role requirements
  const getNavSections = () => {
    switch (role) {
      case 'IT_OFFICER':
        return [
          {
            title: 'CORE ALLOCATION',
            items: [
              { label: 'IT Dashboard', path: '/it-officer/dashboard', icon: LayoutDashboard },
              { label: 'Pension Points', path: '/it-officer/pension-points', icon: Calculator, badge: '1:1500 Rule' },
              { label: 'Requests Review', path: '/it-officer/requests', icon: ClipboardCheck, badge: '12' },
              { label: 'Assign Devices', path: '/it-officer/assignments', icon: Send },
            ],
          },
          {
            title: 'HARDWARE & FLEET',
            items: [
              { label: 'Maintenance Review', path: '/it-officer/maintenance', icon: Wrench, badge: '7' },
              { label: 'Items Management', path: '/inventory/items', icon: Boxes },
              { label: 'Categories', path: '/inventory/categories', icon: Layers },
            ],
          },
        ]

      case 'STORE_KEEPER':
      case 'INVENTORY_MANAGER':
        return [
          {
            title: 'LOGISTICS & DEPOT',
            items: [
              { label: 'Store Dashboard', path: '/store/dashboard', icon: LayoutDashboard },
              { label: 'Incoming Deliveries', path: '/store/deliveries', icon: Truck, badge: '2 Pending' },
              { label: 'Returns Desk', path: '/store/returns', icon: RotateCcw, badge: '3' },
            ],
          },
          {
            title: 'STOCK CONTROL',
            items: [
              { label: 'Items & Stock', path: '/inventory/items', icon: Boxes },
              { label: 'Categories', path: '/inventory/categories', icon: Layers },
            ],
          },
        ]

      case 'DS_OFFICER':
      case 'STAFF':
      default:
        return [
          {
            title: 'DS OFFICE PORTAL',
            items: [
              { label: 'Office Overview', path: '/ds-office/dashboard', icon: LayoutDashboard },
              { label: 'Request Device', path: '/ds-office/request-device', icon: PlusCircle, badge: '1:1500 Calc' },
              { label: 'Report Fault / Maintenance', path: '/ds-office/maintenance-request', icon: Wrench },
              { label: 'Office Devices & Quota', path: '/ds-office/my-devices', icon: Laptop },
              { label: 'Return Device', path: '/ds-office/return-device', icon: RotateCcw },
            ],
          },
        ]
    }
  }

  const sections = getNavSections()

  const getRoleBadge = () => {
    switch (role) {
      case 'IT_OFFICER':
        return { label: 'IT OFFICER', sub: 'Central Directorate', bg: 'bg-blue-50 text-[#1E40AF] border-blue-200' }
      case 'STORE_KEEPER':
      case 'INVENTORY_MANAGER':
        return { label: 'STORE KEEPER', sub: 'Equipment Depot', bg: 'bg-teal-50 text-[#0D9488] border-teal-200' }
      case 'DS_OFFICER':
      case 'STAFF':
      default:
        return { label: 'DS OFFICER', sub: 'Divisional Secretariat', bg: 'bg-emerald-50 text-[#16A34A] border-emerald-200' }
    }
  }

  const roleInfo = getRoleBadge()

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white border-r border-[#E2E8F0] flex flex-col select-none',
        isCollapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Top Brand Header (64px) */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#E2E8F0] shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-[8px] bg-[#1E40AF] flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-sm text-[#0F172A] tracking-tight truncate leading-tight">
                Pensions<span className="text-[#1E40AF]">IMS</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase truncate">
                Version 1.0
              </span>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Role Badge Banner */}
      {!isCollapsed ? (
        <div className="px-4 py-3 border-b border-[#E2E8F0] bg-slate-50/60 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active View</span>
            <span className={cn('px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider border', roleInfo.bg)}>
              {roleInfo.label}
            </span>
          </div>
          {/* <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E40AF]" />
            <span className="truncate">{roleInfo.sub}</span>
          </div> */}
        </div>
      ) : (
        <div className="py-2 flex justify-center border-b border-[#E2E8F0] shrink-0">
          <div className={cn('w-8 h-8 rounded flex items-center justify-center font-bold text-[10px]', roleInfo.bg)}>
            {role.substring(0, 2)}
          </div>
        </div>
      )}

      {/* Navigation Links Area */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                {sec.title}
              </div>
            )}
            {sec.items.map((item, iIdx) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={iIdx}
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 px-3 py-2 text-[13px] font-medium transition-all duration-150 rounded-md relative',
                      isActive
                        ? 'border-l-4 border-[#1E40AF] bg-[#EFF6FF] text-[#1E40AF] font-semibold pl-2.5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-[#1E40AF]" />
                  {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                  {!isCollapsed && item.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-800">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom User Profile Mini-Card & Logout */}
      <div className="p-3 border-t border-[#E2E8F0] bg-slate-50/40 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#1E40AF] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {user?.fullName || 'Authorized Officer'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user?.department || 'Pension Dept'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            title="Sign Out"
            className="w-full flex justify-center p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
