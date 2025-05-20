import { cn } from '@/utils/commonUtil'
import { TdHTMLAttributes } from 'react'

interface Td2Props extends TdHTMLAttributes<HTMLTableCellElement> {}

export function Td2({ className, ...props }: Td2Props) {
  return <td className={cn('w-16 border border-gray-900 text-center text-sm', className)} {...props} />
}
