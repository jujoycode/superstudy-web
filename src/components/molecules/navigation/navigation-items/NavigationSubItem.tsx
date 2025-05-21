import { Container } from '@/atoms/Container'
import { Icon } from '@/atoms/Icon'
import type { NavigationItem } from './NavigationItem'

export type NavigationSubItemProps = {
  item: NavigationItem
}

export function NavigationSubItem({ item }: NavigationSubItemProps) {
  return (
    <Container flex direction="col" noPadding>
      <div className="mb-1 px-2 py-1 text-[14px] font-medium text-gray-900">{item.title}</div>
      {item.items && item.items.length > 0 && (
        <Container flex direction="col" gap="1" noPadding>
          {item.items.map((subItem, index) => {
            if (subItem.external) {
              return (
                <Container flex paddingY="1.5" paddingX="4" noPadding={false} key={`subitem-${index}`}>
                  <a
                    className="hover:text-primary-800 active:text-primary group flex w-full items-center justify-between text-[14px] font-medium text-gray-700"
                    href={subItem.external}
                    aria-label={subItem.title}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {subItem.title}
                    <Icon
                      name="rightUpArrow"
                      stroke
                      color="gray-400"
                      customSize={{ width: '16px', height: '16px' }}
                      className="group-hover:text-primary-800 ml-1"
                    />
                  </a>
                </Container>
              )
            }

            return (
              <Container flex paddingY="1.5" paddingX="4" noPadding={false} key={`subitem-${index}`}>
                <a
                  className="hover:text-primary-800 active:text-primary group flex w-full items-center text-[14px] font-medium text-gray-700"
                  href={subItem.link || '#'}
                  aria-label={subItem.title}
                  onClick={(e) => {
                    if (!subItem.link || subItem.link === '#') {
                      e.preventDefault()
                    }
                  }}
                >
                  {subItem.title}
                </a>
              </Container>
            )
          })}
        </Container>
      )}
    </Container>
  )
}
