import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../../utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const PrimaryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // 8px radius per design system, smooth focus states
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer select-none shadow-xs'

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
      md: 'text-sm px-4 py-2 gap-2 min-h-[38px]',
      lg: 'text-base px-5 py-2.5 gap-2.5 min-h-[44px]',
    }

    const variantStyles = {
      primary:
        'bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-sm focus:ring-[#1E40AF] border border-transparent',
      secondary:
        'bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-sm focus:ring-[#0D9488] border border-transparent',
      outline:
        'bg-white hover:bg-slate-50 text-slate-700 border border-[#E2E8F0] hover:border-slate-300 focus:ring-[#1E40AF]',
      danger:
        'bg-[#DC2626] hover:bg-red-700 text-white shadow-sm focus:ring-red-600 border border-transparent',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 focus:ring-slate-300 shadow-none',
      success:
        'bg-[#16A34A] hover:bg-green-700 text-white shadow-sm focus:ring-green-600 border border-transparent',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

PrimaryButton.displayName = 'Button'
