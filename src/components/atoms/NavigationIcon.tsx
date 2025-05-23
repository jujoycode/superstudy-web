import { cn } from '@/utils/commonUtil'
import { Icon } from '@/atoms/Icon'

type IconType = 'parent' | 'link'

interface NavigationIconProps {
  children: React.ReactNode
  type: IconType
  onClick?: () => void
  isCollapsed?: boolean
}

export function NavigationIcon({ children, type, onClick, isCollapsed }: NavigationIconProps) {
  const isParent = type === 'parent'

  return (
    <div
      className={cn('flex w-full items-center justify-between', isParent && 'cursor-pointer')}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      tabIndex={isParent ? 0 : undefined}
      aria-label={isParent ? '하위 메뉴 펼치기/접기' : undefined}
      aria-expanded={isParent ? !isCollapsed : undefined}
      role={isParent ? 'button' : undefined}
    >
      {children}

      {isParent && (
        <div
          className={cn(
            'flex items-center justify-center transition-transform duration-300 ease-in-out',
            isCollapsed ? '-rotate-180' : '',
          )}
        >
          <Icon name="chevronDown" size="sm" color="gray-400" stroke />
        </div>
      )}
      {type === 'link' && <Icon name="rightUpArrow" size="sm" color="gray-400" stroke />}
    </div>
  )
}
