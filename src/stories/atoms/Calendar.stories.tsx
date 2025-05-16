import type { Meta, StoryObj } from '@storybook/react'
import { Calendar, CalendarData } from '@/atoms/Calendar'
import { addDays, subDays } from 'date-fns'

const meta: Meta<typeof Calendar> = {
  title: 'Atoms/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    handleEventClick: { action: 'eventClicked' },
    handleDayClick: { action: 'dayClicked' },
  },
}

export default meta
type Story = StoryObj<typeof Calendar>

const today = new Date()
const mockEvents: CalendarData[] = [
  {
    title: '이벤트 1',
    start: subDays(today, 5),
    end: subDays(today, 5),
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  {
    title: '이벤트 2',
    start: today,
    end: today,
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  {
    title: '긴 이벤트',
    start: addDays(today, 2),
    end: addDays(today, 5),
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
]

export const defaultDate: Story = {
  args: {
    data: mockEvents,
    now: today,
  },
}

export const oneWeekBefore: Story = {
  args: {
    data: mockEvents,
    now: subDays(today, 7),
  },
}

export const oneWeekAfter: Story = {
  args: {
    data: mockEvents,
    now: addDays(today, 7),
  },
}

export const noEvents: Story = {
  args: {
    data: [],
    now: today,
  },
}
