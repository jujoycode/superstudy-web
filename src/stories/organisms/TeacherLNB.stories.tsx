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
    ItemProps: [
      {
        title: '출석',
        items: [
          {
            title: '출석부',
            link: '/attendance/register',
          },
          {
            title: '시간표/출석체크',
            link: '/attendance/timetable',
          },
          {
            title: '학인증',
            link: '/attendance/certificate',
          },
          {
            title: '결석신고서',
            external: 'https://www.google.com',
          },
        ],
      },
    ],
  },
}
