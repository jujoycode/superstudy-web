import { Container } from '@/atoms/Container'
import { Icon } from '@/atoms/Icon'
import { NavigationProfile } from '@/molecules/navigation/NavigationProfile'

export function NavigationHeader() {
  return (
    <Container>
      {/* Logo & Language Icon & Notification Icon */}
      <Container flex direction="row" items="center" justify="between" width="184px" noPadding>
        <Icon name="logo" className="h-[40px] w-[70px]" />

        <Container flex direction="row" items="end" gap="2">
          <Icon name="bell" size="md" fill />
          <Icon name="world" size="md" />
        </Container>
      </Container>

      {/* Avatar & Name & Email & School Name */}
      <NavigationProfile />
    </Container>
  )
}
