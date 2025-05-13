import { useState } from 'react'
import { makeDateToString } from '@/legacy/util/time'
import { useSchedulesCreate, useSchedulesDelete, useSchedulesFindAll, useSchedulesUpdate } from '../generated/endpoint'
import { CalendarIdEnum, RequestCreateExtendedScheduleDto } from '../generated/model'
import { errorType } from '../types'

export function useTeacherCalendarDetail() {
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>()
  const [errorMessage, setErrorMessage] = useState('')
  const [calendarId, setCalendarId] = useState<CalendarIdEnum>()

  const {
    data: calendarData,
    isLoading: isCalendarLoading,
    refetch: refetchCalendar,
  } = useSchedulesFindAll(
    {
      calendarId,
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

  const { mutateAsync: createCalendar } = useSchedulesCreate({
    mutation: {
      onSuccess: () => {
        refetchCalendar()
      },
      onError: () => {
        setErrorMessage('일정 추가에 실패했습니다.')
      },
    },
  })

  const { mutateAsync: updateCalendar } = useSchedulesUpdate({
    mutation: {
      onSuccess: () => {
        refetchCalendar()
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data ? (error?.response?.data as errorType) : undefined

        alert(errorMsg?.message || '수정에 실패했습니다.')
      },
    },
  })

  const { mutate: deleteCalendar } = useSchedulesDelete({
    mutation: {
      onSuccess: () => {
        refetchCalendar()
      },
      onError: () => {
        setErrorMessage('일정 삭제에 실패했습니다.')
      },
    },
  })

  const handleCalendarCreate = (schedule: RequestCreateExtendedScheduleDto) => {
    return createCalendar({ data: schedule })
  }

  const handleCalendarUpdate = (scheduleId: number, schedule: RequestCreateExtendedScheduleDto) => {
    return updateCalendar({ id: scheduleId, data: schedule })
  }

  const handleCalendarDelete = (scheduleId: number) => {
    deleteCalendar({ id: scheduleId })
  }

  return {
    setDateRange,
    calendarData,
    isCalendarLoading,
    refetchCalendar,
    errorMessage,
    handleCalendarCreate,
    handleCalendarUpdate,
    handleCalendarDelete,
    calendarId,
    setCalendarId,
  }
}
