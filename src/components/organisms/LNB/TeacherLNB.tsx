import { Button } from '@/atoms/Button'
import { Container } from '@/atoms/Container'
import { Divider } from '@/atoms/Divider'
import { NavigationBarItem, type NavigationBarItemProps } from '@/molecules/navigation/NavigationBarItem'
import { NavigationHeader } from '@/molecules/navigation/NavigationHeader'
import type { NavigationProfileProps } from '@/molecules/navigation/NavigationProfile'

export type TeacherLNBProps = {
  HeaderProps: NavigationProfileProps
  ItemProps: NavigationBarItemProps
}

export function TeacherLNB({ HeaderProps, ItemProps }: TeacherLNBProps) {
  return (
    <Container flex direction="col" justify="start" items="center" gap="2" width="224px" noPadding>
      <NavigationHeader ProfileProps={HeaderProps} />

      <Divider />

      <Container flex direction="col" justify="between" items="center" gap="2">
        <NavigationBarItem data={ItemProps} />
      </Container>

      <Divider />

      <Container flex direction="row" items="center" justify="center" paddingX="5">
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
