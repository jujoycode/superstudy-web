import { HTMLAttributes } from 'react'
import { cn } from '@/utils/commonUtil'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {}

export function Badge({ className, ...props }: BadgeProps) {
  return <span className={cn('badge', className)} {...props} />
}
