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
      className={cn(
        'h-full',
        'scrollable',
        'overflow-y-auto',
        'hover:[overflow:scroll]',
        '[&::-webkit-scrollbar]:w-1',
        '[&::-webkit-scrollbar]:bg-transparent',
        '[&::-webkit-scrollbar-track]:bg-transparent',
        '[&::-webkit-scrollbar-thumb]:rounded-full',
        '[&::-webkit-scrollbar-thumb]:bg-gray-300',
        '[&::-webkit-scrollbar-thumb]:opacity-0',
        'hover:[&::-webkit-scrollbar-thumb]:opacity-100',
        'transition-all duration-200',
        className,
      )}
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
