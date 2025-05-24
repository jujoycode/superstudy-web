import { useMemo } from 'react'
import { Flex } from '@/atoms/Flex'
import { NavigationItem, NavigationLinkItemProps, NavigationParentItemProps } from './NavigationItem'
import { useActiveNavigation } from '@/hooks/useActiveNavigation'

type NavigationItemWithoutActive =
  | Omit<NavigationLinkItemProps, 'isActive'>
  | (Omit<NavigationParentItemProps, 'isActive' | 'children'> & {
      children: Omit<NavigationLinkItemProps, 'isActive'>[]
    })

interface NavigationContainerProps {
  items: NavigationItemWithoutActive[]
}

export function NavigationContainer({ items }: NavigationContainerProps) {
  const { isActive } = useActiveNavigation()

  // 현재 경로에 따라 메뉴 아이템의 활성화 상태 계산
  const navigationItemsWithActive = useMemo(() => {
    return items.map((item) => {
      // 부모 메뉴 아이템인 경우
      if ('children' in item && Array.isArray(item.children)) {
        // 자식 메뉴 중에 활성화된 항목이 있는지 확인
        const childrenWithActive = item.children.map((child) => ({
          ...child,
          isActive: child.to ? isActive(child.to) : false,
        }))

        return {
          ...item,
          children: childrenWithActive,
        } as NavigationParentItemProps
      }

      // 일반 메뉴 아이템인 경우
      return {
        ...item,
        isActive: item.to ? isActive(item.to) : false,
      } as NavigationLinkItemProps
    })
  }, [items, isActive])

  return (
    <Flex direction="col" gap="1">
      {navigationItemsWithActive.map((item, index) => (
        <NavigationItem key={index} {...item} />
      ))}
    </Flex>
  )
}
