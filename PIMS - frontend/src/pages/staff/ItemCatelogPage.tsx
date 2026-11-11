import React, { useState, useEffect } from 'react'
import {
  PackagePlus,
  Search,
  CheckCircle2,
  Boxes,
  MapPin,
  Building,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import type { Category, InventoryItem } from '../../models/inventory'
import { inventoryService } from '../../services/InventoryService'
import { requestService } from '../../services/RequestService'
import { Badge } from '../../components/ui/Badge/Badge'
import { Input } from '../../components/ui/Input/Input'
import { Select } from '../../components/ui/Select/Select'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'

export const ItemCatalogPage: React.FC = () => {
  const { user } = useAuth()
  const { success, error } = useToast()

  const [items, setItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  // Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [requestQty, setRequestQty] = useState(1)
  const [requestReason, setRequestReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [itemList, catList] = await Promise.all([
        inventoryService.getItems(),
        inventoryService.getCategories(),
      ])
      setItems(itemList)
      setCategories(catList)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenRequest = (item: InventoryItem) => {
    setSelectedItem(item)
    setRequestQty(1)
    setRequestReason('')
    setIsModalOpen(true)
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem || !user) return

    if (requestQty <= 0) {
      error('Quantity must be at least 1.')
      return
    }

    if (requestQty > selectedItem.quantity) {
      error(`Requested quantity exceeds available stock (${selectedItem.quantity} ${selectedItem.unit}).`)
      return
    }

    if (!requestReason.trim()) {
      error('Please provide a justification / reason for this requisition.')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await requestService.createRequest(
        {
          itemId: selectedItem.id,
          quantity: requestQty,
          reason: requestReason.trim(),
        },
        user
      )

      success(`Requisition #${created.requestNumber} submitted for manager approval!`)
      setIsModalOpen(false)
    } catch (err: any) {
      error(err.message || 'Failed to submit requisition.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'ALL' || item.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
              Corporate Item Catalog
            </h1>
            <Badge variant="success">Staff Requisition</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse available devices, office equipment, and supplies to place a requisition order.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search items by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Categories' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
        </div>
      </div>

      {/* Item Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 p-8">
            <Boxes className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-800">No catalog items match your search.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isOutOfStock = item.quantity <= 0

            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {item.itemCode}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{item.category}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug mb-1">{item.name}</h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Location: {item.location}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Available Stock</p>
                    <p className="text-sm font-black text-slate-900 font-display">
                      {item.quantity} {item.unit}
                    </p>
                  </div>

                  <PrimaryButton
                    variant={isOutOfStock ? 'secondary' : 'primary'}
                    size="sm"
                    disabled={isOutOfStock}
                    onClick={() => handleOpenRequest(item)}
                    leftIcon={<PackagePlus className="w-4 h-4" />}
                  >
                    {isOutOfStock ? 'Out of Stock' : 'Request Item'}
                  </PrimaryButton>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Requisition Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Request Item: ${selectedItem?.name}`}
        description={`Available inventory: ${selectedItem?.quantity} ${selectedItem?.unit}`}
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleSubmitRequest}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Submit Requisition
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
            <Building className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <p className="font-semibold">Requester: {user?.fullName}</p>
              <p className="text-blue-700">Department: {user?.department}</p>
            </div>
          </div>

          <Input
            label={`Quantity to Request (Max: ${selectedItem?.quantity || 1})`}
            type="number"
            min="1"
            max={selectedItem?.quantity || 1}
            value={requestQty}
            onChange={(e) => setRequestQty(Number(e.target.value))}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Business Justification / Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder:text-slate-400"
              placeholder="e.g. Dual monitor needed for client project deliverable in Engineering lab"
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
