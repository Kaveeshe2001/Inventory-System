import React, { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Hash,
  X,
  Edit2
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import type { Category, InventoryItem } from '../../models/inventory'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { getItemStatusBadge } from '../../utils/format'
import { Badge } from '../../components/ui/Badge/Badge'
import { Modal } from '../../components/ui/Modal/Modal'
import { Input } from '../../components/ui/Input/Input'

export const ItemListPage: React.FC = () => {
  const { success, error } = useToast()
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS)
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  // Add Item Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=150&auto=format&fit=crop&q=80'
  )
  const [initialStock, setInitialStock] = useState(10)
  const [serialInput, setSerialInput] = useState('')
  const [serialNumbers, setSerialNumbers] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddSerial = () => {
    if (serialInput.trim() && !serialNumbers.includes(serialInput.trim())) {
      setSerialNumbers([...serialNumbers, serialInput.trim().toUpperCase()])
      setSerialInput('')
    }
  }

  const handleRemoveSerial = (sn: string) => {
    setSerialNumbers(serialNumbers.filter((s) => s !== sn))
  }

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      error('Please enter the hardware item name.')
      return
    }

    const matchedCat = categories.find((c) => c.id === categoryId) || categories[0]
    const newItem: InventoryItem = {
      id: `itm-${Date.now()}`,
      itemCode: `GOV-${matchedCat.code}-${Math.floor(100 + Math.random() * 900)}`,
      name,
      category: matchedCat.name,
      categoryId: matchedCat.id,
      image: imageUrl,
      quantity: Number(initialStock),
      minThreshold: 5,
      unit: 'Units',
      unitPrice: 750.0,
      status: Number(initialStock) > 5 ? 'IN_STOCK' : 'LOW_STOCK',
      location: 'Central Stores - Depot Bay A',
      serialNumbers: serialNumbers.length > 0 ? serialNumbers : [`SN-${Date.now().toString().slice(-4)}`],
      updatedAt: new Date().toISOString(),
    }

    setItems([newItem, ...items])
    setIsAddModalOpen(false)
    setName('')
    setDescription('')
    setSerialNumbers([])
    success(`Registered "${name}" into Central Inventory!`)
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      item.serialNumbers.some((s) => s.toLowerCase().includes(search.toLowerCase()))

    const matchesCategory =
      categoryFilter === 'ALL' || item.categoryId === categoryFilter || item.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Hardware & Device Inventory
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#1E40AF] border border-blue-200">
              Central Depot Stock
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            IT equipment catalog with serialized asset tracking across Divisional Secretariat allocations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Grid / Table View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-[6px] border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-[4px] transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#1E40AF] shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-[4px] transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#1E40AF] shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <PrimaryButton
            variant="primary"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Item
          </PrimaryButton>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items, SKU, or serial numbers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-white border border-[#E2E8F0] rounded-[6px] text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* View Mode: Table View */}
      {viewMode === 'table' ? (
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] text-slate-700 border-collapse">
              <thead className="bg-slate-50 text-[12px] font-semibold uppercase tracking-wider text-slate-500 border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4">Item Image</th>
                  <th className="py-3 px-4">Name & Code</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 min-w-[200px]">Serial Numbers</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] bg-white">
                {filteredItems.map((item) => {
                  const badge = getItemStatusBadge(item.status)

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#EFF6FF] transition-colors cursor-default group"
                    >
                      {/* Item Image */}
                      <td className="py-3 px-4 w-16">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-[6px] border border-slate-200"
                        />
                      </td>

                      {/* Name & Code */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span className="text-slate-900 block">{item.name}</span>
                        <span className="font-mono text-[11px] text-slate-400 font-normal">
                          {item.itemCode}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {item.category}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 font-bold text-[#1E40AF]">
                        <span className="text-base">{item.quantity}</span>{' '}
                        <span className="text-xs text-slate-500 font-normal">{item.unit}</span>
                      </td>

                      {/* Serial Numbers */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {item.serialNumbers.slice(0, 3).map((sn, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {sn}
                            </span>
                          ))}
                          {item.serialNumbers.length > 3 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                              +{item.serialNumbers.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge variant={badge.variant} size="sm">
                          {badge.label}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Edit Item Details"
                            className="p-1.5 rounded-[6px] text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View Mode: Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const badge = getItemStatusBadge(item.status)

            return (
              <div
                key={item.id}
                className="rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-36 object-cover rounded-[6px] border border-slate-100"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={badge.variant} size="sm">
                        {badge.label}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {item.itemCode}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight mt-0.5">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                  </div>

                  <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Depot Stock:</span>
                    <span className="font-bold text-[#1E40AF] text-sm">
                      {item.quantity} {item.unit}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Serialized Assets:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.serialNumbers.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{item.location}</span>
                  <PrimaryButton variant="outline" size="sm">
                    Manage
                  </PrimaryButton>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Item Modal: name, category dropdown, description, image upload, initial stock, serial numbers (multi-input) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Inventory Hardware Item"
        description="Catalog new IT devices with barcode and physical serial numbers for allocation."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <PrimaryButton variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </PrimaryButton>
            <PrimaryButton variant="primary" size="md" onClick={handleCreateItem}>
              Save to Central Stock
            </PrimaryButton>
          </div>
        }
      >
        <form onSubmit={handleCreateItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Hardware Model Name"
              placeholder="e.g. Dell Latitude 5430 Core i5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-[6px] border border-[#E2E8F0] p-2 text-xs font-semibold text-slate-900 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Technical Description & Hardware Specs
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Core i5 13th Gen, 16GB RAM, 512GB SSD, TPM 2.0 government encryption enabled..."
              className="w-full rounded-[6px] border border-[#E2E8F0] bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Image URL / Asset Photo"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />

            <Input
              label="Initial Stock Quantity"
              type="number"
              min="1"
              value={initialStock}
              onChange={(e) => setInitialStock(Number(e.target.value))}
              required
            />
          </div>

          {/* Serial Numbers (Multi-Input Tag System) */}
          <div className="space-y-1.5 p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Hardware Serial Numbers (Multi-Input Tags)
            </label>
            <p className="text-[11px] text-slate-400">
              Type serial number and press "Add Tag" or Enter:
            </p>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="e.g. DL-5430-9901"
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSerial()
                  }
                }}
                className="flex-1 rounded-[6px] border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
              />
              <PrimaryButton type="button" variant="outline" size="sm" onClick={handleAddSerial}>
                Add Tag
              </PrimaryButton>
            </div>

            {/* Rendered Serial Number Pills */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {serialNumbers.map((sn) => (
                <span
                  key={sn}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-100 text-[#1E40AF] font-mono text-xs font-bold"
                >
                  <Hash className="w-3 h-3 text-[#1E40AF]" />
                  <span>{sn}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSerial(sn)}
                    className="hover:text-red-700 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {serialNumbers.length === 0 && (
                <span className="text-[11px] text-slate-400 italic">No serial tags added yet.</span>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
