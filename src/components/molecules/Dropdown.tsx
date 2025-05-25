import React, { useState, useRef, useEffect, createContext, useContext } from 'react'
import { cn } from '@/utils/commonUtil'

interface DropdownContextType {
  closeDropdown: () => void
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined)

export function useDropdown() {
  const context = useContext(DropdownContext)
  if (!context) {
    throw new Error('useDropdown must be used within a DropdownProvider')
  }

  return context
}

export interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
  menuClassName?: string
  align?: 'left' | 'right'
  width?: number
}

export interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function Dropdown({ trigger, children, className, menuClassName, align = 'left', width = 200 }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const closeDropdown = () => {
    setIsOpen(false)
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
            'ring-opacity-5 absolute z-10 mt-1 rounded-md bg-white shadow-lg ring-1 ring-gray-200',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName,
          )}
          style={{ width: `${width}px` }}
          role="menu"
          aria-orientation="vertical"
        >
          <DropdownContext.Provider value={{ closeDropdown }}>
            <div className="py-1">{children}</div>
          </DropdownContext.Provider>
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ children, className, onClick, ...props }: DropdownItemProps) {
  const { closeDropdown } = useDropdown()

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      onClick(e)
    }

    closeDropdown()
  }

  return (
    <div
      className={cn('cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100', className)}
      onClick={handleClick}
      role="menuitem"
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  )
}
