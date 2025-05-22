import type { Meta, StoryObj } from '@storybook/react'
import { TeacherLNB } from '@/organisms/LNB/TeacherLNB'

const meta = {
  title: 'Organisms/TeacherLNB',
  component: TeacherLNB,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TeacherLNB>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    HeaderProps: {
      name: '김수학선생님',
      email: 'team@super.kr',
      school: '슈퍼고등학교',
    },
  },
}
