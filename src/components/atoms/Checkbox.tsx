import { cn } from '@/utils/commonUtil'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  checked?: boolean
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Checkbox({ className, disabled, id, checked = false, size = 'sm', ...props }: CheckboxProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.currentTarget.click()
    }
  }

  return (
    <input
      type="checkbox"
      id={id}
      className={cn(
        'text-primary-800 checked:bg-primary-800 focus:ring-primary-800 rounded-sm border border-gray-300 bg-white hover:cursor-pointer',
        sizeClasses[size],
        disabled && 'disabled:cursor-not-allowed disabled:bg-gray-200',
        className,
      )}
      checked={checked}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
}
