import { cn } from '@/utils/commonUtil'
import { ButtonHTMLAttributes } from 'react'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
}

export function Chip({ selected, className, ...props }: ChipProps) {
  return <button className={cn('chip', selected && 'chip-selected', className)} {...props} />
}
