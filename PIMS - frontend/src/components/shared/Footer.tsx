import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white py-4 px-6 text-xs text-slate-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">InventTrack Enterprise v2.4</span>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Spring Boot 21 Connected</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span>Role-Based Access Control Active</span>
          <span>•</span>
          <span>© 2026 Itrowin Inventory System. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
