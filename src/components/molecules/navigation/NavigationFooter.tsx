import { Box } from '@/atoms/Box'
import { Divider } from '@/atoms/Divider'
import { Flex } from '@/atoms/Flex'
import { Text } from '@/atoms/Text'

interface NavigationFooterProps {
  actions: {
    label: string
    onClick?: () => void
  }[]
}

export function NavigationFooter({ actions }: NavigationFooterProps) {
  return (
    <Box padding="5">
      <Flex width="full" justify="between" items="center" gap="3">
        {actions.map((action, index) => (
          <>
            {index > 0 && <Divider orientation="vertical" marginX="0" marginY="0" />}

            <Flex
              key={action.label + index}
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
