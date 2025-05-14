import { EventClickArg, EventInput } from '@fullcalendar/core/index.js'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'

import { CustomTuiModal } from '@/legacy/components/calendar/CustomTuiModal'
import { MergedGroupType } from '@/legacy/container/teacher-chat-user-list'
import { Group } from '@/legacy/generated/model'

export interface CalendarData extends Partial<EventInput> {
  title: string
  start: string | Date
  end: string | Date
}

interface CalendarProps {
  data: CalendarData[]
  handleCalendarCreate?: (calendarData: CalendarData) => Promise<void>
  handleCalendarUpdate?: (id: number, calendarData: CalendarData) => Promise<void>
  now?: Date
  // TODO: 아래 Props들은 추후 legacy CustomTuiModal 변경하며 개선 예정
  schoolType?: string
  modalOpen?: boolean
  setModalOpen?: (open: boolean) => void
  groupProps?: {
    allGroups: Group[]
    selectedGroup: MergedGroupType | null
    setSelectedGroup: (group: MergedGroupType | null) => void
  }
}

/**
 * Calendar
 * @desc fullcalendar 라이브러리를 사용한 캘린더 컴포넌트입니다.
 * @author jihunsuh12@gmail.com
 */
export function Calendar({
  data,
  handleCalendarCreate = async () => {},
  handleCalendarUpdate = async () => {},
  now = new Date(),
  modalOpen = false,
  setModalOpen,
  schoolType = '',
  groupProps,
}: CalendarProps) {
  // 🧠 State 선언
  const [selectedData, setSelectedData] = useState<CalendarData>()
  const [_modalOpen, _setModalOpen] = useState<boolean>(false)

  // TODO: 더 나은 구조 고민 필요
  if (!setModalOpen) {
    setModalOpen = _setModalOpen
    modalOpen = _modalOpen
  }

  // 🧠 Ref 선언
  const calendarRef = useRef<FullCalendar>(null)

  // 🔁 Effect 처리
  // now의 변경을 추적하여 캘린더에 반영
  useEffect(() => {
    setNow(now)
  }, [now])

  // 🛠️ Function 선언 및 정의
  const setNow = (date: Date) => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.gotoDate(format(date, 'yyyy-MM-dd'))
    }
  }
  const createCalendar = (calendarData: CalendarData) => {
    handleCalendarCreate(calendarData)
      .then(() => setSelectedData(undefined))
      .catch((err) => console.error(err))
      .finally(() => setModalOpen(false))
  }
  const updateCalendar = (calendarData: CalendarData) => {
    if (!selectedData || !selectedData?.id) return
    handleCalendarUpdate(Number(selectedData.id), calendarData)
      .then(() => setSelectedData(undefined))
      .catch((err) => console.error(err))
      .finally(() => setModalOpen(false))
  }
  const handleEventClick = (e: EventClickArg) => {
    const currentData = data.find((el) => el.id === e.event.id)
    if (!currentData) return
    setSelectedData(currentData)
    setModalOpen(true)
  }
  const handleDayClick = (date: Date) => {
    if (!date) return
    const newData: CalendarData = { title: '', start: date, end: date }
    setSelectedData(newData)
    setNow(date)
    setModalOpen(true)
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
      <CustomTuiModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedData(undefined)
        }}
        onSubmit={!selectedData?.id ? createCalendar : updateCalendar}
        calendars={data}
        schedule={selectedData}
        startDate={selectedData?.start ? new Date(selectedData.start) : new Date()}
        endDate={selectedData?.end ? new Date(selectedData.end) : new Date()}
        schoolType={schoolType}
        groupProps={groupProps}
      />
    </>
  )
}
