import { Box } from '@/atoms/Box'
import { Divider } from '@/atoms/Divider'
import { Flex } from '@/atoms/Flex'
import { Text } from '@/atoms/Text'
import { useLogout } from '@/hooks/useLogout'

export function NavigationFooter() {
  return (
    <Box padding="5">
      <Flex width="full" justify="between" items="center" gap="3">
        <Flex
          width="full"
          justify="center"
          items="center"
          className="cursor-pointer rounded-md transition-colors duration-200 hover:bg-gray-50"
        >
          <Text variant="sub" size="sm">
            내 정보 관리
          </Text>
        </Flex>

        <Divider orientation="vertical" marginX="0" marginY="0" />

        <Flex
          width="full"
          justify="center"
          items="center"
          className="cursor-pointer rounded-md transition-colors duration-200 hover:bg-gray-50"
          onClick={useLogout()}
        >
          <Text variant="sub" size="sm">
            로그아웃
          </Text>
        </Flex>
      </Flex>
    </Box>
  )
}
