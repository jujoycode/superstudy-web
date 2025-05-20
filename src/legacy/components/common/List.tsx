import { cn } from '@/utils/commonUtil'
import { HTMLAttributes } from 'react'

interface ListProps extends HTMLAttributes<HTMLUListElement> {}

export function List({ className, ...props }: ListProps) {
  return <ul className={cn('list', className)} {...props} />
}
