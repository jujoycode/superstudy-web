import { useState } from 'react'
import { Link } from 'react-router'
import { cn } from '@/utils/commonUtil'
import { Box } from '@/atoms/Box'
import { Flex } from '@/atoms/Flex'
import { Icon } from '@/atoms/Icon'
import { Text } from '@/atoms/Text'

export type NavigationItemProps = ParentItemProps & ItemProps

interface ParentItemProps {
  name: string
  children?: ItemProps[]
}

interface ItemProps {
  name: string
  to: string
  external?: boolean
  isActive?: boolean
  isChild?: boolean
}

export function NavigationItem(items: NavigationItemProps) {
  return <Box width="full">{items.children ? <ParentItem {...items} /> : <Item {...items} />}</Box>
}

function IconWrapper({
  children,
  category,
  onClick,
  isCollapsed,
}: {
  children: React.ReactNode
  category: 'parent' | 'link'
  onClick?: () => void
  isCollapsed?: boolean
}) {
  return (
    <div
      className={cn('flex w-full items-center justify-between', category === 'parent' && 'cursor-pointer')}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      tabIndex={category === 'parent' ? 0 : undefined}
      aria-label={category === 'parent' ? '하위 메뉴 펼치기/접기' : undefined}
      aria-expanded={category === 'parent' ? !isCollapsed : undefined}
    >
      {children}

      {category === 'parent' && (
        <div
          className={cn(
            'flex items-center justify-center transition-transform duration-300 ease-in-out',
            isCollapsed ? '-rotate-180' : '',
          )}
        >
          <Icon name="chevronDown" size="sm" color="gray-400" stroke />
        </div>
      )}
      {category === 'link' && <Icon name="rightUpArrow" size="sm" color="gray-400" stroke />}
    </div>
  )
}

function ParentItem({ name, children }: ParentItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      <IconWrapper category="parent" onClick={handleToggle} isCollapsed={isCollapsed}>
        <Text variant="default" size="md">
          {name}
        </Text>
      </IconWrapper>

      {!isCollapsed && (
        <Flex direction="col" justify="between" items="center" gap="1" className="mt-1">
          {children?.map((child, index) => {
            return (
              <Flex key={index} width="full" className="pl-4">
                <Item name={child.name} to={child.to} external={child.external} isChild={true} />
              </Flex>
            )
          })}
        </Flex>
      )}
    </>
  )
}

function Item({ name, to, external, isChild }: ItemProps) {
  if (external) {
    return (
      <IconWrapper category={external ? 'link' : 'parent'}>
        <Text variant={isChild ? 'sub' : 'default'} size="md">
          {name}
        </Text>
      </IconWrapper>
    )
  }

  return (
    <Link to={to} className="w-full">
      <Text variant={isChild ? 'sub' : 'default'} size="md">
        {name}
      </Text>
    </Link>
  )
}
