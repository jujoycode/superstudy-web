import type { Meta, StoryObj } from '@storybook/react'
import { Text } from '@/atoms/Text'

const meta: Meta<typeof Text> = {
  title: 'Atoms/Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Text>

export const DefaultText: Story = {
  args: {
    children: '기본 텍스트입니다.',
  },
}

export const SmallText: Story = {
  args: {
    children: '작은 크기의 텍스트입니다.',
    size: 'sm',
  },
}

export const MediumText: Story = {
  args: {
    children: '중간 크기의 텍스트입니다.',
    size: 'md',
  },
}

export const LargeText: Story = {
  args: {
    children: '큰 크기의 텍스트입니다.',
    size: 'lg',
  },
}

export const LightWeightText: Story = {
  args: {
    children: '가벼운 두께의 텍스트입니다.',
    weight: 'sm',
  },
}

export const MediumWeightText: Story = {
  args: {
    children: '중간 두께의 텍스트입니다.',
    weight: 'md',
  },
}

export const BoldWeightText: Story = {
  args: {
    children: '두꺼운 두께의 텍스트입니다.',
    weight: 'lg',
  },
}

export const CustomSpanText: Story = {
  args: {
    children: 'span 요소로 렌더링된 텍스트입니다.',
    as: 'span',
  },
}

export const HeadingText: Story = {
  args: {
    children: '제목 요소로 렌더링된 텍스트입니다.',
    as: 'h1',
    weight: 'lg',
    size: 'lg',
  },
}

export const CustomClassText: Story = {
  args: {
    children: '커스텀 클래스가 적용된 텍스트입니다.',
    className: 'text-blue-500 underline',
  },
}
