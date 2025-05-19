import { ReactNode, useState } from 'react'
import { Container } from '@/atoms/Container'
import { Divider } from '@/atoms/Divider'
import { Icon } from '@/atoms/Icon'
import { Text } from '@/atoms/Text'
import { cn } from '@/legacy/lib/tailwind-merge'

export type NavigationItem = {
  title: string
  items?: NavigationItem[]
  link?: string
  external?: string
}

const CategoryHeader = ({ title }: { title: string }) => (
  <Text size="md" weight="sm" className="mb-1 text-[16px] font-[500] text-gray-800">
    {title}
  </Text>
)

const LinkWrapper = ({
  children,
  href,
  title,
  className = '',
}: {
  children: ReactNode
  href?: string
  title: string
  className?: string
}) => (
  <a
    href={href}
    className={`hover:text-primary-800 active:text-primary ${className}`}
    tabIndex={0}
    aria-label={title}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (href) window.location.href = href
      }
    }}
  >
    {children}
  </a>
)

const SubNavigationItem = ({ title, link, external }: { title: string; link?: string; external?: string }) => (
  <a
    className="group ml-4 flex items-center py-1 text-[14px] font-[400] text-gray-700 hover:bg-gray-50"
    href={link}
    aria-label={title}
  >
    {title}
    {external && (
      <Icon
        name="rightUpArrow"
        customSize={{ width: '16px', height: '16px' }}
        className="group-hover:text-primary-800 ml-1"
      />
    )}
  </a>
)

const NavigationItem = ({ item }: { item: NavigationItem }) => {
  const [isOpen, setIsOpen] = useState(true)

  if (item.items && item.items.length > 0) {
    return (
      <Container flex direction="col" noPadding>
        <div
          className="group mb-0.5 flex cursor-pointer items-center justify-between py-2 text-[14px] font-[400] text-gray-700 hover:bg-gray-50 hover:text-black"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsOpen(!isOpen)
            }
          }}
          tabIndex={0}
          aria-label={`${item.title} 메뉴 ${isOpen ? '접기' : '펼치기'}`}
        >
          <span>{item.title}</span>
          <div className="flex items-center">
            {isOpen ? (
              <Icon
                name="chevronUp"
                color="gray-400"
                customSize={{ width: '16px', height: '16px' }}
                className="group-hover:text-primary-800"
              />
            ) : (
              <Icon
                name="chevronDown"
                color="gray-400"
                customSize={{ width: '16px', height: '16px' }}
                className="group-hover:text-primary-800"
              />
            )}
          </div>
        </div>
        {isOpen && (
          <Container flex direction="col" className="pb-2" paddingX="0">
            {item.items.map((subItem, index) => (
              <SubNavigationItem
                key={`subitem-${index}`}
                title={subItem.title}
                link={subItem.link}
                external={subItem.external}
              />
            ))}
          </Container>
        )}
      </Container>
    )
  }

  return (
    <LinkWrapper
      href={item.link}
      title={item.title}
      className={cn(
        'group flex items-center justify-between py-2 text-[14px] font-[400] text-gray-700 hover:bg-gray-50 hover:text-black',
        item.title === '활동기록' && 'text-brand-1',
      )}
    >
      <span>{item.title}</span>
      {item.external && (
        <Icon
          name="rightUpArrow"
          color="gray-400"
          customSize={{ width: '16px', height: '16px' }}
          className="group-hover:text-primary-800"
        />
      )}
    </LinkWrapper>
  )
}

const NavigationCategory = ({ category }: { category: NavigationItem }) => {
  const [isOpen, setOpen] = useState(true)

  return (
    <Container flex direction="col" className="mb-3" paddingX="2">
      <CategoryHeader title={category.title} />
      {isOpen && (
        <Container flex direction="col" noPadding>
          {category.items?.map((item, index) => <NavigationItem key={`item-${index}`} item={item} />)}
        </Container>
      )}
    </Container>
  )
}

export function NavigationBarItem({ data }: { data: NavigationItem[] }) {
  if (!data || data.length === 0) {
    return null
  }

  return (
    <Container flex direction="col" width="200px" gap="0.5" noPadding>
      {data.map((category, index) => (
        <NavigationCategory key={`category-${index}`} category={category} />
      ))}
    </Container>
  )
}
