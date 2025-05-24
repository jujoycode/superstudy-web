import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Box } from '@/atoms/Box'
import { Flex } from '@/atoms/Flex'
import { Text } from '@/atoms/Text'
import { Collapse } from '@/atoms/Collapse'
import { Icon } from '@/atoms/Icon'
import { cn } from '@/utils/commonUtil'

// 메뉴 아이템 기본 속성
export interface NavigationItemBaseProps {
  name: string
  isActive?: boolean
}

// 자식 메뉴 아이템 속성
export interface NavigationLinkItemProps extends NavigationItemBaseProps {
  to: string
  external?: boolean
  isChild?: boolean
  children?: never
}

// 부모 메뉴 아이템 속성
export interface NavigationParentItemProps extends NavigationItemBaseProps {
  children: NavigationLinkItemProps[]
  to?: never
  external?: never
}

// 통합 타입 정의 (부모 또는 자식 중 하나)
export type NavigationItemProps = NavigationLinkItemProps | NavigationParentItemProps

// 메뉴 아이템이 부모인지 확인하는 타입 가드
function isParentItem(item: NavigationItemProps): item is NavigationParentItemProps {
  return Array.isArray((item as NavigationParentItemProps).children)
}

/**
 * 내비게이션 아이템 컴포넌트 (부모 또는 링크)
 */
export function NavigationItem(props: NavigationItemProps) {
  if (isParentItem(props)) {
    return <NavigationParentItem {...props} />
  }

  return <NavigationLinkItem {...props} />
}

/**
 * 부모 메뉴 아이템 컴포넌트 (확장/축소 가능한 항목)
 */
function NavigationParentItem({ name, children, isActive }: NavigationParentItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const hasActiveChild = children?.some((child) => child.isActive)

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  // 활성화된 자식이 있으면 자동으로 펼치기
  useEffect(() => {
    if (hasActiveChild) {
      setIsCollapsed(false)
    }
  }, [hasActiveChild])

  return (
    <Box width="full">
      <div
        className={cn('flex w-full cursor-pointer items-center justify-between')}
        onClick={handleToggle}
        onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
        tabIndex={0}
        aria-label="하위 메뉴 펼치기/접기"
        aria-expanded={!isCollapsed}
        role="button"
      >
        <Text
          variant="default"
          size="md"
          className={cn('cursor-pointer hover:bg-gray-50', isActive && 'text-primary-800')}
        >
          {name}
        </Text>

        <div
          className={cn(
            'flex cursor-pointer items-center justify-center transition-transform duration-300 ease-in-out',
            isCollapsed ? '-rotate-180' : '',
          )}
        >
          <Icon
            name="chevronDown"
            size="sm"
            color="gray-400"
            stroke
            className="hover:text-primary-800 cursor-pointer"
          />
        </div>
      </div>

      <Collapse isOpen={!isCollapsed} className="mt-1">
        <Flex direction="col" justify="between" items="center" gap="1">
          {children.map((child, index) => (
            <Flex key={index} width="full" className="pl-4">
              <NavigationLinkItem {...child} isChild={true} />
            </Flex>
          ))}
        </Flex>
      </Collapse>
    </Box>
  )
}

/**
 * 링크 메뉴 아이템 컴포넌트
 */
function NavigationLinkItem({ name, to, external, isChild, isActive }: NavigationLinkItemProps) {
  const textElement = (
    <Text
      variant={isChild ? 'sub' : 'default'}
      size="md"
      className={cn('cursor-pointer hover:bg-gray-50', isActive && 'text-primary-800')}
    >
      {name}
    </Text>
  )

  // 외부 링크인 경우
  if (external) {
    return (
      <div className="flex w-full items-center justify-between">
        {textElement}
        <Icon name="rightUpArrow" size="sm" color="gray-400" stroke className="hover:text-primary-800 cursor-pointer" />
      </div>
    )
  }

  // 내부 링크인 경우
  return (
    <Link to={to} className="w-full">
      {textElement}
    </Link>
  )
}
