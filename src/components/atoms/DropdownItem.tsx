import React from 'react'
import { cn } from '@/utils/commonUtil'
import { Text } from '@/atoms/Text'

export interface DropdownItemProps {
  children: React.ReactNode
  onClick?: (e: React.MouseEvent | React.KeyboardEvent) => void
  icon?: string
  disabled?: boolean
  className?: string
}

export function DropdownItem({ children, onClick, disabled = false, className }: DropdownItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!disabled && onClick) onClick(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick(e)
    }
  }

  return (
    <div
      className={cn(
        'flex cursor-pointer items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100',
        disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="menuitem"
      tabIndex={0}
      aria-disabled={disabled}
    >
      <Text>{children}</Text>
    </div>
  )
}
