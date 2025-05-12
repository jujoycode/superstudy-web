import { InputHTMLAttributes } from 'react'
import { cn } from '@/legacy/lib/tailwind-merge'

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch?: () => void
}

export function SearchInput({ onSearch, className, ...props }: SearchInputProps) {
  return (
    <input
      className={cn('focus:border-brand-1 rounded-full border border-gray-200 placeholder:text-gray-400', className)}
      onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
      {...props}
    />
  )
}
