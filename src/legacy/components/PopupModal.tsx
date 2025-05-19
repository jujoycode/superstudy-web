import clsx from 'clsx'
import { PropsWithChildren, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

import { Typography } from './common/Typography'
import ColorSVGIcon from './icon/ColorSVGIcon'

export interface PopupModalProps {
  modalOpen: boolean
  setModalClose: () => void
  title: string
  footerButtons?: ReactNode
  size?: 'medium' | 'large'
  bottomBorder?: boolean
  ablePropragation?: boolean
  containerClassName?: string
  headerClassName?: string
  contentsClassName?: string
  footerClassName?: string
}

export function PopupModal({
  modalOpen,
  setModalClose,
  title,
  footerButtons,
  children,
  bottomBorder = true,
  size = 'medium',
  ablePropragation = false,
  containerClassName,
  headerClassName,
  contentsClassName,
  footerClassName,
}: PropsWithChildren<PopupModalProps>) {
  const sizeClass = size === 'medium' ? 'w-[632px]' : 'w-[848px]'
  return (
    <div
      className={`bg-dimmed fixed inset-0 z-60 flex h-screen w-full items-center justify-center ${
        !modalOpen && 'hidden'
      }`}
      onClick={(e) => {
        if (!ablePropragation) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      {/* 모달 창 */}
      <div
        className={twMerge(`${sizeClass} relative overflow-hidden rounded-xl bg-white px-8`, containerClassName)}
        onClick={(e) => {
          if (!ablePropragation) e.stopPropagation()
        }}
      >
        {/* 상단 고정 헤더 */}
        <div
          className={twMerge(
            '.backdrop-blur-20 sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 pt-8 pb-6',
            headerClassName,
          )}
        >
          <Typography variant="title1" className="text-gray-900">
            {title}
          </Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
        </div>

        {/* 스크롤 가능한 콘텐츠 영역 */}
        <div
          className={twMerge(
            clsx(
              `scroll-box ${footerButtons ? 'max-h-[608px]' : 'max-h-[712px]'} overflow-auto ${
                size === 'large' && 'pt-4 pb-8'
              }`,
              footerButtons || 'pb-8',
            ),
            contentsClassName,
          )}
        >
          {children}
        </div>

        {/* 하단 고정 푸터 */}
        {footerButtons && (
          <div
            className={twMerge(
              `sticky bottom-0 flex h-[104px] justify-end gap-4 ${
                bottomBorder && 'border-t border-t-gray-100'
              }bg-white/70 .backdrop-blur-20 pt-6 pb-8`,
              footerClassName,
            )}
          >
            {footerButtons}
          </div>
        )}
      </div>
    </div>
  )
}
