import { cn } from '@/utils/commonUtil'
import { PropsWithChildren } from 'react'

interface HorizontalScrollViewProps {
  classNameOuter?: string
  classNameInner?: string
}

export function HorizontalScrollView({
  classNameOuter,
  classNameInner,
  children,
}: PropsWithChildren<HorizontalScrollViewProps>) {
  return (
    <div className={cn('overflow-x-auto', classNameOuter)}>
      <div className="inline-block">
        <ul className={cn('horizontal-scroll-view-inner', classNameInner)}>{children}</ul>
      </div>
    </div>
  )
}
