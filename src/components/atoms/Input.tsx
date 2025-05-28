import { cn } from '@/utils/commonUtil'

export interface InputProps {
  value: string
  disabled?: boolean
  placeholder?: string
  tabIndex?: number
  width?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

const sizeOptions = {
  sm: 'h-8 text-[14px] placeholder:text-[14px]',
  md: 'h-10 text-[15px] placeholder:text-[15px]',
  lg: 'h-12 text-[16px] placeholder:text-[16px]',
}

export function Input({
  value,
  onChange,
  onKeyDown,
  disabled,
  placeholder,
  tabIndex = 0,
  width = 'full',
  size = 'md',
  className,
}: InputProps) {
  return (
    <input
      value={value}
      tabIndex={tabIndex}
      placeholder={placeholder}
      disabled={disabled}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className={cn('rounded-md', 'pl-[8px]', sizeOptions[size], width && `w-${width}`, className)}
    />
  )
}
