import { cn } from '@/utils/commonUtil'

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  checked?: boolean
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary'
}

export function Radio({ className, checked, disabled, size = 'sm', color = 'primary', ...props }: RadioProps) {
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
      type="radio"
      className={cn(
        'cursor-pointer rounded-full border border-gray-300 bg-white focus:ring-0 focus:ring-offset-0',
        sizeClasses[size],
        colorClasses[color],
        disabled && 'disabled:cursor-not-allowed checked:disabled:bg-gray-300',
        className,
      )}
      checked={checked}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
}
