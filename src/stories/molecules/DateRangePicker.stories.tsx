import type { Meta, StoryObj } from '@storybook/react'
import { DateRangePicker } from '@/molecules/DateRangePicker'
import { useState } from 'react'
import { Button } from '@/atoms/Button'
import { DateRange } from '@/atoms/Calendar'

const meta = {
  title: 'Molecules/DateRangePicker',
  component: DateRangePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DateRangePicker>

export default meta
type Story = StoryObj<typeof DateRangePicker>

// 기본 DateRangePicker 스토리
export const Default: Story = {
  parameters: {
    docs: {
      story: { inline: true },
    },
  },
  render: () => {
    const [dateRange, setDateRange] = useState<DateRange>({
      from: new Date(),
      to: new Date(new Date().setDate(new Date().getDate() + 7)),
    })

    return <DateRangePicker.Default dateRange={dateRange} setDateRange={setDateRange} />
  },
}

// 커스텀 트리거를 사용하는 DateRangePicker 스토리
export const WithCustomTrigger: Story = {
  parameters: {
    docs: {
      story: { inline: true },
    },
  },
  render: () => {
    const [dateRange, setDateRange] = useState<DateRange>({
      from: new Date(),
      to: new Date(new Date().setDate(new Date().getDate() + 7)),
    })

    return (
      <DateRangePicker dateRange={dateRange} setDateRange={setDateRange}>
        <Button variant="outline">기간 선택하기</Button>
      </DateRangePicker>
    )
  },
}

// 초기 날짜가 없는 DateRangePicker 스토리
export const WithoutInitialDates: Story = {
  parameters: {
    docs: {
      story: { inline: true },
    },
  },
  render: () => {
    const [dateRange, setDateRange] = useState<DateRange>({} as DateRange)

    return <DateRangePicker.Default dateRange={dateRange} setDateRange={setDateRange} />
  },
}

// 다른 정렬을 사용하는 DateRangePicker 스토리
export const AlignedToEnd: Story = {
  parameters: {
    docs: {
      story: { inline: true },
    },
  },
  render: () => {
    const [dateRange, setDateRange] = useState<DateRange>({
      from: new Date(),
      to: new Date(new Date().setDate(new Date().getDate() + 7)),
    })

    return (
      <div className="flex w-96 justify-end">
        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} align="end">
          <Button variant="outline">오른쪽 정렬</Button>
        </DateRangePicker>
      </div>
    )
  },
}
