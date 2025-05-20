import { cn } from '@/utils/commonUtil'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import ColorSVGIcon from '../icon/ColorSVGIcon'
import SVGIcon from '../icon/SVGIcon'
import { Typography } from './Typography'

interface TooltipV2Props {
  position?: 'left' | 'center' | 'right'
  content: string
}

export function TooltipV2({ content }: TooltipV2Props) {
  const [open, setOpen] = useState<boolean>(false)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setTooltipStyle({
        position: 'absolute',
        top: rect.bottom + 8, // 부모 요소 아래로 8px
        left: rect.right, // 부모 요소의 오른쪽 라인에 맞춤
        transform: 'translateX(-100%)', // 툴팁이 오른쪽 끝에 맞도록 조정
      })
    }
  }, [open])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current &&
        tooltipRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [triggerRef, tooltipRef])

  // Portal의 루트 요소
  const tooltipRoot = document.getElementById('tooltip-root') || document.body

  const tooltipContent = open && (
    <div
      style={tooltipStyle}
      ref={tooltipRef}
      className={cn(
        'border-primary-400 z-10 flex w-[320px] flex-row items-start gap-2 rounded-lg border bg-white p-3 shadow-[0_4px_8px_0_#ffe8db]',
      )}
    >
      {/* Content Section */}
      <div className="flex-1">
        <Typography variant="caption2">{content}</Typography>
      </div>
      {/* Icon Section */}
      <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
        <SVGIcon.Close color="gray400" size={16} onClick={() => setOpen(!open)} className="cursor-pointer" />
      </div>
    </div>
  )

  return (
    <div className="relative" ref={triggerRef}>
      <ColorSVGIcon.ToolipBold color="gray400" size={16} onClick={() => setOpen(!open)} className="cursor-pointer" />
      {open && createPortal(tooltipContent, tooltipRoot)}
    </div>
  )
}
