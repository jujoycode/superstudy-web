import { type TdHTMLAttributes } from 'react'

interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  innerClassName?: string
}

export function Td({ children, innerClassName, ...props }: TdProps) {
  return (
    <td className="border border-gray-900 p-2" {...props}>
      <div className={`whitespace-pre-line ${innerClassName}`}>{children}</div>
    </td>
  )
}
