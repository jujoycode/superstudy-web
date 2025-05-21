import { Button } from '@/atoms/Button'
import { Container } from '@/atoms/Container'
import { Divider } from '@/atoms/Divider'
// import { NavigationBarItem, type NavigationItem } from '@/molecules/navigation/NavigationBarItem'
import { NavigationItem } from '@/molecules/navigation/navigation-items/NavigationItem'
import { NavigationSubItem } from '@/molecules/navigation/navigation-items/NavigationSubItem'
import { NavigationHeader } from '@/molecules/navigation/NavigationHeader'
import type { NavigationProfileProps } from '@/molecules/navigation/NavigationProfile'

export type TeacherLNBProps = {
  HeaderProps: NavigationProfileProps
  ItemProps: NavigationItem[]
}

export function TeacherLNB({ HeaderProps, ItemProps }: TeacherLNBProps) {
  return (
    <Container flex direction="col" justify="start" items="center" width="15%" noPadding>
      <NavigationHeader ProfileProps={HeaderProps} />

      <Container flex direction="col" justify="between" items="center">
        {ItemProps.map((item) =>
          item.items?.length === 0 ? <NavigationItem item={item} /> : <NavigationSubItem item={item} />,
        )}
      </Container>

      <Container flex direction="row" items="center" justify="center" paddingX="5" paddingY="4">
        <Button variant="link" size="sm" className="text-gray-600">
          내 정보 관리
        </Button>

        <Divider orientation="vertical" height="h-3" />

        <Button variant="link" size="sm" className="text-gray-600">
          로그아웃
        </Button>
      </Container>
    </Container>
  )
}
