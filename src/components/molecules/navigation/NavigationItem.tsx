import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useActiveNavigation } from '@/hooks/useActiveNavigation'
import { cn } from '@/utils/commonUtil'
import { Collapse } from '@/atoms/Collapse'
import { Flex } from '@/atoms/Flex'
import { Icon, type IconName } from '@/atoms/Icon'
import { Text } from '@/atoms/Text'

export interface NavigationItemProps {
  title: string
  icon?: IconName
  to?: string
  isDynamicRoute?: boolean
  external?: boolean
  child?: NavigationItemProps[]
}

export function NavigationItem({ title, icon, to, isDynamicRoute = false, external, child }: NavigationItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { isActive } = useActiveNavigation()
  const navigate = useNavigate()

  const isActiveNavigation = useMemo(
    // 동적 라우트인 경우 정확히 일치하지 않아도 활성화 처리 (:id 등)
    () => (to ? isActive({ path: to, exact: !isDynamicRoute }) : false),
    [to, isActive, isDynamicRoute],
  )

  // 자식 계층이 활성화 되어있다면 collapse open 처리
  useEffect(() => {
    if (child && child.some((item) => isActive({ path: item.to ?? '' }))) {
      setIsOpen(true)
    }
  }, [child, isActive])

  function onClickItem(isExternal: boolean, to: string) {
    if (isExternal) {
      window.open(to, '_blank')
    } else if (to) {
      navigate(to)
    }
  }

  return (
    <Flex direction="col" items="start" justify="center" width="full" className="mb-1">
      <Flex
        direction="row"
        items="center"
        justify="between"
        width="full"
        className="mb-1 cursor-pointer px-2 py-0.5 hover:rounded-md hover:bg-gray-200 hover:px-2"
        onClick={() => {
          onClickItem(external ?? false, to ?? '')
          if (child) setIsOpen(!isOpen)
        }}
      >
        {/* 일반 메뉴 제목 */}
        <Flex direction="row" items="center" justify="start" gap="2" width="full">
          {icon && <Icon name={icon} size="sm" color={isActiveNavigation ? 'primary-800' : 'gray-700'} stroke />}
          <Text size="md" weight="sm" wrap={false} className={cn(isActiveNavigation ? 'text-primary-800' : '')}>
            {title}
          </Text>
        </Flex>

        {/* 외부 연결 케이스 */}
        {external && (
          <Flex items="center" justify="end">
            <Icon name="rightUpArrow" size="sm" color="gray-400" stroke />
          </Flex>
        )}

        {/* 하위 메뉴 케이스 */}
        {child && (
          <Flex items="center" justify="end">
            <Icon
              name="chevronRight"
              size="sm"
              color="gray-400"
              stroke
              className={cn('transition-transform duration-400', isOpen ? 'rotate-90' : '')}
            />
          </Flex>
        )}
      </Flex>

      {child && (
        <Collapse isOpen={isOpen} animationDuration={400} className="w-full">
          <Flex direction="col" items="center" justify="center" width="full" className="mx-3.5">
            <ul className="border-sidebar-border w-full flex-col gap-1 border-l border-gray-300 px-2.5 py-0.5">
              {child.map((item, index) => (
                <li key={index} className="w-[90%] cursor-pointer rounded-md py-1 pl-2 hover:bg-gray-200">
                  <Flex
                    direction="row"
                    items="center"
                    justify="between"
                    width="full"
                    onClick={() => onClickItem(item.external ?? false, item.to ?? '')}
                  >
                    <Text
                      variant="sub"
                      size="sm"
                      className={cn(isActive({ path: item.to ?? '', exact: true }) ? 'text-primary-800' : '')}
                    >
                      {item.title}
                    </Text>
                    {item.external && <Icon name="rightUpArrow" size="sm" color="gray-400" stroke />}
                  </Flex>
                </li>
              ))}
            </ul>
          </Flex>
        </Collapse>
      )}
    </Flex>
  )
}
