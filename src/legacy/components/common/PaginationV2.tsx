import clsx from 'clsx'
import { HTMLAttributes } from 'react'

import { ResponsePaginatedIBDto } from '@/legacy/generated/model'
import { useSearch } from '@/legacy/lib/router'

import { PaginationLink } from './Pagination'
import { Typography } from './Typography'
import SVGIcon from '../icon/SVGIcon'

export interface PaginationV2Props extends HTMLAttributes<HTMLDivElement> {
  data?: ResponsePaginatedIBDto
  onPageChange: (page: number) => void
}

export default function PaginationV2({ data, onPageChange, className, ...props }: PaginationV2Props) {
  const { page } = useSearch({ page: 1 })
  const currentPage = data?.currentPage || 0
  const totalPages = data?.totalPages || 0
  // const size = data?.size ?? 100; // 페이지당 항목 수
  const displayRange = 5 // 현재 페이지 주변에 표시할 페이지 수
  const startPage = Math.max(1, currentPage - Math.floor(displayRange / 2))
  const endPage = Math.min(totalPages, startPage + displayRange - 1)

  const shouldShowStartEllipsis = startPage > 2
  const shouldShowEndEllipsis = endPage < totalPages - 1

  const pages = [
    ...(shouldShowStartEllipsis ? [1, '...'] : Array.from({ length: startPage - 1 }, (_, i) => i + 1)),
    ...Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i),
    ...(shouldShowEndEllipsis
      ? ['...', totalPages]
      : Array.from({ length: totalPages - endPage }, (_, i) => endPage + 1 + i)),
  ]

  return (
    <div className={clsx('pagination', className)} {...props}>
      {currentPage > 1 ? (
        <PaginationLink to={{ search: `page=${page - 1}` }} onClick={() => onPageChange(currentPage + 1)}>
          <SVGIcon.Arrow weight="bold" color="gray700" />
        </PaginationLink>
      ) : (
        <div className="pagination-link hover:bg-inherit">
          <SVGIcon.Arrow weight="bold" color="gray400" />
        </div>
      )}
      {pages.map((p) => (
        <PaginationLink
          key={p}
          to={{ search: `page=${p}` }}
          className={clsx(p === page && 'font-bold text-current')}
          onClick={() => onPageChange(Number(p))}
        >
          <Typography
            variant="body3"
            className={clsx(
              'flex h-8 w-8 items-center justify-center rounded-md',
              p === page && 'bg-gray-700 text-white',
            )}
          >
            {p}
          </Typography>
        </PaginationLink>
      ))}
      {currentPage < totalPages ? (
        <PaginationLink to={{ search: `page=${page + 1}` }} onClick={() => onPageChange(currentPage + 1)}>
          <SVGIcon.Arrow weight="bold" color="gray700" rotate={180} />
        </PaginationLink>
      ) : (
        <div className="pagination-link hover:bg-inherit">
          <SVGIcon.Arrow weight="bold" color="gray400" rotate={180} />
        </div>
      )}
    </div>
  )
}
