import React, { useCallback, useEffect, useRef, useState } from 'react'

interface BottomSheetListSelectionProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

/**
 * BottomSheetListSelection 컴포넌트는 모바일 환경에서 하단의 목록 형태의 바텀 시트를 렌더링합니다.
 *
 * @property {boolean} isOpen - 바텀 시트가 열려있는지 여부.
 * @property {function} onClose - 바텀 시트를 닫을 때 호출할 함수.
 * @property {ReactNode} children - 바텀 시트의 컨텐츠.
 * @returns {JSX.Element} 렌더링된 BottomSheetListSelection 컴포넌트.
 */

const BottomSheetListSelection: React.FC<BottomSheetListSelectionProps> = ({ isOpen, onClose, children }) => {
  const sheetRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollTop, setScrollTop] = useState(0)
  const [windowHeight, setWindowHeight] = useState(0)
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTranslateY(windowHeight)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 300)
  }, [onClose, windowHeight])

  // 윈도우 높이 설정
  useEffect(() => {
    const updateWindowHeight = () => {
      setWindowHeight(window.innerHeight)
    }

    updateWindowHeight()
    window.addEventListener('resize', updateWindowHeight)

    return () => {
      window.removeEventListener('resize', updateWindowHeight)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
      setTranslateY(0)
      setScrollTop(0)
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none' // 터치 스크롤 방지 (iOS용)
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [isOpen])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
    if (contentRef.current) setScrollTop(contentRef.current.scrollTop)
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const currentY = e.touches[0].clientY
      const diff = currentY - startY

      // 스크롤 중이 아닐 때만 드래그 시작
      if (!isScrolling && !isDragging) {
        // 위로 스크롤 중이거나, 아래로 드래그 중일 때만 드래그 시작
        if (diff < 0 || (diff > 0 && scrollTop === 0)) {
          setIsDragging(true)
        }
      }

      if (isDragging) {
        // 이전 translateY 값에 현재 이동량을 더함
        const newTranslateY = translateY + diff

        // startY를 현재 위치로 업데이트
        setStartY(currentY)

        if (newTranslateY < 0) {
          setTranslateY(0)
        } else {
          setTranslateY(newTranslateY)
        }
      }
    },
    [isDragging, isScrolling, translateY, startY, scrollTop],
  )

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return

    setIsDragging(false)
    setIsScrolling(false)

    const sheetRect = sheetRef.current?.getBoundingClientRect()
    if (sheetRect) {
      const bottomOffset = windowHeight - sheetRect.bottom
      if (bottomOffset < 20) {
        handleClose()
      } else {
        setTranslateY(0)
      }
    }
  }, [isDragging, handleClose, windowHeight])

  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      const { scrollTop } = contentRef.current
      setScrollTop(scrollTop)
      setIsScrolling(scrollTop > 0)
    }
  }, [])

  const maxHeight = windowHeight - 340
  if (!isOpen && !isClosing) return null

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`bg-dim-8 fixed inset-0 z-[60] duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* 바텀 시트 */}
      <div
        ref={sheetRef}
        className="fixed right-0 bottom-0 left-0 z-[70] rounded-t-xl bg-white px-5 pb-10 shadow-[0px_-4px_16px_0px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.33, 1, 0.68, 1)',
          maxHeight: `${maxHeight}px`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 핸들 */}
        <div
          className="flex justify-center pt-5 pb-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="bg-primary-gray-300 h-1 w-12 rounded-3xl" />
        </div>

        {/* 스크롤 가능한 컨텐츠 */}
        <div ref={contentRef} className="flex-1 overflow-y-auto overscroll-contain" onScroll={handleScroll}>
          {children}
        </div>
      </div>
    </>
  )
}

export default BottomSheetListSelection
