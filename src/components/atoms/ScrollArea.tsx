import { cn } from '@/utils/commonUtil'

interface ScrollAreaProps {
  className?: string
  children?: React.ReactNode
  scrollbarThumb?: string // 스크롤바 thumb 색상 (예: 'gray-300')
  scrollbarTrack?: string // 스크롤바 track 색상 (예: 'transparent')
}

export function ScrollArea({
  className,
  children,
  scrollbarThumb = 'gray-300',
  scrollbarTrack = 'transparent',
}: ScrollAreaProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }

  return (
    <div
      className={cn(
        'overflow-x-auto overflow-y-auto', // 가로 및 세로 스크롤 활성화
        'scrollbar-thin', // 스크롤바 너비 조정
        'h-full',
        scrollbarThumb && `scrollbar-thumb-${scrollbarThumb}`, // thumb 색상
        scrollbarTrack && `scrollbar-track-${scrollbarTrack}`, // track 색상
        className,
      )}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}
