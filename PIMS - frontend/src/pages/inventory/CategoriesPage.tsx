import React, { useState } from 'react'
import {
  Plus,
  Laptop,
  Printer,
  Tablet,
  Scan,
  Zap,
  MoreVertical,
  Edit2,
  Trash2,
  Boxes,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import type { Category } from '../../models/inventory'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { Modal } from '../../components/ui/Modal/Modal'
import { Input } from '../../components/ui/Input/Input'

export const CategoriesPage: React.FC = () => {
  const { success, error } = useToast()
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  const getCategoryIcon = (code: string) => {
    switch (code) {
      case 'LAPTOP':
        return <Laptop className="w-5 h-5 text-[#1E40AF]" />
      case 'PRINT':
        return <Printer className="w-5 h-5 text-[#0D9488]" />
      case 'TABLET':
        return <Tablet className="w-5 h-5 text-purple-600" />
      case 'SCAN':
        return <Scan className="w-5 h-5 text-amber-600" />
      case 'POWER':
        return <Zap className="w-5 h-5 text-emerald-600" />
      default:
        return <Boxes className="w-5 h-5 text-slate-600" />
    }
  }

  const handleOpenAdd = () => {
    setEditingCategory(null)
    setName('')
    setCode('')
    setDescription('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat)
    setName(cat.name)
    setCode(cat.code)
    setDescription(cat.description || '')
    setActiveMenuId(null)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string, catName: string) => {
    setCategories(categories.filter((c) => c.id !== id))
    setActiveMenuId(null)
    success(`Deleted category "${catName}"`)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) {
      error('Please provide name and unique code.')
      return
    }

    if (editingCategory) {
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id ? { ...c, name, code, description } : c
        )
      )
      success(`Updated category "${name}"`)
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name,
        code: code.toUpperCase(),
        description,
        itemCount: 0,
      }
      setCategories([...categories, newCat])
      success(`Created new category "${name}"`)
    }

    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Hardware Categories
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#1E40AF] border border-blue-200">
              Asset Classifications
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Group IT equipment by government asset classification for quota quotas and distribution auditing.
          </p>
        </div>

        <PrimaryButton
          variant="primary"
          size="md"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Category
        </PrimaryButton>
      </div>

      {/* Simple Card Grid with "+ New Category" dashed card as the last tile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
          >
            <div>
              {/* Top Row: Icon + Code + Edit/Delete Menu */}
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-[8px] bg-slate-50 border border-slate-100 shrink-0">
                  {getCategoryIcon(cat.code)}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {cat.code}
                  </span>

                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === cat.id ? null : cat.id)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === cat.id && (
                      <div className="absolute right-0 mt-1 w-32 rounded-[6px] bg-white border border-[#E2E8F0] shadow-lg p-1 z-20 text-xs">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-50 flex items-center gap-2 text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Name & Description */}
              <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {cat.description || 'Government standard specification device category.'}
              </p>
            </div>

            {/* Bottom Strip: Item count */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Catalogued Assets:</span>
              <span className="font-bold text-[#1E40AF] bg-blue-50 px-2.5 py-0.5 rounded-[4px] border border-blue-100">
                {cat.itemCount} items
              </span>
            </div>
          </div>
        ))}

        {/* "+ New Category" Dashed Card as the Last Tile */}
        <div
          onClick={handleOpenAdd}
          className="rounded-[8px] border-2 border-dashed border-[#E2E8F0] hover:border-[#1E40AF] hover:bg-blue-50/20 bg-slate-50/50 p-6 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 min-h-[180px] group"
        >
          <div className="w-12 h-12 rounded-full bg-white border border-[#E2E8F0] group-hover:border-blue-300 flex items-center justify-center text-slate-400 group-hover:text-[#1E40AF] transition shadow-xs">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#1E40AF]">
              + New Category
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Create and classify additional hardware types
            </p>
          </div>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create Hardware Category'}
        description="Classify IT equipment for inventory segregation and divisional secretariat allocation."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <PrimaryButton variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </PrimaryButton>
            <PrimaryButton variant="primary" size="md" onClick={handleSave}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </PrimaryButton>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Document Scanners"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Category Code / Prefix"
            placeholder="e.g. SCAN"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            helperText="Short uppercase code used for asset barcodes."
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Operational description of equipment included in this classification..."
              className="w-full rounded-[6px] border border-[#E2E8F0] bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
