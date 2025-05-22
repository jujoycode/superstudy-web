import { cn } from '@/utils/commonUtil'

interface BoxProps {
  children: React.ReactNode
  width?: string
  height?: string
  padding?: string
  margin?: string
  className?: string
}

export function Box({ children, width, height, padding, margin, className }: BoxProps) {
  const boxWidth = width ? `w-${width}` : ''
  const boxHeight = height ? `h-${height}` : ''
  const boxPadding = padding ? `p-${padding}` : ''
  const boxMargin = margin ? `m-${margin}` : ''

  return <div className={cn(boxWidth, boxHeight, boxPadding, boxMargin, className)}>{children}</div>
}
