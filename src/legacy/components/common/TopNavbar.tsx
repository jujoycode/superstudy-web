import { HTMLAttributes, ReactElement } from 'react'

import { cn } from '@/legacy/lib/tailwind-merge'

interface TopNavbarProps extends HTMLAttributes<HTMLElement> {
  title?: string
  left?: ReactElement
  right?: ReactElement
  position?: 'sticky' | 'fixed'
  borderless?: boolean
  backgroundColor?: 'transparent' | 'white'
  leftFlex?: 'flex-1' | 'flex-none'
  rightFlex?: 'flex-1' | 'flex-none'
}

export function TopNavbar({
  title,
  left,
  right,
  position = 'sticky',
  borderless = false,
  backgroundColor = 'white',
  leftFlex = 'flex-1',
  rightFlex = 'flex-1',
  className,
  ...props
}: TopNavbarProps) {
  const positionAdditional = position === 'sticky' ? 'top-0' : 'top-0 left-0 right-0'
  const border = borderless ? 'border-0' : 'border-b'
  const hasLineBreak = title?.includes('\r\n')
  const titleClass = hasLineBreak
    ? 'whitespace-pre-line text-md'
    : 'text-lg whitespace-nowrap overflow-hidden text-ellipsis'

  return (
    <nav
      className={cn(
        'h-fixed-top z-50 flex h-15 items-center px-2',
        position,
        positionAdditional,
        border,
        `bg-${backgroundColor}`,
        className,
      )}
      {...props}
    >
      <div className={`${leftFlex} flex min-w-0 items-center`}>{left}</div>
      <h1 className={`min-w-0 flex-1 px-2 text-center font-semibold text-gray-800 ${titleClass}`}>{title}</h1>
      <div className={`${rightFlex} flex min-w-0 flex-row-reverse items-center`}>{right}</div>
    </nav>
  )
}
