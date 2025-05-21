type DividerProps = {
  variant?: 'full' | 'half' | 'quarter'
  orientation?: 'horizontal' | 'vertical'
  color?: string
  marginY?: string
  marginX?: string
  thickness?: string
  height?: string
  className?: string
}

const widthOptions = {
  full: 'w-full',
  half: 'w-1/2',
  quarter: 'w-1/4',
} as const

const heightOptions = {
  full: 'h-full',
  half: 'h-1/2',
  quarter: 'h-1/4',
} as const

export function Divider({
  variant = 'full',
  orientation = 'horizontal',
  color = 'bg-gray-200',
  marginY = '2',
  marginX = '2',
  thickness = 'h-px',
  height = 'h-4',
  className = '',
}: DividerProps) {
  const dimensionClass = orientation === 'horizontal' ? widthOptions[variant] : height ? height : heightOptions[variant]
  const marginClass = orientation === 'horizontal' ? `my-${marginY}` : `mx-${marginX}`
  const thicknessClass = orientation === 'horizontal' ? thickness : 'w-px'

  return (
    <div
      className={`${dimensionClass} ${thicknessClass} ${color} ${marginClass} ${className}`}
      role="separator"
      aria-orientation={orientation}
    />
  )
}
