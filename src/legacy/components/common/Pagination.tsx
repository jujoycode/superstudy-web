import { range } from 'lodash'
import { HTMLAttributes } from 'react'
import { Link, LinkProps } from 'react-router'

import { useSearch } from '@/legacy/lib/router'
import { cn } from '@/legacy/lib/tailwind-merge'

import { Icon } from './icons'

interface Paginated<T> {
  items?: T[]
  total?: number
  size?: number
}

export interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
  data?: Paginated<any>
}

export function Pagination({ data, className, ...props }: PaginationProps) {
  const { page } = useSearch({ page: 1 })
  const total = data?.total ?? 0
  const size = data?.size ?? 25
  const pageSetSize = 5
  const pageCount = Math.ceil(total / size)
  const startPage = Math.floor((page - 1) / pageSetSize) * pageSetSize + 1
  const pages = range(startPage, startPage + pageSetSize).filter((p) => p <= pageCount)

  return (
    <div className={cn('flex justify-center', className)} {...props}>
      {startPage > 1 && (
        <PaginationLink to={{ search: `page=${startPage - 1}` }}>
          <Icon.ChevronLeft className="h-4 w-4" />
        </PaginationLink>
      )}
      {pages.map((p) => (
        <PaginationLink
          key={p}
          children={p}
          to={{ search: `page=${p}` }}
          className={cn(p === page && 'font-bold text-current')}
        />
      ))}
      {(pages.at(-1) ?? 1) < pageCount && (
        <PaginationLink to={{ search: `page=${startPage + pageSetSize}` }}>
          <Icon.ChevronRight className="h-4 w-4" />
        </PaginationLink>
      )}
    </div>
  )
}

export interface PaginationLinkProps extends LinkProps {}

export function PaginationLink({ className, ...props }: PaginationLinkProps) {
  return (
    <Link
      className={cn('text-14 grid h-10 w-10 place-items-center rounded-xs text-gray-500 hover:bg-gray-50', className)}
      {...props}
    />
  )
}
