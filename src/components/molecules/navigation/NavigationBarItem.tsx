import { Container } from '@/atoms/Container'
import { Icon } from '@/atoms/Icon'

export type NavigationBarItemProps = NavigationItem[]

type NavigationItem = {
  title: string
  items?: NavigationItem[]
  link?: string
  external?: string
}

const CategoryHeader = ({ title }: { title: string }) => (
  <h3 className="mb-1 text-[14px] font-normal text-gray-700">{title}</h3>
)

const SubNavigationItem = ({ title, link, external }: { title: string; link?: string; external?: string }) => (
  <a
    href={link || external}
    className="mb-2 text-[15px] font-medium text-gray-800"
    tabIndex={0}
    aria-label={title || external}
  >
    {title}
    {external && <Icon name="rightUpArrow" />}
  </a>
)

const NavigationItem = ({ item }: { item: NavigationItem }) => {
  if (item.items) {
    return (
      <Container flex direction="col" noPadding>
        <div className="mb-0.5 text-[15px] font-medium text-gray-800">{item.title}</div>
        <Container flex direction="col" paddingX="3" noPadding>
          {item.items.map((subItem, index) => (
            <SubNavigationItem
              key={`subitem-${index}`}
              title={subItem.title}
              link={subItem.link}
              external={subItem.external}
            />
          ))}
        </Container>
      </Container>
    )
  }

  return (
    <a
      href={item.link || item.external}
      className="flex items-center justify-between text-[15px] font-medium text-gray-800"
      tabIndex={0}
      aria-label={item.title || item.external}
    >
      {item.title}
      {item.external && <Icon name="rightUpArrow" color="gray" customSize={{ width: '16px', height: '16px' }} />}
    </a>
  )
}

const NavigationCategory = ({ category }: { category: NavigationItem }) => (
  <Container flex direction="col" className="mb-4" noPadding>
    <CategoryHeader title={category.title} />
    <Container flex direction="col" noPadding>
      {category.items?.map((item, index) => (
        <div key={`item-${index}`} className="mb-0.5">
          <NavigationItem item={item} />
        </div>
      ))}
    </Container>
  </Container>
)

export function NavigationBarItem({ data }: { data: NavigationBarItemProps }) {
  return (
    <Container flex direction="col" width="200px" noPadding>
      {data.map((category, index) => (
        <NavigationCategory key={`category-${index}`} category={category} />
      ))}
    </Container>
  )
}
