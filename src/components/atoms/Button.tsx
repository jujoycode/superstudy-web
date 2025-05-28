import React from 'react'
import { cn } from '@/utils/commonUtil'

type ButtonVariant = 'solid' | 'outline' | 'link' | 'ghost'
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

/**
 * buttonVariant
 * @desc 하단 정의된 장표에 맞춰서 정의된 버튼의 12가지 형태
 * @link [Figma](https://www.figma.com/design/pIYjkzqLRX5n3LqlVSokts)
 * @todo
 * 1. 색상 재확인 및 채도 조정 필요
 * 2. 미존재 스타일 정의 필요
 */
const buttonVariant: Record<ButtonVariant, Record<ButtonColor, string>> = {
  solid: {
    primary: 'bg-primary-800 text-white hover:bg-primary-850',
    secondary: 'bg-secondary-800 text-white hover:bg-secondary-850 hover:text-secondary-400',
    sub: 'bg-primary-100 text-primary-800 hover:bg-primary-300',
    tertiary: 'text-tertiary-600 bg-tertiary-100 hover:bg-tertiary-300',
  },
  outline: {
    primary: 'border border-primary-800 text-primary-800 hover:bg-primary-100',
    secondary: 'border border-secondary-800 text-secondary-800 hover:bg-secondary-100',
    // outline-sub는 현재 미존재, 따라서 primary와 동일한 스타일로 처리
    sub: 'border border-primary-700 text-primary-800 hover:bg-primary-100',
    tertiary: 'border border-tertiary-400 text-tertiary-600 hover:bg-tertiary-400',
  },
  link: {
    primary: 'text-gray-900 hover:text-primary-800',
    secondary: 'text-gray-900 hover:text-secondary-800',
    // link-sub는 현재 미존재, 따라서 primary와 동일한 스타일로 처리
    sub: 'text-gray-900 hover:text-primary-800',
    // link-tertiary는 현재 미존재, 따라서 primary와 동일한 스타일로 처리
    tertiary: 'text-gray-900 hover:text-primary-800',
  },
  ghost: {
    primary: 'text-gray-900 ',
    secondary: 'text-gray-900 ',
    tertiary: 'text-gray-900 ',
    sub: 'text-gray-900 ',
  },
}

const getVariant = (variant: ButtonVariant, color: ButtonColor, disabled: boolean) => {
  if (disabled) {
    return color === 'primary' ? 'bg-gray-400 text-white' : 'bg-gray-100 text-gray-400'
  }

  return buttonVariant[variant][color]
}

/**
 * Button
 * @desc variant, color, size, disabled 속성을 지원하는 버튼 컴포넌트
 * @param {ButtonProps} props
 */
function Button({
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

export { Button, buttonVariant }
