import { Avatar } from '@/atoms/Avatar'
import { Box } from '@/atoms/Box'
import { Flex } from '@/atoms/Flex'
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
    <Flex direction="row" justify="start" items="start" gap="3">
      {/* Avatar */}
      <Box width="fit-content">
        <Avatar rounded="md" src={src} />
      </Box>

      <Box width="full">
        <Flex direction="col" items="start" gap="1">
          <Flex direction="row" justify="between" items="center">
            <Text size="lg" weight="lg">
              {name}
            </Text>
            <Icon name="rightFillArrow" size="sm" />
          </Flex>

          <Box>
            <Text size="sm" weight="sm" variant="dim">
              {email}
            </Text>
            <Text size="sm" weight="sm" variant="dim">
              {school}
            </Text>
          </Box>
        </Flex>
      </Box>
    </Flex>
  )
}
