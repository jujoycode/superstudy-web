import { Container } from '@/atoms/Container'
import { Divider } from '@/atoms/Divider'
import { NavigationHeader } from '@/molecules/navigation/NavigationHeader'

export function TeacherLNB() {
  return (
    // 전역 Container
    <Container flex direction="col" justify="start" items="center" gap="2">
      <NavigationHeader />

      <Divider />

      {/* 메뉴 Container */}
      <Container flex direction="col" justify="between" items="center" gap="2">
        {[].map((_) => {
          return <></>
        })}
      </Container>

      {/* 푸터 Container */}
      <Container flex direction="row" justify="between" items="center" gap="2">
        <></>
      </Container>
    </Container>
  )
}
