import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/atoms/Button'
import { Text } from '@/atoms/Text'
import { DropdownItem } from '@/atoms/DropdownItem'
import { Dropdown } from '@/molecules/navigation/Dropdown'
const meta: Meta<typeof Dropdown> = {
  title: 'Molecules/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Dropdown>

export const DefaultDropdown: Story = {
  render: () => (
    <Dropdown
      trigger={
        <div className="flex cursor-pointer items-center">
          <Text className="font-medium">KR</Text>
          <svg
            className="ml-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      }
      width={120}
    >
      <DropdownItem onClick={() => 'KR'}>KR</DropdownItem>
      <DropdownItem onClick={() => 'EN'}>EN</DropdownItem>
    </Dropdown>
  ),
}

export const RightAlignedDropdown: Story = {
  render: () => (
    <Dropdown trigger={<Button>오른쪽 정렬</Button>} align="right">
      <DropdownItem>메뉴 항목 1</DropdownItem>
      <DropdownItem>메뉴 항목 2</DropdownItem>
      <DropdownItem>메뉴 항목 3</DropdownItem>
    </Dropdown>
  ),
}

export const CustomWidthDropdown: Story = {
  render: () => (
    <Dropdown trigger={<Button>너비 300px</Button>} width={300}>
      <DropdownItem>메뉴 항목 1</DropdownItem>
      <DropdownItem>메뉴 항목 2</DropdownItem>
      <DropdownItem>메뉴 항목 3</DropdownItem>
    </Dropdown>
  ),
}

export const WithDisabledItems: Story = {
  render: () => (
    <Dropdown trigger={<Button>비활성화 항목</Button>}>
      <DropdownItem>메뉴 항목 1</DropdownItem>
      <DropdownItem disabled>비활성화된 항목</DropdownItem>
      <DropdownItem>메뉴 항목 3</DropdownItem>
    </Dropdown>
  ),
}
