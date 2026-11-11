import React from 'react'
import { cn } from '../../../utils/cn'

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
}

export const Form: React.FC<FormProps> = ({ className, children, ...props }) => {
  return (
    <form className={cn('space-y-4', className)} {...props}>
      {children}
    </form>
  )
}

export const FormGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <div className={cn('space-y-1.5', className)}>{children}</div>
}

export const FormLabel: React.FC<{
  children: React.ReactNode
  htmlFor?: string
  required?: boolean
  className?: string
}> = ({ children, htmlFor, required, className }) => {
  return (
    <label htmlFor={htmlFor} className={cn('block text-xs font-semibold text-slate-700 tracking-tight', className)}>
      {children}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  )
}

export const FormError: React.FC<{ children?: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  if (!children) return null
  return <p className={cn('text-xs text-rose-600 font-medium mt-1', className)}>{children}</p>
}
