import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }, [removeToast])

  const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast])
  const error = useCallback((msg: string) => showToast(msg, 'error'), [showToast])
  const warning = useCallback((msg: string) => showToast(msg, 'warning'), [showToast])
  const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bg = 'bg-slate-900 text-white'
          let Icon = Info
          let iconColor = 'text-blue-400'

          if (toast.type === 'success') {
            bg = 'bg-emerald-950/90 border border-emerald-500/30 text-emerald-50 shadow-emerald-950/40'
            Icon = CheckCircle2
            iconColor = 'text-emerald-400'
          } else if (toast.type === 'error') {
            bg = 'bg-rose-950/90 border border-rose-500/30 text-rose-50 shadow-rose-950/40'
            Icon = AlertCircle
            iconColor = 'text-rose-400'
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-950/90 border border-amber-500/30 text-amber-50 shadow-amber-950/40'
            Icon = AlertTriangle
            iconColor = 'text-amber-400'
          } else {
            bg = 'bg-slate-900/90 border border-slate-700/50 text-slate-100'
            Icon = Info
            iconColor = 'text-blue-400'
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-3 ${bg}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition p-0.5 rounded"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
