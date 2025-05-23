import { Flex } from '@/atoms/Flex'
import { Icon } from '@/atoms/Icon'
import { Text } from '@/atoms/Text'
import { Dropdown } from '@/molecules/Dropdown'

export function NavigationDropdown() {
  return (
    <Dropdown
      trigger={
        <Flex direction="row" justify="between" items="center" gap="1">
          <Text>KR</Text>
          <Icon name="underFillArrow" size="sm" />
        </Flex>
      }
    >
      <Text>KR</Text>
      <Text>EN</Text>
    </Dropdown>
  )
}
