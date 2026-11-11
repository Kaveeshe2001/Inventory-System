import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PackagePlus,
  Clock,
  CheckCircle2,
  Boxes,
  ArrowRight,
  ClipboardList,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type { ItemRequest } from '../../models/request'
import { requestService } from '../../services/RequestService'
import { inventoryService } from '../../services/InventoryService'
import type { InventoryItem } from '../../models/inventory'
import { Badge } from '../../components/ui/Badge/Badge'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { StatCard } from '../../components/shared/StatCard'
import { formatDate, getRequestStatusBadge } from '../../utils/format'

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [myRequests, setMyRequests] = useState<ItemRequest[]>([])
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const [reqs, allItems] = await Promise.all([
          requestService.getMyRequests(user.id),
          inventoryService.getItems(),
        ])
        setMyRequests(reqs)
        setItems(allItems)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const pendingCount = myRequests.filter((r) => r.status === 'PENDING').length
  const approvedCount = myRequests.filter((r) => r.status === 'APPROVED' || r.status === 'ASSIGNED' || r.status === 'DISPATCHED').length
  const availableItems = items.filter((i) => i.quantity > 0)

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Department Requisition Portal
            </span>
            <Badge variant="success" size="sm" className="bg-emerald-500/20 text-emerald-100 border-none">
              {user?.department}
            </Badge>
          </div>
          <h1 className="text-2xl font-black tracking-tight font-display">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Browse corporate equipment, submit item requisitions, and track order fulfillment in real-time.
          </p>
        </div>

        <PrimaryButton
          variant="secondary"
          size="md"
          onClick={() => navigate('/staff/catalog')}
          leftIcon={<PackagePlus className="w-4 h-4 text-blue-600" />}
          className="bg-white text-blue-700 hover:bg-blue-50 font-bold shrink-0 shadow-sm"
        >
          Browse Item Catalog
        </PrimaryButton>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requisitions"
          value={myRequests.length}
          subtitle="Orders placed by you"
          icon={<ClipboardList className="w-5 h-5" />}
          iconBg="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Pending Approval"
          value={pendingCount}
          subtitle="Awaiting manager review"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Approved / Dispatched"
          value={approvedCount}
          change="Ready or Delivered"
          trend="up"
          subtitle="Fulfilled orders"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Available In Stock"
          value={availableItems.length}
          subtitle="Items ready for order"
          icon={<Boxes className="w-5 h-5" />}
          iconBg="bg-purple-50 text-purple-600"
        />
      </div>

      {/* 2-Column: My Recent Requests + Popular Catalog Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requisitions List */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Recent Requests</h3>
              <p className="text-xs text-slate-500">Status of your submitted orders</p>
            </div>
            <PrimaryButton
              variant="ghost"
              size="sm"
              onClick={() => navigate('/staff/requests')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View All
            </PrimaryButton>
          </div>

          <div className="divide-y divide-slate-100">
            {myRequests.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">
                You have not submitted any requisitions yet.
              </p>
            ) : (
              myRequests.slice(0, 4).map((req) => {
                const badge = getRequestStatusBadge(req.status)
                return (
                  <div key={req.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {req.requestNumber}
                        </span>
                        <span className="font-bold text-slate-900">{req.itemName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Quantity: <strong>{req.quantity} {req.unit}</strong> • Placed {formatDate(req.createdAt)}
                      </p>
                    </div>

                    <div className="text-right">
                      <Badge variant={badge.variant} size="sm">
                        {badge.label}
                      </Badge>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Featured Available Items */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Available In Catalog</h3>
              <p className="text-xs text-slate-500">In-stock corporate equipment ready to request</p>
            </div>
            <PrimaryButton
              variant="ghost"
              size="sm"
              onClick={() => navigate('/staff/catalog')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              All Items
            </PrimaryButton>
          </div>

          <div className="divide-y divide-slate-100">
            {availableItems.slice(0, 4).map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-[11px] text-slate-500">
                    Category: {item.category} • SKU: {item.itemCode}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {item.quantity} in stock
                  </span>
                  <PrimaryButton
                    variant="outline"
                    size="sm"
                    className="text-xs py-1 px-2.5"
                    onClick={() => navigate('/staff/catalog')}
                  >
                    Request
                  </PrimaryButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
