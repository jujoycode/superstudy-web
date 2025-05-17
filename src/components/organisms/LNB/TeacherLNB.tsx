import { Container } from '@/atoms/Container'
import { Divider } from '@/atoms/Divider'
import { NavigationHeader } from '@/molecules/navigation/NavigationHeader'

export function TeacherLNB() {
  return (
    // 전역 Container
    <Container flex direction="col" justify="start" items="center" gap="2" width="224px">
      <NavigationHeader name="김수학선생님" email="team@super.kr" school="슈퍼고등학교" />

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
