import { cn } from '@/utils/commonUtil'

interface ScrollAreaProps {
  className?: string
  children?: React.ReactNode
  scrollbarWidth?: 'thin' | 'none' | 'auto'
}

export function ScrollArea({ className, children, scrollbarWidth = 'thin' }: ScrollAreaProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }

  return (
    <div
      className={cn('h-screen', 'flex-1', 'scrollable', className)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        scrollbarWidth,
        msOverflowStyle: 'none',
      }}
    >
      {children}
    </div>
  )
}
