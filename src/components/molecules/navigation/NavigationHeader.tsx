import { Container } from '@/atoms/Container'
import { NavigationProfile } from './NavigationProfile'

export function NavigationHeader() {
  return (
    <Container>
      {/* Logo & Language Icon & Notification Icon */}
      <></>
      {/* Avatar & Name & Email & School Name */}
      <NavigationProfile />
    </Container>
  )
}
