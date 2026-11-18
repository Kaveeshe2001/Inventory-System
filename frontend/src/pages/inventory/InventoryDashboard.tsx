import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Boxes,
  AlertTriangle,
  DollarSign,
  ClipboardList,
  Plus,
  ArrowRight,
  Layers,
} from 'lucide-react'
import type { InventoryItem } from '../../models/inventory'
import type { ItemRequest } from '../../models/request'
import { Badge } from '../../components/ui/Badge/Badge'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { StatCard } from '../../components/shared/StatCard'
import { formatCurrency, getItemStatusBadge, getRequestStatusBadge } from '../../utils/format'
import { inventoryService } from '../../services/InventoryService'
import { requestService } from '../../services/RequestService'
import { useToast } from '../../context/ToastContext'

export const InventoryDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { error } = useToast()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [requests, setRequests] = useState<ItemRequest[]>([])
  const [, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [itemList, reqList] = await Promise.all([
          inventoryService.getItems(),
          requestService.getAllRequests(),
        ])
        setItems(itemList)
        setRequests(reqList)
      } catch (loadError) {
        error(loadError instanceof Error ? loadError.message : 'Failed to load inventory dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [error])

  const lowStockItems = items.filter((i) => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK')
  const pendingRequests = requests.filter((r) => r.status === 'PENDING')
  const totalValuation = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
              Inventory Manager Dashboard
            </h1>
            <Badge variant="primary">Stock Control Hub</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time inventory levels, replenishment tracking, and staff request approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PrimaryButton
            variant="outline"
            size="sm"
            onClick={() => navigate('/inventory/categories')}
            leftIcon={<Layers className="w-4 h-4" />}
          >
            Categories
          </PrimaryButton>
          <PrimaryButton
            variant="primary"
            size="sm"
            onClick={() => navigate('/inventory/items')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Manage Inventory
          </PrimaryButton>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inventory Items"
          value={totalQuantity}
          change="+8.4%"
          trend="up"
          subtitle={`${items.length} unique SKUs`}
          icon={<Boxes className="w-5 h-5" />}
          iconBg="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Stock Valuation"
          value={formatCurrency(totalValuation)}
          change="+3.2%"
          trend="up"
          subtitle="Warehouse asset value"
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Low & Critical Stock"
          value={lowStockItems.length}
          trend={lowStockItems.length > 0 ? 'down' : 'neutral'}
          change={lowStockItems.length > 0 ? 'Action required' : 'Stable'}
          subtitle="Below safety threshold"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBg="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Pending Requisitions"
          value={pendingRequests.length}
          subtitle="Awaiting manager approval"
          icon={<ClipboardList className="w-5 h-5" />}
          iconBg="bg-purple-50 text-purple-600"
        />
      </div>

      {/* 2-Column Section: Low Stock Warning + Pending Staff Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical / Low Stock Alert Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Low Stock Replenishment Alerts</h3>
              <p className="text-xs text-slate-500">Items nearing or below minimum threshold</p>
            </div>
            <PrimaryButton
              variant="ghost"
              size="sm"
              onClick={() => navigate('/inventory/items')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              All Items
            </PrimaryButton>
          </div>

          <div className="divide-y divide-slate-100">
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                All inventory items are currently above minimum threshold.
              </p>
            ) : (
              lowStockItems.map((item) => {
                const badge = getItemStatusBadge(item.status)
                return (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({item.itemCode})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Location: {item.location} • Supplier: {item.supplier || 'N/A'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-bold text-slate-900">
                          {item.quantity} / {item.minThreshold} {item.unit}
                        </span>
                        <Badge variant={badge.variant} size="sm" className="block mt-0.5">
                          {badge.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Pending Requisitions Approval Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pending Staff Requisitions</h3>
              <p className="text-xs text-slate-500">Staff requests awaiting manager review</p>
            </div>
            <PrimaryButton
              variant="ghost"
              size="sm"
              onClick={() => navigate('/inventory/requests')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Approval Queue
            </PrimaryButton>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingRequests.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No pending requests. All staff requisitions have been processed!
              </p>
            ) : (
              pendingRequests.map((req) => {
                const badge = getRequestStatusBadge(req.status)
                return (
                  <div key={req.id} className="py-3 flex items-start justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {req.requestNumber}
                        </span>
                        <span className="font-bold text-slate-800">{req.itemName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Requested by <strong className="text-slate-700">{req.requestedBy}</strong> ({req.dsOfficeName || req.department})
                      </p>
                      <p className="text-[11px] text-slate-400 italic mt-0.5">"{req.reason}"</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-slate-900">{req.quantity} {req.unit}</p>
                      <Badge variant={badge.variant} size="sm" className="mt-1">
                        {badge.label}
                      </Badge>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <PrimaryButton
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => navigate('/inventory/requests')}
            >
              Open Requests Approval Queue
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}
