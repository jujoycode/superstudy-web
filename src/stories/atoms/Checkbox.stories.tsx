import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from '@/atoms/Checkbox'
import { useState } from 'react'

const meta: Meta<typeof Checkbox> = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const DefaultCheckbox: Story = {
  args: {
    disabled: false,
  },
}

export const ControlledCheckbox: Story = {
  render: () => {
    const [isChecked, setIsChecked] = useState(false)

    const handleChange = () => {
      setIsChecked(!isChecked)
    }

    return (
      <div className="flex gap-2">
        <Checkbox checked={isChecked} onChange={handleChange} id="controlled-checkbox" />
        <span className="text-sm text-gray-600">체크박스 상태: {isChecked ? '체크됨' : '체크되지 않음'}</span>
      </div>
    )
  },
}
