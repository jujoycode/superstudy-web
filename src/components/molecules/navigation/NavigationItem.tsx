import { useState } from 'react'
import { Link } from 'react-router'
import { Box } from '@/atoms/Box'
import { Flex } from '@/atoms/Flex'
import { Text } from '@/atoms/Text'
import { Collapse } from '@/atoms/Collapse'
import { NavigationIcon } from '@/atoms/NavigationIcon'

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

function ParentItem({ name, children }: ParentItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      <NavigationIcon type="parent" onClick={handleToggle} isCollapsed={isCollapsed}>
        <Text variant="default" size="md">
          {name}
        </Text>
      </NavigationIcon>

      <Collapse isOpen={!isCollapsed} className="mt-1">
        <Flex direction="col" justify="between" items="center" gap="1">
          {children?.map((child, index) => (
            <Flex key={index} width="full" className="pl-4">
              <Item name={child.name} to={child.to} external={child.external} isChild={true} />
            </Flex>
          ))}
        </Flex>
      </Collapse>
    </>
  )
}

function Item({ name, to, external, isChild }: ItemProps) {
  if (external) {
    return (
      <NavigationIcon type="link">
        <Text variant={isChild ? 'sub' : 'default'} size="md">
          {name}
        </Text>
      </NavigationIcon>
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
