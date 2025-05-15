import { Container } from '@/atoms/Container'

export function NavigationProfile() {
  return (
    <Container flex direction="row" justify="between" items="center" gap="2">
      {/* Logo */}
      <Container>
        <></>
      </Container>

      {/*  Name & Email & School */}
      <Container flex direction="col" justify="between" items="center" gap="2">
        {/* Name */}
        <Container flex direction="row" justify="between" items="center" gap="2">
          <></>
        </Container>

        {/* Email & School */}
        <Container flex direction="col" items="start" gap="2">
          <></>
        </Container>
      </Container>
    </Container>
  )
}
