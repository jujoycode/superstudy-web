import React from 'react'
import { cn } from '@/utils/commonUtil'

export type TextWeight = 'sm' | 'md' | 'lg'
export type TextSize = 'sm' | 'md' | 'lg'
export type TextVariant = 'default' | 'dim' // | 'error' | 'success' | 'warning'

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  variant?: TextVariant
  weight?: TextWeight
  size?: TextSize
  className?: string
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const variantClasses: Record<TextVariant, string> = {
  default: 'text-black-100',
  dim: 'text-gray-500',
}

const weightClasses: Record<TextWeight, string> = {
  sm: 'font-normal',
  md: 'font-medium',
  lg: 'font-semibold',
}

const sizeClasses: Record<TextSize, string> = {
  sm: 'text-[12px]',
  md: 'text-[14px]',
  lg: 'text-[16px]',
}

export function Text({
  children,
  weight = 'md',
  size = 'md',
  variant = 'default',
  className,
  as: Component = 'p',
  ...props
}: TextProps) {
  return (
    <Component
      className={cn('font-pretendard', weightClasses[weight], sizeClasses[size], variantClasses[variant], className)}
      {...props}
    >
      {children}
    </Component>
  )
}
