import React, { HTMLAttributes, ReactNode, useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/commonUtil'

// C-IB-021: IB 기본 레이아웃
// https://www.notion.so/superschoolofficial/C-IB-021-IB-8702e1b24cbe431685cd9ee702de3bd7

export interface ScrollRef {
  scrollToTop: () => void
}

interface LayoutProps extends HTMLAttributes<HTMLElement> {
  topContent: ReactNode
  bottomContent: ReactNode
  topBgColor?: string
  bottomBgColor?: string
  hasContour?: boolean
  floatingButton?: ReactNode
  scrollRef?: React.MutableRefObject<ScrollRef | null>
}

const IBLayout: React.FC<LayoutProps> = ({
  topContent,
  bottomContent,
  topBgColor = '',
  bottomBgColor = '',
  floatingButton,
  className,
  hasContour = true,
  scrollRef,
  ...props
}: LayoutProps) => {
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [topHeight, setTopHeight] = useState(0)

  const scrollToTop = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (scrollRef) {
      scrollRef.current = { scrollToTop }
    }
  }, [scrollRef])

  useEffect(() => {
    if (topRef.current) {
      setTopHeight(topRef.current.offsetHeight)
    }
    const handleResize = () => {
      if (topRef.current) {
        setTopHeight(topRef.current.offsetHeight)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const topElement = topRef.current
    const bottomElement = bottomRef.current

    if (topElement && bottomElement) {
      const handleScroll = () => {
        if (topElement) {
          topElement.scrollLeft = bottomElement.scrollLeft
        }
      }

      bottomElement.addEventListener('scroll', handleScroll)

      return () => {
        bottomElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  return (
    <div className={cn('flex min-h-screen w-full justify-center', className)} {...props}>
      <div className="flex w-full flex-col">
        {/* 상단 영역 */}
        <div ref={topRef} className={cn('scroll-box w-full overflow-x-auto', topBgColor)}>
          <div className="mx-auto w-[1280px]">{topContent}</div>
        </div>
        {hasContour && <div className="h-[1px] bg-gray-200"></div>}
        {/* 하단 영역 */}
        <div
          ref={bottomRef}
          className={cn('w-full overflow-x-auto overflow-y-auto', bottomBgColor, {
            'pb-40': floatingButton,
            'pb-20': !floatingButton,
          })}
          style={{ height: `calc(100vh - ${topHeight}px - 0.5px)` }}
        >
          <div className="mx-auto w-[1280px]">{bottomContent}</div>
        </div>
        {/* 하단 플로팅 영역 */}
        {floatingButton && (
          <div className="backdrop-blur-20 sticky bottom-0 left-0 z-50 flex w-full justify-center border-t border-gray-100 bg-white/70 px-52 py-5">
            <div className="flex w-full max-w-[1280px] justify-center">{floatingButton}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IBLayout
