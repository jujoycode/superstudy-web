import type { Meta, StoryObj } from '@storybook/react'
import { SearchInput } from '@/molecules/SearchInput'
import { useState } from 'react'
import { action } from '@storybook/addon-actions'

const meta = {
  title: 'Molecules/SearchInput',
  component: SearchInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SearchInput>

export default meta
type Story = StoryObj<typeof SearchInput>

// 기본 SearchInput 스토리
export const Default: Story = {
  parameters: {
    docs: {
      story: { inline: true },
    },
  },
  render: () => {
    const [value, setValue] = useState('')

    return (
      <div className="w-96">
        <SearchInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={action('onKeyDown')}
          placeholder="검색어를 입력하세요"
        />
      </div>
    )
  },
}

// 초기값이 있는 SearchInput 스토리
export const WithInitialValue: Story = {
  parameters: {
    docs: {
      story: { inline: true },
    },
  },
  render: () => {
    const [value, setValue] = useState('초기 검색어')

    return (
      <div className="w-96">
        <SearchInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={action('onKeyDown')}
          placeholder="검색어를 입력하세요"
        />
      </div>
    )
  },
}

// 다양한 너비의 SearchInput 스토리
export const DifferentWidths: Story = {
  parameters: {
    docs: {
      story: { inline: true },
    },
  },
  render: () => {
    const [value1, setValue1] = useState('')
    const [value2, setValue2] = useState('')
    const [value3, setValue3] = useState('')

    return (
      <div className="flex flex-col gap-4">
        <div className="w-64">
          <SearchInput value={value1} onChange={(e) => setValue1(e.target.value)} placeholder="작은 너비 (w-64)" />
        </div>
        <div className="w-96">
          <SearchInput value={value2} onChange={(e) => setValue2(e.target.value)} placeholder="중간 너비 (w-96)" />
        </div>
        <div className="w-[500px]">
          <SearchInput value={value3} onChange={(e) => setValue3(e.target.value)} placeholder="큰 너비 (w-[500px])" />
        </div>
      </div>
    )
  },
}
