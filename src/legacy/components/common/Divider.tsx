import { HTMLAttributes } from 'react'

import { cn } from '@/legacy/lib/tailwind-merge'

interface DividerProps extends HTMLAttributes<HTMLHRElement> {}

export function Divider({ className, ...props }: DividerProps) {
  return <hr className={cn('h-px border-0 bg-gray-100', className)} {...props} />
}
