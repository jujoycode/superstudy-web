import { Box } from '@/atoms/Box'
import { Divider } from '@/atoms/Divider'
import { Flex } from '@/atoms/Flex'
import { Text } from '@/atoms/Text'

interface FooterAction {
  label: string
  onClick?: () => void
}

interface NavigationFooterProps {
  actions?: FooterAction[]
}

export function NavigationFooter({
  actions = [{ label: '내 정보 관리' }, { label: '로그아웃' }],
}: NavigationFooterProps) {
  return (
    <Box padding="5">
      <Flex width="full" justify="between" items="center" gap="3">
        {actions.map((action, index) => (
          <>
            {index > 0 && <Divider orientation="vertical" marginX="0" marginY="0" />}
            <Flex
              key={action.label}
              width="full"
              justify="center"
              items="center"
              className="cursor-pointer rounded-md transition-colors duration-200 hover:bg-gray-50"
              onClick={action.onClick}
            >
              <Text variant="sub" className="mb-1" size="sm">
                {action.label}
              </Text>
            </Flex>
          </>
        ))}
      </Flex>
    </Box>
  )
}
