import type { Meta, StoryObj } from '@storybook/react'
import { Calendar, DateRange } from '@/atoms/Calendar'
import { useState } from 'react'

const meta: Meta<typeof Calendar> = {
  title: 'Atoms/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Calendar>

export const DefaultCalendar: Story = {
  render: () => <Calendar />,
}

export const SelectedCalendar: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date())

    return <Calendar mode="single" selected={date} onSelect={setDate} />
  },
}

export const RangeCalendar: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange | undefined>({
      from: new Date(),
      to: new Date(new Date().setDate(new Date().getDate() + 5)),
    })

    return <Calendar mode="range" selected={range} onSelect={setRange} />
  },
}
