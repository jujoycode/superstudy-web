import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils/commonUtil'

export interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
  menuClassName?: string
  align?: 'left' | 'right'
  width?: number
}

export function Dropdown({ trigger, children, className, menuClassName, align = 'left', width = 200 }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className={cn('relative inline-block', className)} ref={dropdownRef} onKeyDown={handleKeyDown}>
      <div onClick={handleToggle} tabIndex={0} role="button" aria-haspopup="true" aria-expanded={isOpen}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'ring-opacity-5 absolute z-10 mt-1 rounded-md bg-white shadow-lg ring-1 ring-black',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName,
          )}
          style={{ width: `${width}px` }}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  )
}
