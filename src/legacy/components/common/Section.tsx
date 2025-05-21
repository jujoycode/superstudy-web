import { cn } from '@/utils/commonUtil'
import { HTMLAttributes } from 'react'

interface SectionProps extends HTMLAttributes<HTMLElement> {}

export function Section({ className, ...props }: SectionProps) {
  return <section className={cn('section', className)} {...props} />
}
