import { Container } from '@/atoms/Container'
import { Divider } from '@/atoms/Divider'
import { Icon } from '@/atoms/Icon'
import { NavigationProfile, type NavigationProfileProps } from '@/molecules/navigation/NavigationProfile'

export type NavigationHeaderProps = {
  ProfileProps: NavigationProfileProps
}

export function NavigationHeader({ ProfileProps }: NavigationHeaderProps) {
  return (
    <Container noPadding>
      <Container flex paddingX="5" gap="4">
        {/* Logo & Language Icon & Notification Icon */}
        <Container flex direction="row" items="center" justify="end" noPadding>
          <Icon name="logo" customSize={{ width: '70px', height: '40px' }} />

          <Container flex direction="row" justify="end" items="center" gap="3" noPadding>
            <Icon name="world" customSize={{ width: '20px', height: '20px' }} />
            <Icon name="bell" customSize={{ width: '20px', height: '20px' }} />
          </Container>
        </Container>

        {/* Avatar & Name & Email & School Name */}
        <NavigationProfile {...ProfileProps} />
      </Container>

      <Divider marginY="4" />
    </Container>
  )
}
