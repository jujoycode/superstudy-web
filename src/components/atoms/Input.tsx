import { cn } from '@/utils/commonUtil'

export interface InputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
}

export function Input({ value, onChange, placeholder, className }: InputProps) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      tabIndex={0}
      className={cn('rounded-md', 'pl-[8px] placeholder:text-[15px]', className)}
    />
  )
}
