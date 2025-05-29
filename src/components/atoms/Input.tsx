import React, { useRef } from 'react'
import { cn } from '@/utils/commonUtil'

export interface InputProps {
  value: string
  disabled?: boolean
  placeholder?: string
  tabIndex?: number
  width?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export interface FileInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  accept?: string
  multiple?: boolean
  disabled?: boolean
  tabIndex?: number
  width?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
}

const sizeOptions = {
  sm: 'h-8 text-[14px] placeholder:text-[14px] placeholder:font-semibold placeholder:text-gray-400',
  md: 'h-10 text-[15px] placeholder:text-[15px] placeholder:font-semibold placeholder:text-gray-400',
  lg: 'h-12 text-[16px] placeholder:text-[16px] placeholder:font-semibold placeholder:text-gray-400',
}

export function Input({
  value,
  onChange,
  onKeyDown,
  disabled,
  placeholder,
  tabIndex = 0,
  width = 'full',
  size = 'md',
  className,
}: InputProps) {
  return (
    <input
      value={value}
      tabIndex={tabIndex}
      placeholder={placeholder}
      disabled={disabled}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className={cn('rounded-md', 'pl-[8px]', sizeOptions[size], width && `w-${width}`, className)}
    />
  )
}

const FileInput = ({
  onChange,
  accept,
  multiple,
  disabled,
  tabIndex = 0,
  width = 'full',
  size = 'md',
  className,
  children,
}: FileInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div
      className={cn(
        'flex cursor-pointer items-center justify-center rounded-md',
        sizeOptions[size],
        width && `w-${width}`,
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick(e as unknown as React.MouseEvent)
        }
      }}
      tabIndex={tabIndex}
      role="button"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
        tabIndex={-1}
      />
      {children || <span className="text-gray-500">파일 선택</span>}
    </div>
  )
}

Input.File = FileInput
