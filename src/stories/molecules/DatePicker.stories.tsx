import type { Meta, StoryObj } from '@storybook/react'
import { DatePicker } from '@/molecules/DatePicker'
import { Button } from '@/atoms/Button'
import { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

const meta = {
  title: 'Molecules/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

// 기본 DatePicker 스토리
export const Default: Story = {
  args: {
    date: new Date(),
    setDate: (date: Date) => console.log('선택된 날짜:', format(date, 'yyyy년 MM월 dd일', { locale: ko })),
  },
  render: (args) => {
    const [date, setDate] = useState<Date>(args.date)
    return <DatePicker.Default date={date} setDate={setDate} />
  },
}

// 커스텀 트리거를 사용하는 DatePicker 스토리
export const WithCustomTrigger: Story = {
  args: {
    date: new Date(),
    setDate: (date: Date) => console.log('선택된 날짜:', format(date, 'yyyy년 MM월 dd일', { locale: ko })),
  },
  render: (args) => {
    const [date, setDate] = useState<Date>(args.date)
    return (
      <DatePicker date={date} setDate={setDate}>
        <Button variant="outline">날짜 선택하기</Button>
      </DatePicker>
    )
  },
}

// 초기 날짜가 없는 DatePicker 스토리
export const WithoutInitialDate: Story = {
  args: {
    date: new Date(),
    setDate: (date: Date) => console.log('선택된 날짜:', format(date, 'yyyy년 MM월 dd일', { locale: ko })),
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(undefined)
    return <DatePicker.Default date={date || args.date} setDate={setDate} />
  },
}

// 미래 날짜만 선택 가능한 DatePicker 스토리
export const FutureDatesOnly: Story = {
  args: {
    date: new Date(),
    setDate: (date: Date) => console.log('선택된 날짜:', format(date, 'yyyy년 MM월 dd일', { locale: ko })),
  },
  render: (args) => {
    const [date, setDate] = useState<Date>(args.date)
    return <DatePicker.Default date={date} setDate={setDate} />
  },
}
