import { EventClickArg, EventInput } from '@fullcalendar/core/index.js'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import { format } from 'date-fns'
import { useEffect, useRef } from 'react'

export interface CalendarData extends Partial<EventInput> {
  title: string
  start: string | Date
  end: string | Date
}

interface CalendarProps {
  data: CalendarData[]
  now?: Date
  handleEventClick?: (e: EventClickArg) => void
  handleDayClick?: (date: Date) => void
}

/**
 * Calendar
 * @desc fullcalendar 라이브러리를 사용한 캘린더 컴포넌트입니다.
 * @author Suh Jihun
 */
export function Calendar({
  data,
  now = new Date(),
  handleEventClick = () => {},
  handleDayClick = () => {},
}: CalendarProps) {
  const calendarRef = useRef<FullCalendar>(null)

  // now의 변경을 추적하여 캘린더에 반영
  useEffect(() => {
    setNow(now)
  }, [now])

  const setNow = (date: Date) => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.gotoDate(format(date, 'yyyy-MM-dd'))
    }
  }

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        ref={calendarRef}
        events={data}
        locale="ko"
        navLinks={true}
        nowIndicator={true}
        eventClick={handleEventClick}
        navLinkDayClick={handleDayClick}
        eventContent={(eventInfo) => <>{eventInfo.event.title}</>}
      />
    </>
  )
}
