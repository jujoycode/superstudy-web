import React from 'react'
import { cn } from '@/utils/commonUtil'

type ButtonVariant = 'solid' | 'outline' | 'link'
type ButtonColor = 'primary' | 'secondary' | 'sub' | 'tertiary'
type ButtonSize = 'sm' | 'md' | 'lg' | 'full'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: ButtonVariant
  color?: ButtonColor
  size?: ButtonSize
  disabled?: boolean
  className?: string
}

const sizeOptions: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[12px] rounded-[6px]',
  md: 'h-10 px-4 text-[14px] rounded-[8px]',
  lg: 'h-12 px-6 text-[16px] rounded-[8px]',
  full: 'h-10 w-full rounded-[8px]',
}

const variantClasses: Record<ButtonVariant, Record<ButtonColor, string>> = {
  solid: {
    primary: 'bg-primary-800 text-white hover:bg-primary-850 active:bg-primary-850',
    secondary: 'bg-secondary-800 text-white hover:bg-secondary-850 active:bg-secondary-850',
    sub: 'bg-primary-100 text-primary-800 hover:bg-primary-400 active:bg-primary-800',
    tertiary: 'text-tertiary-600 bg-tertiary-100 hover:bg-tertiary-300 active:bg-tertiary-300',
  },
  outline: {
    primary: 'border border-primary-700 text-primary-800 hover:bg-primary-100 active:bg-primary-100',
    secondary: 'border border-secondary-700 text-secondary-800 hover:bg-secondary-100 active:bg-secondary-100',
    // outline-sub는 현재 미존재, 따라서 primary와 동일한 스타일로 처리
    sub: 'border border-primary-700 text-primary-800 hover:bg-primary-100 active:bg-primary-100',
    tertiary: 'border border-tertiary-400 text-tertiary-600 hover:bg-tertiary-400 active:bg-tertiary-400',
  },
  link: {
    primary: 'text-gray-900 hover:text-primary-800',
    secondary: 'text-gray-900 hover:text-secondary-800',
    // link-sub는 현재 미존재, 따라서 primary와 동일한 스타일로 처리
    sub: 'text-gray-900 hover:text-primary-800',
    // link-tertiary는 현재 미존재, 따라서 primary와 동일한 스타일로 처리
    tertiary: 'text-gray-900 hover:text-primary-800',
  },
}

const getVariant = (variant: ButtonVariant, color: ButtonColor, disabled: boolean) => {
  if (disabled) {
    return color === 'primary' ? 'bg-primary-50 text-primary-400' : 'bg-gray-100 text-gray-400'
  }
  return variantClasses[variant][color]
}

export function Button({
  children,
  variant = 'solid',
  color = 'primary',
  size = 'md',
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-pretendard cursor-pointer font-medium transition-colors duration-200',
        sizeOptions[size],
        getVariant(variant, color, disabled),
        disabled && 'cursor-not-allowed',
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
