import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Typography } from '@/legacy/components/common/Typography'
import SVGIcon from '../icon/SVGIcon'

interface ButtonProps {
  text: string
  onClick: () => void
}

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title: string
  button?: ButtonProps
}

/**
 * BottomSheet 컴포넌트는 모바일 환경에서 하단의 바텀 시트를 렌더링합니다.
 *
 * @property {boolean} isOpen - 바텀 시트가 열려있는지 여부.
 * @property {function} onClose - 바텀 시트를 닫을 때 호출할 함수.
 * @property {ReactNode} children - 바텀 시트의 컨텐츠.
 * @property {string} title - 바텀 시트의 제목.
 * @property {ButtonProps} button - 바텀 시트의 버튼.
 * @returns {JSX.Element} 렌더링된 BottomSheet 컴포넌트.
 */

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children, title, button }) => {
  const sheetRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [windowHeight, setWindowHeight] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const [translateY, setTranslateY] = useState(0)

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
    }
  }, [isOpen])

  const maxHeight = windowHeight - 120
  if (!isOpen && !isClosing) return null

  return (
    <>
      {/* 오버레이 */}
      <div className={`bg-dim-8 fixed inset-0 z-[60] duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} />

      {/* 바텀 시트 */}
      <div
        ref={sheetRef}
        className="fixed right-0 bottom-0 left-0 z-[70] rounded-t-xl bg-white shadow-[0px_-4px_16px_0px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: 'transform 300ms cubic-bezier(0.33, 1, 0.68, 1)',
          maxHeight: `${maxHeight}px`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="flex items-center justify-between pt-5 pr-3 pb-3 pl-5">
          <Typography variant="title2">{title}</Typography>
          <SVGIcon.Close color="gray700" size={32} onClick={handleClose} />
        </div>

        {/* 스크롤 가능한 컨텐츠 */}
        <div ref={contentRef} className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          {children}
        </div>
        {button && (
          <div className="px-5 pt-5 pb-10">
            <button className="bg-primary-green-800 h-14 w-full rounded-lg text-white" onClick={button.onClick}>
              {button.text}
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default BottomSheet
