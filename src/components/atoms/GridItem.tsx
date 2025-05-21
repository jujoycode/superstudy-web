import { cn } from '@/utils/commonUtil'
import { Box } from './Box'

interface GridItemProps {
  children: React.ReactNode
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full'
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
}

export function GridItem({ children, colSpan, rowSpan, className }: GridItemProps) {
  // 그리드 컬럼 스팬 클래스 매핑
  const colSpanClasses = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12',
    full: 'col-span-full',
  }

  // 그리드 로우 스팬 클래스 매핑
  const rowSpanClasses = {
    1: 'row-span-1',
    2: 'row-span-2',
    3: 'row-span-3',
    4: 'row-span-4',
    5: 'row-span-5',
    6: 'row-span-6',
  }

  return (
    <Box className={cn(colSpan && colSpanClasses[colSpan], rowSpan && rowSpanClasses[rowSpan], className)}>
      {children}
    </Box>
  )
}
