import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '@/atoms/Input'
import { useState } from 'react'

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Input>

const InputWithState = (args: any) => {
  const [value, setValue] = useState('')

  return <Input {...args} value={value} onChange={(e) => setValue(e.target.value)} />
}

export const DefaultInput: Story = {
  render: () => <InputWithState placeholder="기본 입력" />,
}

export const SmallInput: Story = {
  render: () => <InputWithState size="sm" placeholder="작은 입력" />,
}

export const LargeInput: Story = {
  render: () => <InputWithState size="lg" placeholder="큰 입력" />,
}

export const DisabledInput: Story = {
  render: () => <InputWithState disabled placeholder="비활성화된 입력" />,
}
