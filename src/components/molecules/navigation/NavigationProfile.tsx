import { Avatar } from '@/atoms/Avatar'
import { Box } from '@/atoms/Box'
import { Flex } from '@/atoms/Flex'
import { Icon } from '@/atoms/Icon'
import { Text } from '@/atoms/Text'

export type NavigationProfileProps = {
  name: string
  nickname?: string
  email: string
  school: string
  profile?: string
  onClick?: () => void
}

export function NavigationProfile({ name, nickname, email, school, profile, onClick }: NavigationProfileProps) {
  const handleClick = () => {
    onClick?.()
  }

  return (
    <Flex
      direction="row"
      justify="start"
      items="start"
      gap="3"
      className="cursor-pointer rounded-md p-5 pt-0 pb-4 transition-colors duration-200"
      onClick={handleClick}
    >
      {/* Avatar */}
      <Box width="fit-content">
        <Avatar rounded="md" src={profile} />
      </Box>

      <Box width="full" className="hover:rounded-md hover:bg-gray-100">
        <Flex direction="col" items="start" gap="1">
          <Flex direction="row" justify="between" items="center" width="full">
            <Text size="lg" weight="lg">
              {name} {nickname && `(${nickname})`}
            </Text>
            <Icon name="rightFillArrow" size="sm" />
          </Flex>

          <Box>
            <Text size="xs" weight="sm" variant="dim">
              {email}
            </Text>
            <Text size="xs" weight="sm" variant="dim">
              {school}
            </Text>
          </Box>
        </Flex>
      </Box>
    </Flex>
  )
}
