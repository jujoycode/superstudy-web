import { type FC } from 'react'
import { twMerge } from 'tailwind-merge'

interface TableProps {
  headers?: string[]
  isLoading?: boolean
  isError?: boolean
  className?: string
  headerColor?: string
  children: React.ReactNode
}

export const Table: FC<TableProps> = ({ headers, isLoading, isError, children, className, headerColor }) => {
  return (
    <table className={twMerge('text-10 w-full border-separate border-spacing-0 text-center md:text-sm', className)}>
      {headers && (
        <thead>
          <tr className="sticky top-0 z-10 bg-white">
            {headers.map((header, i) => (
              <th
                key={`${header}${i}`}
                className={twMerge('border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px]', headerColor)}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {isLoading && (
          <tr>
            <td className="py-4 text-center" colSpan={6}>
              로딩 중...
            </td>
          </tr>
        )}
        {isError && (
          <tr>
            <td className="py-4 text-center" colSpan={6}>
              데이터를 불러오지 못했습니다. 잠시 후 다시 접속해주세요.
            </td>
          </tr>
        )}
        {children}
      </tbody>
    </table>
  )
}
