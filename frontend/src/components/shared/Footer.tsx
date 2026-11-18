import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white py-4 px-6 text-xs text-slate-500">
      {/* <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">InventTrack Enterprise v2.4</span>
          <span className="text-slate-300">•</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 justify-center items-center">
          <span>© Inventory Management System. Department of Pensions. All rights reserved.</span>
        </div>
      </div> */}

      <div className="flex items-center gap-4 text-slate-400 justify-center items-center">
        <span>© Inventory Management System. Department of Pensions. All rights reserved.</span>
      </div>
    </footer>
  )
}
