import { cn } from '@/utils/commonUtil'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  checked?: boolean
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary'
}

export function Checkbox({ className, disabled, checked, size = 'sm', color = 'primary', ...props }: CheckboxProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const colorClasses = {
    primary: 'checked:bg-primary-800',
    secondary: 'checked:bg-secondary-800',
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
      className={cn(
        'cursor-pointer rounded-sm bg-white not-checked:border not-checked:border-gray-300 focus:ring-0 focus:ring-offset-0',
        sizeClasses[size],
        colorClasses[color],
        disabled && 'disabled:cursor-not-allowed disabled:bg-gray-200',
        className,
      )}
      checked={checked}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      {...props}
    />
  )
}
