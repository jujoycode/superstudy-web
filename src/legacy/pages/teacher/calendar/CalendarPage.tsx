import { EventClickArg } from '@fullcalendar/core/index.js'
import { addMonths, endOfMonth, format, startOfMonth, subMonths } from 'date-fns'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import { CoachMark } from 'react-coach-mark'
import { Button } from '@/atoms/Button'
import { Calendar, type CalendarData } from '@/atoms/Calendar'
import { useUserStore } from '@/stores/user'
import { ErrorBlank } from '@/legacy/components'
import { CustomTuiDetailModal } from '@/legacy/components/calendar/CustomTuiDetailModal'
import { CustomTuiModal } from '@/legacy/components/calendar/CustomTuiModal'
import { LnbCalendarsItem } from '@/legacy/components/calendar/LnbCalendarsItem'
import { Blank, Label } from '@/legacy/components/common'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { Guide, useCoachMark } from '@/legacy/components/common/CoachMark'
import { Icon } from '@/legacy/components/common/icons'
import { useTeacherCalendarDetail } from '@/legacy/container/teacher-calendar-detail'
import { useTeacherChatUserList } from '@/legacy/container/teacher-chat-user-list'
import { CalendarIdEnum, Role, ScheduleCategoryEnum } from '@/legacy/generated/model'
import { MenuType } from '@/legacy/types'
import { weekAfter, weekAgo } from '@/legacy/util/time'

