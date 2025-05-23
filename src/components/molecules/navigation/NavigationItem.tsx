import { Link } from 'react-router'
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

function IconWrapper({ children, category }: { children: React.ReactNode; category: 'parent' | 'link' }) {
  return (
    <Flex justify="between" items="center">
      {children}

      {category === 'parent' && <Icon name="chevronDown" size="sm" color="gray-400" stroke />}
      {category === 'link' && <Icon name="rightUpArrow" size="sm" color="gray-400" stroke />}
    </Flex>
  )
}

function ParentItem({ name, children }: ParentItemProps) {
  return (
    <>
      <IconWrapper category="parent">
        <Text variant="default" size="md">
          {name}
        </Text>
      </IconWrapper>

      <Flex direction="col" justify="between" items="center" gap="1" className="mt-1">
        {children?.map((child) => {
          return (
            <Flex width="full" className="pl-4">
              <Item name={child.name} to={child.to} external={child.external} isChild={true} />
            </Flex>
          )
        })}
      </Flex>
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
