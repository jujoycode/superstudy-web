import { HTMLAttributes } from 'react'
import { cn } from '@/utils/commonUtil'

interface ListProps extends HTMLAttributes<HTMLUListElement> {}

export function List({ className, ...props }: ListProps) {
  return <ul className={cn('list', className)} {...props} />
}
