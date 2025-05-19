import clsx from 'clsx'
import React, { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import SVGIcon from './icon/SVGIcon'

interface ListProps<T> {
  headerComponent: React.ReactNode
  itemComponent: (item: T, index: number) => React.ReactNode
  page: number
  setPage?: (page: number) => void
  pageSize: number
  totalItems: number
  items: T[]
  onSelect: (item: T) => void
  itemClassName?: string
}

const FrontPaginatedList = <T,>({
  headerComponent,
  itemComponent,
  page,
  setPage,
  pageSize,
  totalItems,
  items,
  onSelect,
  itemClassName,
}: ListProps<T>) => {
  const [currentPage, setCurrentPage] = useState(page)

  const totalPages = Math.ceil(totalItems / pageSize)

  const [startPage, setStartPage] = useState(1)

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage)
      setPage?.(newPage)
    }
  }

  const handleClick = (item: T) => {
    onSelect(item)
  }

  const startIndex = (currentPage - 1) * pageSize

  const paginatedItems = items.slice(startIndex, startIndex + pageSize)

  return (
    <div className="flex min-h-[576px] w-full flex-col justify-between pb-6">
      {/* 헤더 */}

      <div className="flex h-full flex-col">
        <div className="text-15 bottom-1 flex flex-row gap-4 border-y border-gray-100 px-6 py-[9px] text-gray-500">
          {headerComponent}
        </div>

        {/* 목록 */}

        <div className="flex flex-col">
          {paginatedItems.map((item, index) => {
            const reverseIndex = totalItems - (startIndex + index)
            return (
              <div
                key={reverseIndex}
                className={twMerge(
                  'text-15 flex h-[54px] flex-row items-center gap-4 border-b border-gray-100 px-6 py-[11px] text-gray-900',
                  itemClassName,
                )}
                onClick={() => handleClick(item)}
              >
                {itemComponent(item, reverseIndex)}
              </div>
            )
          })}
        </div>
      </div>
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-auto flex items-center justify-center space-x-2 pt-6 pb-4">
          {/* 이전 버튼 */}
          <button
            onClick={() => {
              if (startPage > 1) {
                setStartPage(startPage - 10)
              }
            }}
            className={`flex h-8 w-8 items-center justify-center ${
              currentPage === 1 ? 'text-gray-400' : 'hover:rounded-md hover:bg-gray-50 hover:text-gray-700'
            }`}
            disabled={startPage === 1}
          >
            <SVGIcon.Arrow weight="bold" color="gray400" size={24} />
          </button>

          {/* 페이지 번호 */}
          {Array.from({ length: Math.min(10, totalPages - startPage + 1) }, (_, idx) => {
            const page = startPage + idx

            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={clsx(
                  'h-8 w-8 rounded-md',
                  currentPage === page
                    ? 'rounded-md bg-gray-700 text-white'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-700',
                )}
              >
                {page}
              </button>
            )
          })}

          {/* 다음 버튼 */}
          <button
            onClick={() => {
              if (startPage + 10 <= totalPages) {
                setStartPage(startPage + 10)
              }
            }}
            className={`flex h-8 w-8 items-center justify-center ${
              currentPage === totalPages ? 'text-gray-400' : 'hover:rounded-md hover:bg-gray-50 hover:text-gray-700'
            }`}
            disabled={startPage + 10 > totalPages}
          >
            <SVGIcon.Arrow weight="bold" color="gray400" size={24} rotate={180} />
          </button>
        </div>
      )}
    </div>
  )
}

export default FrontPaginatedList
