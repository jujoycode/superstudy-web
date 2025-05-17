import { Avatar } from '@/atoms/Avatar'
import { Container } from '@/atoms/Container'
import { Icon } from '@/atoms/Icon'
import { Text } from '@/atoms/Text'

export type NavigationProfileProps = {
  name: string
  email: string
  school: string
  src?: string
}

export function NavigationProfile({ name, email, school, src }: NavigationProfileProps) {
  return (
    <Container flex direction="row" justify="between" items="start" gap="3" width="224px" noPadding>
      {/* Avatar */}
      <Container noPadding width="fit">
        <Avatar rounded="md" src={src} />
      </Container>

      <Container flex direction="col" items="start" gap="2" noPadding>
        {/* Name */}
        <Container flex direction="row" items="center" gap="1">
          <Text size="lg" weight="lg">
            {name}
          </Text>
          <Icon name="rightFillArrow" size="sm" />
        </Container>

        {/* Email & School */}
        <Container flex direction="col" items="start">
          <Text size="sm" weight="sm" variant="dim">
            {email}
          </Text>
          <Text size="sm" weight="sm" variant="dim">
            {school}
          </Text>
        </Container>
      </Container>
    </Container>
  )
}
