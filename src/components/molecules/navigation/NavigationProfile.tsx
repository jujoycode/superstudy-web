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
  onClick?: () => void
}

export function NavigationProfile({ name, email, school, src, onClick }: NavigationProfileProps) {
  const handleClick = () => {
    onClick?.()
  }

  return (
    <Flex
      direction="row"
      justify="start"
      items="start"
      gap="3"
      className="cursor-pointer rounded-md p-2 transition-colors duration-200 hover:bg-gray-50"
      onClick={handleClick}
    >
      {/* Avatar */}
      <Box width="fit-content">
        <Avatar rounded="md" src={src} />
      </Box>

      <Box width="full">
        <Flex direction="col" items="start" gap="1">
          <Flex direction="row" justify="between" items="center" width="full">
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