export function CalendarPage() {
  const { me } = useUserStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [selectedData, setSelectedData] = useState<CalendarData>()
  const [_selectedDate, _setSelectedDate] = useState<Date>()

  const selectedDate = _selectedDate || new Date()

  const setSelectedDate = (date: Date) => {
    _setSelectedDate(date)
    setDateRange({
      startDate: weekAgo(startOfMonth(date)),
      endDate: weekAfter(endOfMonth(date)),
    })
  }

  const {
    setDateRange,
    errorMessage,
    calendarData,
    isCalendarLoading,
    refetchCalendar,
    handleCalendarCreate,
    handleCalendarUpdate,
    handleCalendarDelete,
    calendarId: filterId,
    setCalendarId: setFilterId,
  } = useTeacherCalendarDetail()

  const groupProps = useTeacherChatUserList(MenuType.List)

  useEffect(() => {
    if (!_selectedDate) {
      setSelectedDate(new Date())
    }
  }, [])

  // 코치마크
  const coachList: Array<Guide> = [
    {
      comment: (
        <div>
          {t('display_academic_schedule')}
          <br />
          {t('display_teacher_schedule')}
          <br />
          {t('event_type')}
          <div className="ml-2 text-sm">
            - {t('general_notice')}
            <br />- {t('no_experiential_learning_description')}
            <br />- {t('holiday_notice')}
          </div>
          <br />
          <span className="text-red-400">{t('calendar_display')}</span>
        </div>
      ),
    },
  ]
  const { coach, refs, reOpenCoach } = useCoachMark('calenderLineAdmin', coachList)

  const CALENDAR_TYPES = [
    {
      id: CalendarIdEnum.NUMBER_0,
      name: t('academic_schedule'),
      bgColor: '#9E5FFF',
      borderColor: '#9E5FFF',
    },
    {
      id: CalendarIdEnum.NUMBER_1,
      name: t('teacher_schedule'),
      bgColor: '#00a9ff',
      borderColor: '#00a9ff',
    },
    {
      id: CalendarIdEnum.NUMBER_2,
      name: t('group_schedule'),
      bgColor: '#8CD23C',
      borderColor: '#8CD23C',
    },
  ]

  const schoolType = me?.school?.schoolType || ''
  const readOnly = me?.role !== Role.ADMIN && me?.canEditTimetable === false
  const selectedType = CALENDAR_TYPES.find((TYPE) => TYPE.id === selectedData?.calendarId)

  const data: CalendarData[] =
    calendarData?.map((el) => ({
      id: String(el.id),
      title: [el.group && `[${el.group.name}] `, el.title, el.attendee && el.attendee !== '일반' && `(${el.attendee})`]
        .filter((el) => !!el)
        .join(' '),
      start: el.start,
      end: el.end,
      backgroundColor: CALENDAR_TYPES.find((TYPE) => TYPE.id === el.calendarId)?.bgColor || '',
    })) || []

  const selectedCalendarData = calendarData?.find((el) => String(el.id) === selectedData?.id)

  const formatCalendarData = (calendarData: CalendarData) => ({
    title: calendarData.title,
    location: calendarData.location,
    isAllDay: calendarData.isAllDay,
    start: String(calendarData.start),
    end: String(calendarData.end),
    category: calendarData.isAllDay ? ScheduleCategoryEnum.allday : ScheduleCategoryEnum.time,
    calendarId: calendarData.calendarId,
    attendee: calendarData.attendee,
    grade: calendarData.grade,
    groupId: Number(calendarData.groupId),
  })

  const createCalendar = async (calendarData: CalendarData) => {
    setLoading(true)
    try {
      await handleCalendarCreate(formatCalendarData(calendarData))
      await refetchCalendar()
      setSelectedData(undefined)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setModalOpen(false)
    }
  }

  const updateCalendar = async (calendarData: CalendarData) => {
    if (!selectedData || !selectedData?.id) return
    setLoading(true)
    try {
      await handleCalendarUpdate(Number(selectedData.id), formatCalendarData(calendarData))
      await refetchCalendar()
      setSelectedData(undefined)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setModalOpen(false)
    }
  }

  const deleteCalendar = async (id: number) => {
    setLoading(true)
    try {
      await handleCalendarDelete(id)
      await refetchCalendar()
      setSelectedData(undefined)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setModalOpen(false)
      setDetailModalOpen(false)
    }
  }

  const handleEventClick = (e: EventClickArg) => {
    const currentData = data.find((el) => el.id === e.event.id)
    if (!currentData) return
    setSelectedData(currentData)
    setDetailModalOpen(true)
  }

  const handleDayClick = (date: Date) => {
    if (!date) return
    const newData: CalendarData = { title: '', start: date, end: date }
    setSelectedData(newData)
    setSelectedDate(date)
    setModalOpen(true)
  }

  const formatDateRange = (start: string | Date, end?: string | Date) => {
    const startDate = format(new Date(start), 'yyyy.MM.dd')
    if (!end || end === start) return startDate
    return `${startDate} ~ ${format(new Date(end), 'yyyy.MM.dd')}`
  }

  return (
    <>
      {(isCalendarLoading || isLoading) && <Blank />}
      {errorMessage && <ErrorBlank />}
      {<CoachMark {...coach} />}
      <div className="flex h-full w-full">
        <div className="w-[25%] border-r border-gray-500 px-3 py-2">
          <div className="flex items-center space-x-2 border-b border-[#E5E5E5] pb-3">
            <Button
              children={t('add_new_event')}
              onClick={() => {
                if (readOnly) {
                  alert('일정 추가 권한이 없습니다.')
                } else {
                  setModalOpen(true)
                }
              }}
              className="rounded-full"
            />
            <div
              className="cursor-pointer rounded-full border border-gray-500 px-2 text-sm text-gray-500"
              onClick={reOpenCoach}
            >
              ?
            </div>
          </div>
          <div className="border-b border-[#e5e5e5] px-3 py-4">
            <Label.row>
              <Checkbox checked={!filterId} onChange={() => filterId && setFilterId(undefined)} />
              <strong>{t('view_all')}</strong>
            </Label.row>
          </div>
          <div className="space-y-2 border-b border-[#e5e5e5] px-3 py-4" ref={refs[0]}>
            {CALENDAR_TYPES.map(({ id, name, bgColor }) => (
              <LnbCalendarsItem
                key={id}
                value={id}
                checked={false}
                color={bgColor}
                text={name}
                onClick={() => setFilterId(id)}
              />
            ))}
          </div>
          <div className="text-10 absolute bottom-[12px] pl-4 text-[#999]">© NHN Corp.</div>
        </div>
        <div className="scroll-box max-h-[100vh] w-full overflow-y-scroll">
          <div className="flex items-center space-x-6 p-4">
            <button
              children={t('today')}
              className="rounded-full border border-gray-300 px-6 py-2 text-sm hover:border-gray-400"
              onClick={() => setSelectedDate(new Date())}
            />
            <div className="flex items-center space-x-2">
              <button
                className="rounded-full border border-gray-300 p-2 hover:border-gray-400"
                onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
              >
                <Icon.ChevronLeft className="h-4 w-4" data-action="move-prev" />
              </button>
              <p>{format(selectedDate, 'yyyy-MM-dd')}</p>
              <button
                className="rounded-full border border-gray-300 p-2 hover:border-gray-400"
                onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
              >
                <Icon.ChevronRight className="h-4 w-4" data-action="move-next" />
              </button>
            </div>
          </div>
          <Calendar
            data={data}
            full
            now={selectedDate}
            handleEventClick={handleEventClick}
            handleDayClick={handleDayClick}
          />
          {detailModalOpen && selectedData && (
            <CustomTuiDetailModal
              title={selectedData.title}
              date={formatDateRange(selectedData.start, selectedData.end)}
              type={selectedType?.name || ''}
              backgroundColor={selectedType?.bgColor || ''}
              onClose={() => setDetailModalOpen(false)}
              onEdit={() => {
                setModalOpen(true)
                setDetailModalOpen(false)
              }}
              onDelete={() => deleteCalendar(Number(selectedData.id))}
            />
          )}
          <CustomTuiModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false)
              setSelectedData(undefined)
            }}
            onSubmit={!selectedData?.id ? createCalendar : updateCalendar}
            calendars={CALENDAR_TYPES}
            schedule={selectedCalendarData}
            startDate={selectedData?.start ? new Date(selectedData.start) : new Date()}
            endDate={selectedData?.end ? new Date(selectedData.end) : new Date()}
            schoolType={schoolType}
            groupProps={groupProps}
          />
        </div>
      </div>
    </>
  )
}
