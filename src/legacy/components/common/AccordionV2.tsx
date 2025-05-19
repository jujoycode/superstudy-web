import { PropsWithChildren, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import SVGIcon from '../icon/SVGIcon'
import { Typography } from './Typography'
import type { TypographyProps } from './Typography'

// 아코디언 Props 인터페이스
interface AccordionProps {
  tagText?: string
  title: string
  useCount?: boolean
  count?: number
  rightText?: string
  rightTextClassName?: string
  className?: string
  parentClassName?: string
  initialOpenState?: boolean
  arrowColor?: 'gray700' | 'gray400' | 'orange800' | 'white'
  setAccordionIsOpen?: (isOpen: boolean) => void
  typographyVariant?: TypographyProps['variant']
  typographyClassName?: string
}

const AccordionV2 = ({
  tagText,
  title,
  useCount = false,
  count,
  rightText,
  rightTextClassName,
  className,
  parentClassName,
  initialOpenState = false,
  arrowColor = 'gray700',
  children,
  setAccordionIsOpen,
  typographyVariant = 'body3',
  typographyClassName,
}: PropsWithChildren<AccordionProps>) => {
  const [isOpen, setIsOpen] = useState<boolean>(initialOpenState)

  const toggleAccordion = () => {
    setIsOpen(!isOpen)
    setAccordionIsOpen?.(!isOpen)
  }

  return (
    <div className={className}>
      {/* 상단 타이틀 및 열림/닫힘 아이콘 */}
      <div
        className={twMerge('flex w-full cursor-pointer items-center justify-between gap-4', parentClassName)}
        onClick={toggleAccordion}
      >
        <div className="flex gap-2">
          {tagText && (
            <Typography
              variant="caption2"
              className="flex items-center justify-center rounded border border-gray-400 px-[6px] py-[2px]"
            >
              {tagText}
            </Typography>
          )}
          <span className="flex flex-row items-center gap-1">
            <Typography variant={typographyVariant} className={typographyClassName}>
              {title}
            </Typography>
            {useCount && (
              <Typography variant="title3" className="text-primary-800">
                {count}
              </Typography>
            )}
          </span>
        </div>
        <span className="flex items-center gap-2">
          <Typography variant="title3" className={twMerge('font-medium', rightTextClassName)}>
            {rightText}
          </Typography>
          {isOpen ? (
            <SVGIcon.Arrow color={arrowColor} rotate={90} size={16} weight="bold" />
          ) : (
            <SVGIcon.Arrow color={arrowColor} rotate={270} size={16} weight="bold" />
          )}
        </span>
      </div>

      {/* 하단의 내용 */}
      {isOpen && <div>{children}</div>}
    </div>
  )
}

export default AccordionV2
