import { ReactNode } from 'react'

export type ContainerProps = {
  children: ReactNode
  className?: string
  flex?: boolean
  direction?: 'row' | 'col'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  items?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  gap?: string
  wrap?: boolean
}

export function Container({
  children,
  className = '',
  flex = false,
  direction = 'col',
  justify,
  items,
  gap,
  wrap = false,
}: ContainerProps) {
  const flexClasses = flex
    ? [
        'flex',
        direction && `flex-${direction}`,
        justify && `justify-${justify}`,
        items && `items-${items}`,
        gap && `gap-${gap}`,
        wrap && 'flex-wrap',
      ]
        .filter(Boolean)
        .join(' ')
    : ''

  return <div className={`mx-auto w-full max-w-xs px-4 ${flexClasses} ${className}`}>{children}</div>
}
