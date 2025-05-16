import { Avatar } from '@/atoms/Avatar'
import { Container } from '@/atoms/Container'
import { Text } from '@/atoms/Text'

export function NavigationProfile() {
  return (
    <Container flex direction="row" justify="between" items="center" gap="2" width="184px" noPadding>
      {/* Avatar */}
      <Container>
        <Avatar />
      </Container>

      <Container flex direction="col" justify="between" items="center" gap="2">
        {/* Name */}

        {/* Email & School */}
        <Container flex direction="row" justify="between" items="center" gap="2">
          <Text>이름</Text>
        </Container>

        {/* Email & School */}
        <Container flex direction="col" items="start" gap="2">
          <Text>이메일</Text>
          <Text>학교</Text>
        </Container>
      </Container>
    </Container>
  )
}
