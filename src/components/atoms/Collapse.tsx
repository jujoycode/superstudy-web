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
      setHeight(0)

      contentRef.current.offsetHeight

      setTimeout(() => {
        setHeight(contentHeight)
      }, 10)

      const timer = setTimeout(() => {
        setHeight(undefined)
      }, animationDuration)

      return () => clearTimeout(timer)
    } else {
      if (contentRef.current.scrollHeight) {
        setHeight(contentRef.current.scrollHeight)

        contentRef.current.offsetHeight

        setTimeout(() => {
          setHeight(0)
        }, 10)
      } else {
        setHeight(0)
      }
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
