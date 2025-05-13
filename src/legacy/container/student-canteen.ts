import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { useCanteenFindByYearMonth, useSchedulesFindAll } from '@/legacy/generated/endpoint'
import { CalendarIdEnum, Schedule } from '@/legacy/generated/model'
import { getCalendarRange, makeDateToString } from '@/legacy/util/time'
import { childState } from '@/stores'

export function useStudentCanteen() {
  const child = useRecoilValue(childState)
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [errorMessage, setErrorMessage] = useState('')

  const { data: schedules, isLoading: isScheduleLoading } = useSchedulesFindAll(
    {
      calendarId: CalendarIdEnum.NUMBER_0,
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
      request: {
        headers: { 'child-user-id': child?.id },
      },
    },
  )

  const daysWithSchedule: string[] = []
  const schedulesOrderByDay: { [key: string]: Schedule[] } = {}
  schedules?.map((s: any) => {
    const current = new Date(s.start)
    const end = new Date(s.end)
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

  const {
    data: canteens,
    isLoading: isCanteenLoading,
    refetch: refetchCanteen,
  } = useCanteenFindByYearMonth(
    {
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth() + 1,
    },
    {
      query: {
        enabled: !!selectedDate,
        onError: () => {
          setErrorMessage('급식표를 불러오는데 실패했습니다.')
        },
      },
      request: {
        headers: { 'child-user-id': child?.id },
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
    isLoading: isCanteenLoading || isScheduleLoading,
    refetchCanteen,
  }
}
