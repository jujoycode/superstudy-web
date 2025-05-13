import clsx from 'clsx'
import React, { useCallback, useEffect, useRef, useState, type HTMLAttributes } from 'react'
import { Link } from 'react-router'

import { makeDateToString } from '@/legacy/util/time'

const tooltipBaseClasses =
  'z-50 inline-flex items-center justify-center rounded-md px-3 py-1 font-semibold transition-opacity duration-300 ease-in-out border border-neutral-400'

const variantClasses = {
  primary: 'bg-slate-900 text-white',
  secondary: 'bg-blue-50 text-blue-700',
}

const sizeClasses = {
  medium: 'min-h-7 text-sm',
  small: 'min-h-6 text-xs',
}

const placementClasses = {
  top: 'left-1/2 top-[calc(0%-0.75rem)] -translate-x-1/2',
  right: 'left-[calc(100%+0.75rem)] top-1/2 -translate-y-1/2',
  bottom: 'left-1/2 -translate-x-1/2',
  left: 'right-[calc(100%+0.75rem)] top-1/2 -translate-y-1/2',
}

export interface TooltipVariants {
  variant?: 'primary' | 'secondary'
  size?: 'medium' | 'small'
  placement?: 'top' | 'bottom' | 'left' | 'right'
  showArrow?: boolean
}

export interface TooltipProps extends HTMLAttributes<HTMLDivElement>, TooltipVariants {
  containerClassName?: string
  data?: TooltipData[]
  moveTo?: TooltipMoveTo
}

export interface TooltipData {
  days: number
  doc: string
  id: number
  startAt: string
}

export interface TooltipMoveTo {
  to: string
  title: string
}

/**
 * @param placement - 출력 위치 (top, bottom, left, right)
 * @param size - Tooltip 크기 (small, medium)
 * @param variant - Tooltip 스타일 (primary, secondary)
 * @param containerClassName - 부모 컨테이너 클래스 name
 * @param className - Tooltip 클래스 name
 * @param children - Tooltip을 활성화 하기 위한 요소(ex. button, div)
 * @param data - Tooltip 내부에 출력할 배열 (현재는 {name, url, className})
 */

const TooltipButton: React.FC<TooltipProps> = React.memo(
  ({
    placement = 'bottom',
    size = 'medium',
    variant = 'primary',
    showArrow = true,
    children,
    className,
    containerClassName,
    data,
    moveTo,
    ...rest
  }) => {
    const [isVisible, setIsVisible] = useState(false)
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    const childrenRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          childrenRef.current &&
          !childrenRef.current.contains(event.target as Node)
        ) {
          setIsVisible(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isVisible])

    const tooltipClassNames = clsx(
      tooltipBaseClasses,
      variantClasses[variant],
      sizeClasses[size],
      placementClasses[placement],
      className,
    )

    const handleClick = useCallback(() => {
      setIsVisible(!isVisible)
    }, [isVisible])

    return (
      <div className={clsx('tooltip-container relative inline-block whitespace-nowrap', containerClassName)}>
        <div className="peer cursor-pointer" onClick={handleClick} ref={childrenRef}>
          {children}
        </div>
        {isVisible && (
          <span role="tooltip" className={`absolute mt-1 ${tooltipClassNames}`} {...rest} ref={dropdownRef}>
            {data !== undefined &&
              (Array.isArray(data) && data.length > 0 ? (
                data.map((item: TooltipData) => (
                  <Link
                    className={`transition-all hover:bg-white hover:text-slate-900`}
                    to={`/teacher/absent/${item.id}`}
                    key={item.id}
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                  >
                    [{item.doc}] {makeDateToString(item.startAt)} ({item.days}일)
                  </Link>
                ))
              ) : (
                <p>유효한 데이터가 없습니다.</p>
              ))}

            {moveTo !== undefined && (
              <Link
                className={`transition-all hover:bg-white hover:text-slate-900`}
                to={moveTo?.to || ''}
                onClick={(e) => e.stopPropagation()}
                target="_blank"
              >
                {moveTo?.title}
              </Link>
            )}
          </span>
        )}
      </div>
    )
  },
)

TooltipButton.displayName = 'TooltipButton'
export { TooltipButton }
