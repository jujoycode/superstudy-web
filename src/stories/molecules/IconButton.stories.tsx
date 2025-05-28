import type { Meta, StoryObj } from '@storybook/react'
import { IconButton } from '@/molecules/IconButton'
import { action } from '@storybook/addon-actions'

const meta = {
  title: 'Molecules/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof IconButton>

// 앞에 아이콘이 있는 버튼 스토리
export const IconInFront: Story = {
  args: {
    children: '아이콘 버튼',
    iconName: 'ssSearch',
    position: 'front',
    stroke: true,
    onClick: action('clicked'),
  },
}

// 뒤에 아이콘이 있는 버튼 스토리
export const IconInBack: Story = {
  args: {
    children: '아이콘 버튼',
    iconName: 'chevronRight',
    position: 'back',
    stroke: true,
    onClick: action('clicked'),
  },
}

// 다양한 크기의 아이콘 스토리
export const DifferentIconSizes: Story = {
  parameters: {
    docs: {
      story: { inline: true },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <IconButton iconName="ssSearch" position="front" stroke iconSize="sm" onClick={action('clicked small')}>
        작은 아이콘
      </IconButton>

      <IconButton iconName="ssSearch" position="front" stroke iconSize="md" onClick={action('clicked medium')}>
        중간 아이콘
      </IconButton>

      <IconButton iconName="ssSearch" position="front" stroke iconSize="lg" onClick={action('clicked large')}>
        큰 아이콘
      </IconButton>
    </div>
  ),
}

// 다양한 버튼 변형 스토리
export const DifferentVariants: Story = {
  parameters: {
    docs: {
      story: { inline: true },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <IconButton iconName="CheckCircle" position="front" stroke onClick={action('clicked solid')} variant="solid">
        Solid 버튼
      </IconButton>

      <IconButton iconName="CheckCircle" position="front" stroke onClick={action('clicked outline')} variant="outline">
        Outline 버튼
      </IconButton>

      <IconButton iconName="CheckCircle" position="front" stroke onClick={action('clicked ghost')} variant="ghost">
        Ghost 버튼
      </IconButton>

      <IconButton iconName="CheckCircle" position="front" stroke onClick={action('clicked link')} variant="link">
        Link 버튼
      </IconButton>
    </div>
  ),
}

// 커스텀 색상의 아이콘 스토리
export const CustomColorIcons: Story = {
  parameters: {
    docs: {
      story: { inline: true },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <IconButton iconName="Heart" position="front" stroke iconColor="primary" onClick={action('clicked primary')}>
        기본 색상
      </IconButton>

      <IconButton iconName="Heart" position="front" stroke iconColor="red-500" onClick={action('clicked red')}>
        빨간색
      </IconButton>

      <IconButton iconName="Heart" position="front" stroke iconColor="blue-500" onClick={action('clicked blue')}>
        파란색
      </IconButton>

      <IconButton iconName="Heart" position="front" stroke iconColor="green-500" onClick={action('clicked green')}>
        초록색
      </IconButton>
    </div>
  ),
}
