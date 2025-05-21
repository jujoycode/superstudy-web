import { EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core/index.js'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import clsx from 'clsx'
import { format } from 'date-fns'
import { useEffect, useRef } from 'react'

export interface CalendarData extends Partial<EventInput> {
  title: string
  start: string | Date
  end: string | Date
}

interface CalendarProps {
  data: CalendarData[]
  full?: boolean
  width?: number
  aspectRatio?: 1 | 1.35
  className?: string
  now?: Date
  handleEventClick?: (e: EventClickArg) => void
  handleDayClick?: (date: Date) => void
}

/**
 * 캘린더 컴포넌트
 *
 * fullcalendar 라이브러리를 사용하여 구현된 캘린더입니다.
 * 이벤트 표시 및 날짜 클릭 기능을 제공합니다.
 *
 * @param data - 캘린더에 표시할 이벤트 데이터 배열
 * @param now - 현재 날짜 (기본값: 현재 날짜)
 * @param handleEventClick - 이벤트 클릭 시 호출될 함수
 * @param handleDayClick - 날짜 클릭 시 호출될 함수
 */
export function Calendar({
  data,
  className = '',
  full = true,
  width = 500,
  aspectRatio = 1,
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
  const widthClass = full ? 'w-full' : `w-[${width}px]`

  function renderEventContent(eventInfo: EventContentArg) {
    return (
      <span
        className="w-full cursor-pointer truncate px-1 text-[12px] font-bold text-white"
        style={{ backgroundColor: eventInfo.backgroundColor, borderColor: eventInfo.backgroundColor }}
      >
        {eventInfo.event.title}
      </span>
    )
  }

  return (
    <div className={clsx('sunday-red', widthClass, className)}>
      <FullCalendar
        aspectRatio={aspectRatio}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        ref={calendarRef}
        expandRows
        events={data}
        locale="ko"
        navLinks={true}
        nowIndicator={true}
        eventClick={handleEventClick}
        navLinkDayClick={handleDayClick}
        eventContent={renderEventContent}
        dayMaxEvents={2}
        moreLinkContent={(args) => `+${args.num} more`}
      />
    </div>
  )
}
