import { ReactNode, CSSProperties } from 'react'
import clsx from 'clsx'

export type ContainerProps = {
  children: ReactNode
  className?: string
  flex?: boolean
  height?: 'full' | 'screen'
  width?: string
  direction?: 'row' | 'col'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  items?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  gap?: string
  wrap?: boolean
  paddingX?: string
  paddingY?: string
  noPadding?: boolean
}

export function Container({
  children,
  className = '',
  flex = false,
  height = 'full',
  width = 'full',
  direction = 'col',
  justify,
  items,
  gap,
  wrap = false,
  paddingX = '4',
  paddingY,
  noPadding = false,
}: ContainerProps) {
  const isPxWidth = width?.endsWith('px')
  const widthClass = isPxWidth ? '' : `w-${width}`
  const style: CSSProperties = isPxWidth ? { width } : {}

  const paddingClass = noPadding
    ? 'p-0'
    : [paddingX && `px-${paddingX}`, paddingY && `py-${paddingY}`].filter(Boolean).join(' ')

  const flexClasses = flex
    ? [
        'flex',
        height && `h-${height}`,
        direction && `flex-${direction}`,
        justify && `justify-${justify}`,
        items && `items-${items}`,
        gap && `gap-${gap}`,
        wrap && 'flex-wrap',
      ]
        .filter(Boolean)
        .join(' ')
    : ''

  return (
    <div className={clsx(widthClass, paddingClass, flexClasses, className)} style={style}>
      {children}
    </div>
  )
}
