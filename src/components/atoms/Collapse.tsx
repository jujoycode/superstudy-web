import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/commonUtil'

interface CollapseProps {
  children: React.ReactNode
  isOpen: boolean
  className?: string
  animationDuration?: number
}

export function Collapse({ children, isOpen, className, animationDuration = 300 }: CollapseProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(isOpen ? undefined : 0)

  useEffect(() => {
    if (!contentRef.current) return

    if (isOpen) {
      const contentHeight = contentRef.current.scrollHeight
      setHeight(contentHeight)

      const timer = setTimeout(() => {
        setHeight(undefined)
      }, animationDuration)

      return () => clearTimeout(timer)
    } else {
      // 닫힐 때는 먼저 현재 높이로 설정
      setHeight(contentRef.current.scrollHeight)

      // 강제 리플로우 발생
      contentRef.current.offsetHeight

      // 지연 후 높이를 0으로 설정하여 애니메이션 효과 적용
      setTimeout(() => {
        setHeight(0)
      }, 10)
    }
  }, [isOpen, animationDuration])

  return (
    <div
      ref={contentRef}
      className={cn('overflow-hidden transition-all', className)}
      style={{
        height: height === undefined ? 'auto' : `${height}px`,
        transitionDuration: `${animationDuration}ms`,
        opacity: isOpen || height ? 1 : 0,
      }}
      aria-hidden={!isOpen}
    >
      {children}
    </div>
  )
}
