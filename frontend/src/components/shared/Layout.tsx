import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export const Layout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-[#0F172A]">
      {/* 260px fixed / 72px collapsible Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-[72px]' : 'pl-[260px]'
        }`}
      >
        {/* Top Navbar (64px) */}
        <Navbar />

        {/* Main Content (24px padding, max-width 1400px fluid) */}
        <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
