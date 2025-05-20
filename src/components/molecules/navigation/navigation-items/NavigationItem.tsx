import { Link } from 'react-router'
import { Container } from '@/atoms/Container'
import { Icon } from '@/atoms/Icon'
import { NavigationSubItem } from '@/molecules/navigation/navigation-items/NavigationSubItem'

export type NavigationItem = {
  title: string
  items?: NavigationItem[]
  link?: string
  external?: string
}

export function NavigationItem({ item }: { item: NavigationItem }) {
  if (item.items) {
    return <NavigationSubItem item={item} />
  }

  if (item.external) {
    return (
      <Container flex paddingY="2" paddingX="2" noPadding={false}>
        <a
          href={item.external}
          className="hover:text-primary-800 active:text-primary group flex w-full items-center justify-between text-[14px] font-medium text-gray-800"
          aria-label={item.title}
          tabIndex={0}
          target="_blank"
          rel="noopener noreferrer"
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              window.open(item.external, '_blank', 'noopener,noreferrer')
            }
          }}
        >
          <span>{item.title}</span>
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
    <Container flex paddingY="2" paddingX="2" noPadding={false}>
      <Link
        to={item.link || '#'}
        className="hover:text-primary-800 active:text-primary group flex w-full items-center text-[14px] font-medium text-gray-800"
        aria-label={item.title}
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
          }
        }}
      >
        <span>{item.title}</span>
      </Link>
    </Container>
  )
}
