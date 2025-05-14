import { EventClickArg, EventInput } from '@fullcalendar/core/index.js'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'

import { CustomTuiModal } from '@/legacy/components/calendar/CustomTuiModal'

export interface CalendarData extends Partial<EventInput> {
  title: string
  start: string | Date
  end: string | Date
}

interface CalendarProps {
  data: CalendarData[]
  schoolType?: string
  handleCalendarCreate?: (calendarData: CalendarData) => Promise<void>
  handleCalendarUpdate?: (id: number, calendarData: CalendarData) => Promise<void>
  now?: Date
  refetch?: () => void
  groupProps?: {
    allGroups: any[]
    selectedGroup: any
    setSelectedGroup: (group: any) => void
  }
}

export const Calendar = ({
  data,
  schoolType = '',
  handleCalendarCreate = async () => {},
  handleCalendarUpdate = async () => {},
  now = new Date(),
  refetch = () => {},
  groupProps,
}: CalendarProps) => {
  const [selectedData, setSelectedData] = useState<CalendarData>()
  const [modalOpen, setModalOpen] = useState(false)
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

  const handleCreateSchedule = (calendarData: CalendarData) => {
    handleCalendarCreate(calendarData)
      .then(() => {
        setModalOpen(false)
        setSelectedData(undefined)
        refetch()
      })
      .catch((err) => {
        console.log(err?.message)
        setModalOpen(false)
      })
  }

  const handleUpdateSchedule = (calendarData: CalendarData) => {
    if (!selectedData || !selectedData?.id) return
    handleCalendarUpdate(Number(selectedData.id), calendarData)
      .then(() => {
        setSelectedData(undefined)
        refetch()
        setModalOpen(false)
      })
      .catch((err) => {
        console.log(err?.message)
        setModalOpen(false)
      })
  }

  const handleEventClick = (e: EventClickArg) => {
    const currentData = data.find((el) => el.id === e.event.id)
    if (currentData) {
      setSelectedData(currentData)
      setModalOpen(true)
    }
  }

  const handleDayClick = (date: Date) => {
    if (!date) return
    setSelectedData({
      title: '',
      start: date,
      end: date,
    })
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
        events={
          data?.map((el) => ({
            ...el,
            start: format(new Date(el.start), 'yyyy-MM-dd'),
            end: format(new Date(el.end), 'yyyy-MM-dd'),
          })) || []
        }
        locale="ko"
        navLinks={true}
        nowIndicator={true}
        eventClick={handleEventClick}
        navLinkDayClick={handleDayClick}
        eventContent={(eventInfo) => <>{eventInfo.event.title}</>}
      />
      <CustomTuiModal
        {...{
          isOpen: modalOpen,
          onClose: () => {
            setModalOpen(false)
            setSelectedData(undefined)
          },
          onSubmit: !selectedData?.id ? handleCreateSchedule : handleUpdateSchedule,
          calendars: data,
          schedule: selectedData,
          startDate: selectedData?.start ? new Date(selectedData.start) : new Date(),
          endDate: selectedData?.end ? new Date(selectedData.end) : new Date(),
          schoolType: schoolType,
          groupProps: groupProps,
        }}
      />
    </>
  )
}
