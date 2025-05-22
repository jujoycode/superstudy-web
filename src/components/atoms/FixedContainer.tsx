import { cn } from '@/utils/commonUtil'

type FixedPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
type ZIndex = 10 | 20 | 30 | 40 | 50 | 'auto'

interface FixedPositionContainerProps {
  children: React.ReactNode
  position?: FixedPosition
  zIndex?: ZIndex
  className?: string
  offsetX?: number
  offsetY?: number
  width?: string
  height?: string
  fullWidth?: boolean
  fullHeight?: boolean
  as?: React.ElementType
}

export function FixedPositionContainer({
  children,
  position = 'top',
  zIndex = 10,
  className,
  offsetX = 0,
  offsetY = 0,
  width,
  height,
  fullWidth = false,
  fullHeight = false,
  as: Component = 'div',
}: FixedPositionContainerProps) {
  // position 설정에 따른 클래스 매핑
  const positionClasses: Record<FixedPosition, string> = {
    top: 'top-0 left-1/2 transform -translate-x-1/2',
    bottom: 'bottom-0 left-1/2 transform -translate-x-1/2',
    left: 'left-0 top-1/2 transform -translate-y-1/2',
    right: 'right-0 top-1/2 transform -translate-y-1/2',
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  }

  // z-index 클래스 매핑
  const zIndexClasses: Record<ZIndex, string> = {
    10: 'z-10',
    20: 'z-20',
    30: 'z-30',
    40: 'z-40',
    50: 'z-50',
    auto: 'z-auto',
  }

  // 오프셋, 너비, 높이를 위한 인라인 스타일
  const containerStyles = {
    ...(offsetX && { marginLeft: `${offsetX}px` }),
    ...(offsetY && { marginTop: `${offsetY}px` }),
    ...(width && !fullWidth && { width }),
    ...(height && !fullHeight && { height }),
  }

  return (
    <Component
      className={cn(
        'fixed',
        positionClasses[position],
        zIndexClasses[zIndex],
        fullWidth && 'w-full',
        fullHeight && 'h-full',
        className,
      )}
      style={containerStyles}
    >
      {children}
    </Component>
  )
}

// 헤더를 위한 프리셋 컨테이너
export function FixedHeader({
  children,
  className,
  ...props
}: Omit<FixedPositionContainerProps, 'position' | 'fullWidth'>) {
  return (
    <FixedPositionContainer
      position="top"
      fullWidth={true}
      zIndex={30}
      className={cn('bg-white py-4 shadow-md', className)}
      {...props}
    >
      {children}
    </FixedPositionContainer>
  )
}

// 하단 네비게이션 바를 위한 프리셋 컨테이너
export function FixedBottomNav({
  children,
  className,
  ...props
}: Omit<FixedPositionContainerProps, 'position' | 'fullWidth'>) {
  return (
    <FixedPositionContainer
      position="bottom"
      fullWidth={true}
      zIndex={30}
      className={cn('border-t bg-white py-3 shadow-lg', className)}
      {...props}
    >
      {children}
    </FixedPositionContainer>
  )
}

// 우측 사이드바를 위한 프리셋 컨테이너
export function FixedRightSidebar({
  children,
  className,
  width = '320px',
  ...props
}: Omit<FixedPositionContainerProps, 'position'>) {
  return (
    <FixedPositionContainer
      position="right"
      height="100vh"
      width={width}
      zIndex={20}
      className={cn('bg-white shadow-lg', className)}
      {...props}
    >
      {children}
    </FixedPositionContainer>
  )
}

// 좌측 사이드바를 위한 프리셋 컨테이너
export function FixedLeftSidebar({
  children,
  className,
  width = '280px',
  ...props
}: Omit<FixedPositionContainerProps, 'position'>) {
  return (
    <FixedPositionContainer
      position="left"
      height="100vh"
      width={width}
      zIndex={20}
      className={cn('bg-white shadow-lg', className)}
      {...props}
    >
      {children}
    </FixedPositionContainer>
  )
}

// 플로팅 버튼을 위한 프리셋 컨테이너
export function FixedFloatingButton({ children, className, ...props }: Omit<FixedPositionContainerProps, 'position'>) {
  return (
    <FixedPositionContainer position="bottom-right" zIndex={40} className={cn('m-4', className)} {...props}>
      {children}
    </FixedPositionContainer>
  )
}
