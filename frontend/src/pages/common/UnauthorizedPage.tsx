import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { useAuth } from '../../context/AuthContext'
import { getDefaultDashboardPath } from '../../utils/auth'

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">403 - Access Denied</h1>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          You do not have permission to access this resource. Your assigned system role is{' '}
          <strong className="text-slate-800 font-semibold">{user?.role || 'GUEST'}</strong>.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <PrimaryButton
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </PrimaryButton>

          <PrimaryButton
            variant="primary"
            size="sm"
            onClick={() => navigate(getDefaultDashboardPath(user?.role))}
            leftIcon={<Home className="w-4 h-4" />}
          >
            Go to My Dashboard
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
