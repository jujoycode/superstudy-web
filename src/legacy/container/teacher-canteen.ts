import { useEffect, useState } from 'react'

import { useCanteenFindByYearMonth, useSchedulesFindAll } from '@/legacy/generated/endpoint'
import type { ResponseExtendedScheduleDto } from '@/legacy/generated/model'
import { getCalendarRange, makeDateToString } from '@/legacy/util/time'

export function useTeacherCanteen() {
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>()
  const [selectedDate, setSelectedDate] = useState(new Date())

  const [errorMessage, setErrorMessage] = useState('')

  const { data: schedules, isLoading: isScheduleLoading } = useSchedulesFindAll(
    {
      startDate: makeDateToString(dateRange?.startDate || new Date()),
      endDate: makeDateToString(dateRange?.endDate || new Date()),
    },
    {
      query: {
        enabled: !!dateRange,
        onError: () => {
          setErrorMessage('일정을 불러오는데 실패했습니다.')
        },
      },
    },
  )

  const daysWithSchedule: string[] = []
  const schedulesOrderByDay: { [key: string]: ResponseExtendedScheduleDto[] } = {}
  schedules?.map((s: any) => {
    const current = new Date(s.start)
    const end = new Date(s.end)

    const MAX_DATE_RANGE = 365 * 2 // 2년으로 제한합니다.
    const dateDifference = Math.ceil((end.getTime() - current.getTime()) / (1000 * 60 * 60 * 24))

    if (dateDifference < 0 || dateDifference > MAX_DATE_RANGE) {
      console.error(`날짜 설정에 문제가 있습니다.`)
      return
    }

    while (current < end) {
      if (!daysWithSchedule.includes(makeDateToString(current))) {
        daysWithSchedule.push(makeDateToString(current))
      }

      if (schedulesOrderByDay[makeDateToString(current)]) {
        schedulesOrderByDay[makeDateToString(current)].push(s)
      } else {
        schedulesOrderByDay[makeDateToString(current)] = [s]
      }

      current.setDate(current.getDate() + 1)
    }
  })

  const { data: canteens, isLoading: isCanteenLoading } = useCanteenFindByYearMonth(
    {
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth() + 1,
    },
    {
      query: {
        onError: () => {
          setErrorMessage('급식표를 불러오는데 실패했습니다.')
        },
      },
    },
  )

  useEffect(() => {
    const [startDate, endDate] = getCalendarRange(selectedDate)
    setDateRange({ startDate, endDate })
  }, [selectedDate])

  return {
    daysWithSchedule,
    errorMessage,
    selectedDate,
    setSelectedDate,
    selectedCanteen: canteens?.find((c) => c.date === makeDateToString(selectedDate)),
    selectedSchedules: schedulesOrderByDay[makeDateToString(selectedDate)],
    schedulesOrderByDay,
    isLoading: isCanteenLoading || isScheduleLoading,
  }
}
