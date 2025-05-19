import React from 'react'
import { cn } from '@/utils/commonUtil'

export type ButtonVariant = 'solid' | 'outline' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  className?: string
}

const variantOptions: Record<ButtonVariant, string> = {
  solid: 'bg-primary-800 text-white hover:bg-primary-850 active:bg-primary-850 ',
  outline: 'border border-primary-800 text-primary-800 hover:bg-primary-100 active:bg-primary-100',
  link: 'text-primary-800 hover:text-primary-850 active:text-primary-850',
}

const disabledOptions: Record<ButtonVariant, string> = {
  solid: 'disabled:bg-primary-50 disabled:text-primary-400',
  outline: 'disabled:border-gray-300 disabled:text-gray-500 disabled:hover:bg-transparent',
  link: 'disabled:text-gray-500',
}

const sizeOptions: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[12px] rounded-[6px]',
  md: 'h-10 px-4 text-[14px] rounded-[8px]',
  lg: 'h-12 px-6 text-[16px] rounded-[8px]',
}

const getSizeOptions = (variant: ButtonVariant, size: ButtonSize) => {
  if (variant === 'link') {
    switch (size) {
      case 'sm':
        return 'h-8 text-[12px] rounded-[6px]'
      case 'md':
        return 'h-10 text-[14px] rounded-[8px]'
      case 'lg':
        return 'h-12 text-[16px] rounded-[8px]'
    }
  }
  return sizeOptions[size]
}

export function Button({ children, variant = 'solid', size = 'md', className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'font-pretendard cursor-pointer font-medium transition-colors duration-200',
        variantOptions[variant],
        getSizeOptions(variant, size),
        disabled && 'cursor-not-allowed',
        disabled && disabledOptions[variant],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
