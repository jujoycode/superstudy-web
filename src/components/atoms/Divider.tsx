type DividerProps = {
  variant?: 'full' | 'half' | 'quarter'
  color?: string
  marginY?: string
  thickness?: string
  className?: string
}

export function Divider({
  variant = 'full',
  color = 'bg-gray-200',
  marginY = 'my-2',
  thickness = 'h-px',
  className = '',
}: DividerProps) {
  const widthClass = variant === 'full' ? 'w-full' : variant === 'half' ? 'w-1/2' : 'w-1/4'

  return (
    <div
      className={`${widthClass} ${thickness} ${color} ${marginY} ${className}`}
      role="separator"
      aria-orientation="horizontal"
    />
  )
}
