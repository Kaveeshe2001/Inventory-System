import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FileQuestion, Home } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { getDefaultDashboardPath } from '../../utils/auth'

export const NotFoundPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">404 - Page Not Found</h1>
        <p className="text-xs text-slate-500 mt-2">
          The page or route you are looking for does not exist in this inventory system.
        </p>

        <div className="mt-6 flex justify-center">
          <PrimaryButton
            variant="primary"
            size="sm"
            onClick={() => navigate(getDefaultDashboardPath(user?.role))}
            leftIcon={<Home className="w-4 h-4" />}
          >
            Return to Dashboard
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
