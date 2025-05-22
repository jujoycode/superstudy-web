import { cn } from '@/utils/commonUtil'

interface FlexProps {
  children: React.ReactNode
  className?: string
  direction?: 'row' | 'col'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  items?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  gap?: string
  wrap?: boolean
}

export function Flex({
  children,
  className,
  direction = 'row',
  justify = 'start',
  items = 'start',
  gap,
  wrap,
}: FlexProps) {
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
    <div className={cn('flex', flexDirection, flexJustify, flexItems, flexGap, flexWrap, className)}>{children}</div>
  )
}
