import clsx from 'clsx'
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
    <div className={clsx('overflow-x-auto', classNameOuter)}>
      <div className="inline-block">
        <ul className={clsx('horizontal-scroll-view-inner', classNameInner)}>{children}</ul>
      </div>
    </div>
  )
}
