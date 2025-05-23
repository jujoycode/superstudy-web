import { cn } from '@/utils/commonUtil'

export interface FlexProps {
  children: React.ReactNode
  className?: string
  width?: 'full' | 'fit-content'
  direction?: 'row' | 'col'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  items?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  gap?: string
  wrap?: boolean
  onClick?: () => void
}

export function Flex({
  children,
  className,
  width = 'full',
  direction = 'row',
  justify = 'start',
  items = 'start',
  gap,
  wrap,
  onClick,
}: FlexProps) {
  const flexWidth = width ? `w-${width}` : ''
  const flexDirection = { row: 'flex-row', col: 'flex-col' }[direction]

  const flexJustify = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }[justify]

  const flexItems = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  }[items]

  const flexGap = gap ? `gap-${gap}` : ''
  const flexWrap = wrap ? 'flex-wrap' : ''

  return (
    <div
      className={cn('flex', flexDirection, flexJustify, flexItems, flexGap, flexWrap, flexWidth, className)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
