import { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'

import { cn } from '@/legacy/lib/tailwind-merge'

export interface AdminProps {}

export function Admin({ ...props }: AdminProps) {
  return <></>
}

export interface AdminSectionProps extends HTMLAttributes<HTMLElement> {}

Admin.Section = function AdminSection({ className, ...props }: AdminSectionProps) {
  return <section className={cn('flex flex-col gap-4 px-4 py-5', className)} {...props} />
}

export interface AdminH1Props extends HTMLAttributes<HTMLHeadingElement> {}

Admin.H1 = function AdminH1({ className, ...props }: AdminH1Props) {
  return <h1 className={cn('text-18 font-bold', className)} {...props} />
}

export interface AdminH2Props extends HTMLAttributes<HTMLHeadingElement> {}

Admin.H2 = function AdminH2({ className, ...props }: AdminH2Props) {
  return <h2 className={cn('text-16 font-semibold', className)} {...props} />
}

export interface AdminH3Props extends HTMLAttributes<HTMLHeadingElement> {}

Admin.H3 = function AdminH3({ className, ...props }: AdminH3Props) {
  return <h3 className={cn('text-14 font-medium', className)} {...props} />
}

export interface AdminCardProps extends HTMLAttributes<HTMLDivElement> {}

Admin.Card = function AdminCard({ className, ...props }: AdminCardProps) {
  return <div className={cn('text-15 bg-white', className)} {...props} />
}

export interface AdminCellProps extends HTMLAttributes<HTMLDivElement> {}

Admin.Cell = function AdminCell({ className, ...props }: AdminCellProps) {
  return <div className={cn('flex flex-col p-4', className)} {...props} />
}

export interface AdminTableProps extends TableHTMLAttributes<HTMLTableElement> {}

Admin.Table = function AdminTable({ className, ...props }: AdminTableProps) {
  return <table className={cn('divide-y bg-white', className)} {...props} />
}

export interface AdminTableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {}

Admin.TableHead = function AdminTableHead({ className, ...props }: AdminTableHeadProps) {
  return <thead className={cn('', className)} {...props} />
}

export interface AdminTableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

Admin.TableBody = function AdminTableBody({ className, ...props }: AdminTableBodyProps) {
  return <tbody className={cn('divide-y', className)} {...props} />
}

export interface AdminTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  to?: string | number
}

Admin.TableRow = function AdminTableRow({ to, onClick, className, ...props }: AdminTableRowProps) {
  const { push } = useHistory()

  return (
    <tr
      onClick={to ? () => window.getSelection()?.toString() || push(`${to}`) : onClick}
      className={cn('', (to || onClick) && 'cursor-pointer hover:bg-gray-50', className)}
      {...props}
    />
  )
}

export interface AdminTableHCellEXProps extends ThHTMLAttributes<HTMLTableHeaderCellElement> {
  sortField?: string
  activeSortField?: string
  sortDirection?: 'ASC' | 'DESC'
}

Admin.TableHCellEX = function AdminTableHCellEX({
  className,
  children,
  sortField,
  activeSortField,
  sortDirection,
  ...props
}: AdminTableHCellEXProps) {
  const isActive = sortField && sortField === activeSortField

  return (
    <th
      className={cn(
        'text-14 p-2 text-start whitespace-pre text-gray-500',
        sortField && 'cursor-pointer select-none',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-1">
        {children}
        {isActive && <span className="inline-block">{sortDirection === 'ASC' ? '↑' : '↓'}</span>}
      </div>
    </th>
  )
}

export interface AdminTableHCellProps extends ThHTMLAttributes<HTMLTableCellElement> {}

Admin.TableHCell = function AdminTableHCell({ className, ...props }: AdminTableHCellProps) {
  return <th className={cn('text-14 p-2 text-start whitespace-pre text-gray-500', className)} {...props} />
}

export interface AdminTableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {}

Admin.TableCell = function AdminTableCell({ className, ...props }: AdminTableCellProps) {
  return <td className={cn('text-13 p-2 font-light', className)} {...props} />
}

export interface AdminBoxProps extends HTMLAttributes<HTMLDivElement> {}

Admin.Box = function AdminBox({ className, ...props }: AdminBoxProps) {
  return <div className={cn('', className)} {...props} />
}
