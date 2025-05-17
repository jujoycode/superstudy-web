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
      name: '김선생',
      email: 'teacher@example.com',
      school: '슈퍼고등학교',
      src: 'https://via.placeholder.com/150',
    },
  },
}
