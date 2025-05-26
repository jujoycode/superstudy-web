import { HTMLAttributes } from 'react'
import { cn } from '@/utils/commonUtil'

interface SectionProps extends HTMLAttributes<HTMLElement> {}

export function Section({ className, ...props }: SectionProps) {
  return <section className={cn('section', className)} {...props} />
}
