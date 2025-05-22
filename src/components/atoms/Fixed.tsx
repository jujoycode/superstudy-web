import { cn } from '@/utils/commonUtil'

interface FixedProps {
  children: React.ReactNode
  className?: string
}

export function Fixed({ children, className }: FixedProps) {
  return <div className={cn('fixed', 'top-0', 'left-0', 'right-0', 'bottom-0', className)}>{children}</div>
}
