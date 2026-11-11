import React from 'react'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { cn } from '../../../utils/cn';
import { PrimaryButton } from '../Button/PrimaryButton';

export const TableContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-[8px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
        className
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <table className={cn('w-full text-left text-[13px] text-slate-700 border-collapse', className)} {...props}>
      {children}
    </table>
  )
}

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <thead
      className={cn('bg-slate-50 text-[12px] font-semibold uppercase tracking-wider text-slate-500 border-b border-[#E2E8F0]', className)}
      {...props}
    >
      {children}
    </thead>
  )
}

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <tbody className={cn('divide-y divide-[#E2E8F0] bg-white', className)} {...props}>
      {children}
    </tbody>
  )
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  isSelected?: boolean
}

export const TableRow: React.FC<TableRowProps> = ({
  className,
  isSelected = false,
  children,
  ...props
}) => {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-[#EFF6FF] cursor-default',
        isSelected ? 'bg-blue-50/80 font-medium' : '',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <th className={cn('py-3 px-4 font-semibold text-slate-700 whitespace-nowrap', className)} {...props}>
      {children}
    </th>
  )
}

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <td className={cn('py-3.5 px-4 text-slate-800 align-middle', className)} {...props}>
      {children}
    </td>
  )
}

export const TableEmpty: React.FC<{
  title?: string
  description?: string
  colSpan?: number
  action?: React.ReactNode
}> = ({
  title = 'No records found',
  description = 'There are no items matching your current filters or query.',
  colSpan = 6,
  action,
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-slate-500">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800 mb-1">{title}</h4>
          <p className="text-xs text-slate-500 mb-4">{description}</p>
          {action}
        </div>
      </td>
    </tr>
  )
}

export interface TablePaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0] bg-white">
      <div className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-700">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-700">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-700">{totalItems}</span> records
      </div>
      <div className="flex items-center gap-2">
        <PrimaryButton
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
        >
          Previous
        </PrimaryButton>
        <div className="text-xs font-medium text-slate-600 px-2">
          Page {currentPage} of {Math.max(1, totalPages)}
        </div>
        <PrimaryButton
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
        >
          Next
        </PrimaryButton>
      </div>
    </div>
  )
}
