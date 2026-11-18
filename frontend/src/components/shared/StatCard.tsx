import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface StatCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  iconBg?: string
  subtitle?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  iconBg = 'bg-blue-50 text-[#1E40AF]',
  subtitle,
}) => {
  return (
    <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">{value}</h3>
        </div>
        <div className={cn('p-2.5 rounded-[8px] shrink-0', iconBg)}>{icon}</div>
      </div>

      {(change || subtitle) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E2E8F0] text-xs">
          {change && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-bold',
                trend === 'up' && 'text-[#16A34A]',
                trend === 'down' && 'text-[#DC2626]',
                trend === 'neutral' && 'text-slate-500'
              )}
            >
              {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              {trend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
