import React from 'react'
import { cn } from '@/utils/commonUtil'

export type TextWeight = 'sm' | 'md' | 'lg'
export type TextSize = 'xs' | 'sm' | 'md' | 'lg'
export type TextVariant = 'default' | 'sub' | 'dim' // | 'error' | 'success' | 'warning'

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  variant?: TextVariant
  weight?: TextWeight
  size?: TextSize
  className?: string
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  copyable?: boolean
  wrap?: boolean
}

const variantOptions: Record<TextVariant, string> = {
  default: 'text-gray-900',
  sub: 'text-gray-700',
  dim: 'text-gray-500',
}

const weightOptions: Record<TextWeight, string> = {
  sm: 'font-normal',
  md: 'font-medium',
  lg: 'font-semibold',
}

const sizeOptions: Record<TextSize, string> = {
  xs: 'text-[12px]',
  sm: 'text-[14px]',
  md: 'text-[15px]',
  lg: 'text-[16px]',
}

export function Text({
  children,
  weight = 'md',
  size = 'md',
  variant = 'default',
  className,
  as: Component = 'p',
  copyable = true,
  wrap = true,
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(
        'font-pretendard',
        weightOptions[weight],
        sizeOptions[size],
        variantOptions[variant],
        !copyable && 'notSelectable',
        !wrap && 'whitespace-nowrap',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
