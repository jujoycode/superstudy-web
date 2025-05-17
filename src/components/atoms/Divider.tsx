type DividerProps = {
  variant?: 'full' | 'half' | 'quarter'
  color?: string
  marginY?: string
  marginX?: string
  thickness?: string
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function Divider({
  variant = 'full',
  color = 'bg-gray-200',
  marginY = 'my-2',
  marginX = 'mx-2',
  thickness = 'h-px',
  className = '',
  orientation = 'horizontal',
}: DividerProps) {
  const widthClass = variant === 'full' ? 'w-full' : variant === 'half' ? 'w-1/2' : 'w-1/4'
  const heightClass = variant === 'full' ? 'h-full' : variant === 'half' ? 'h-1/2' : 'h-1/4'

  const dimensionClass = orientation === 'horizontal' ? widthClass : heightClass
  const marginClass = orientation === 'horizontal' ? marginY : marginX
  const thicknessClass = orientation === 'horizontal' ? thickness : 'w-px'

  return (
    <div
      className={`${dimensionClass} ${thicknessClass} ${color} ${marginClass} ${className}`}
      role="separator"
      aria-orientation={orientation}
    />
  )
}
