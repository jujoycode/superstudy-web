import { cn } from '@/utils/commonUtil'

interface ScrollAreaProps {
  className?: string
  children?: React.ReactNode
  scrollbarThumb?: string // 스크롤바 thumb 색상 (예: 'gray-300')
  scrollbarTrack?: string // 스크롤바 track 색상 (예: 'transparent')
}

export function ScrollArea({ className, children }: ScrollAreaProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }

  return (
    <div
      className={cn(
        'overflow-y-auto',
        'h-full',
        'bg-transparent',
        '[&::-webkit-scrollbar]:w-1',
        '[&::-webkit-scrollbar]:bg-transparent',
        '[&::-webkit-scrollbar-track]:bg-transparent',
        '[&::-webkit-scrollbar-thumb]:bg-gray-400',
        '[&::-webkit-scrollbar-thumb]:rounded-full',
        '[&::-webkit-scrollbar-thumb]:opacity-0',
        'hover:[&::-webkit-scrollbar-thumb]:opacity-100',
        'transition-opacity duration-300',
        className,
      )}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}
