import { cn } from '@/utils/commonUtil'
import { type HTMLAttributes } from 'react'

const tooltipBaseClasses =
  'absolute z-50 inline-flex items-center justify-center rounded-md px-3 py-1 font-semibold transition-opacity duration-300 ease-in-out peer-hover:block peer-focus-within:block'

const variantClasses = {
  primary: 'bg-slate-900 text-white',
  secondary: 'bg-blue-50 text-blue-700',
}

const sizeClasses = {
  medium: 'min-h-7 text-sm',
  small: 'min-h-6 text-xs',
}

const placementClasses = {
  top: 'left-1/2 -translate-x-1/2',
  right: 'left-[calc(100%+0.75rem)] top-1/2 -translate-y-1/2',
  bottom: 'left-1/2 -translate-x-1/2',
  left: 'right-[calc(100%+0.75rem)] top-1/2 -translate-y-1/2',
}

const arrowClasses = 'after:absolute after:block after:border-8 after:border-transparent'
const arrowPlacementClasses = {
  top: 'after:border-t-slate-900 after:top-full',
  bottom: 'after:border-b-slate-900 after:bottom-full',
  left: 'after:border-l-slate-900 after:left-full',
  right: 'after:border-r-slate-900 after:right-full',
}

const arrowPositionClasses = {
  top: 'after:left-1/2 after:-translate-x-1/2',
  bottom: 'after:left-1/2 after:-translate-x-1/2',
  left: 'after:top-1/2 after:-translate-y-1/2',
  right: 'after:top-1/2 after:-translate-y-1/2',
}

const sizePlacementClasses: any = {
  'medium-top': 'top-[-2.5rem]',
  'small-top': 'top-[-2.25rem]',
  'medium-bottom': 'bottom-[-2.5rem]',
  'small-bottom': 'bottom-[-2.25rem]',
}

export interface TooltipVariants {
  variant?: 'primary' | 'secondary'
  size?: 'medium' | 'small'
  placement?: 'top' | 'bottom' | 'left' | 'right'
  showArrow?: boolean
}

export interface TooltipProps extends HTMLAttributes<HTMLDivElement>, TooltipVariants {
  value: string
  containerClassName?: string
}

/**
 * @param placement - 출력 위치 (top, bottom, left, right)
 * @param size - Tooltip 크기 (small, medium)
 * @param variant - Tooltip 스타일 (primary, secondary)
 * @param containerClassName - 부모 컨테이너 클래스 name
 * @param className - Tooltip 클래스 name
 * @param children - Tooltip을 활성화 하기 위한 요소(ex. button, div)
 * @param showArrow - Tooltip 화살표 출력 여부 (기본값 true)
 */

export function Tooltip({
  placement = 'top',
  size = 'medium',
  variant = 'primary',
  showArrow = true,
  children,
  className,
  containerClassName,
  value,
  ...rest
}: TooltipProps) {
  const tooltipClassNames = cn(
    tooltipBaseClasses,
    variantClasses[variant],
    sizeClasses[size],
    placementClasses[placement],
    showArrow && arrowClasses,
    showArrow && arrowPlacementClasses[placement],
    showArrow && arrowPositionClasses[placement],
    sizePlacementClasses[`${size}-${placement}`],
    'hidden', // Initially hidden
    className,
  )

  return (
    <div className={cn('group relative inline-block whitespace-nowrap', containerClassName)}>
      <div className="peer">{children}</div>
      <span role="tooltip" className={tooltipClassNames} {...rest}>
        {value}
      </span>
    </div>
  )
}

Tooltip.displayName = 'Tooltip'
