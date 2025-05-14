import { addYears, eachDayOfInterval, format } from 'date-fns'
import { chain, concat, flatten } from 'lodash'
import { useState } from 'react'
import { useSchedulesFindRejectSchedule } from '@/legacy/generated/endpoint'
import { useUserStore } from '@/stores/user'

enum RejectScheduleType {
  HOLIDAY = '공휴일',
  NOT_SELECTABLE = '체험학습지정불가',
}

export function useCommonGetHolidays() {
  const [holidayInSchedule, setHolidayInSchedule] = useState<Date[]>([])
  const [excludeDates, setExcludeDates] = useState<Date[]>([])
  const [holidays, setHolidays] = useState<Date[]>([])

  const { child } = useUserStore()

  const _uniqDate = (date: Date, i: number, self: Date[]) => {
    return self.findIndex((d) => d.getTime() === date.getTime()) === i
  }

  const { error, isLoading } = useSchedulesFindRejectSchedule(
    {
      startDate: format(new Date().setDate(1), 'yyyy-MM-dd'),
      endDate: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
    },
    {
      request: {
        headers: {
          'child-user-id': child?.id,
        },
      },
      query: {
        onSuccess: (res) => {
          const holidaySchedules = chain(res)
            .filter((schedule) => schedule.attendee === RejectScheduleType.HOLIDAY)
            .map((schedule) => {
              return eachDayOfInterval({
                start: new Date(schedule.start),
                end: new Date(schedule.end),
              })
            })
            .value()
          const excludeSchedules = chain(res)
            .filter((schedule) => schedule.attendee === RejectScheduleType.NOT_SELECTABLE)
            .map((schedule) => {
              return eachDayOfInterval({
                start: new Date(schedule.start),
                end: new Date(schedule.end),
              })
            })
            .value()
          setHolidayInSchedule(flatten(excludeSchedules).filter(_uniqDate))
          setHolidays(flatten(holidaySchedules).filter(_uniqDate))
          setExcludeDates(concat(flatten(excludeSchedules), flatten(holidaySchedules)).filter(_uniqDate))
        },
      },
    },
  )

  return {
    error,
    isLoading,
    excludeDates,
    holidayInSchedule,
    holidays,
  }
}
