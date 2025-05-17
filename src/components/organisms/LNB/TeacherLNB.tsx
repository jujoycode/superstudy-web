import { Container } from '@/atoms/Container'
import { Divider } from '@/atoms/Divider'
import { NavigationHeader } from '@/molecules/navigation/NavigationHeader'
import type { NavigationProfileProps } from '@/molecules/navigation/NavigationProfile'

export type TeacherLNBProps = {
  HeaderProps: NavigationProfileProps
}

export function TeacherLNB({ HeaderProps }: TeacherLNBProps) {
  return (
    // 전역 Container
    <Container flex direction="col" justify="start" items="center" gap="2" width="224px">
      <NavigationHeader ProfileProps={HeaderProps} />

      <Divider />

      {/* 메뉴 Container */}
      <Container flex direction="col" justify="between" items="center" gap="2">
        {[].map((_) => {
          return <></>
        })}
      </Container>

      <Divider />

      {/* 푸터 Container */}
      <Container flex direction="row" justify="between" items="center" gap="2">
        <></>
      </Container>
    </Container>
  )
}
