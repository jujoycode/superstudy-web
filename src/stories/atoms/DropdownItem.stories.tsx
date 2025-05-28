import type { Meta, StoryObj } from '@storybook/react'
import { DropdownItem } from '@/atoms/DropdownItem'
import { action } from '@storybook/addon-actions'

const meta: Meta<typeof DropdownItem> = {
  title: 'Atoms/DropdownItem',
  component: DropdownItem,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-64 rounded-md border shadow-sm">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof DropdownItem>

export const Default: Story = {
  args: {
    children: '드롭다운 항목',
    onClick: action('clicked'),
  },
}

export const Disabled: Story = {
  args: {
    children: '비활성화된 항목',
    disabled: true,
    onClick: action('clicked'),
  },
}

export const MultipleItems: Story = {
  render: () => (
    <>
      <DropdownItem onClick={action('항목 1 클릭')}>프로필 보기</DropdownItem>
      <DropdownItem onClick={action('항목 2 클릭')}>설정</DropdownItem>
      <DropdownItem onClick={action('항목 3 클릭')}>알림 관리</DropdownItem>
      <DropdownItem onClick={action('항목 4 클릭')} disabled>
        업그레이드 (곧 제공)
      </DropdownItem>
      <DropdownItem onClick={action('항목 5 클릭')} className="text-red-600 hover:bg-red-50">
        로그아웃
      </DropdownItem>
    </>
  ),
}
