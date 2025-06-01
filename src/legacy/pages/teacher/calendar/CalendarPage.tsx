import { useEffect, useState } from 'react'
import { EventClickArg } from '@fullcalendar/core/index.js'
import { addMonths, endOfMonth, format, startOfMonth, subMonths } from 'date-fns'
import { t } from 'i18next'
import { CoachMark } from 'react-coach-mark'
import { useUserStore } from '@/stores/user'
import { Button } from '@/atoms/Button'
import { Checkbox } from '@/atoms/Checkbox'
import { Flex } from '@/atoms/Flex'
import { FullCalendar, type CalendarData } from '@/atoms/FullCalendar'
import { Icon } from '@/atoms/Icon'
import { Text } from '@/atoms/Text'
import { ErrorBlank } from '@/legacy/components'
import { CustomTuiDetailModal } from '@/legacy/components/calendar/CustomTuiDetailModal'
import { CustomTuiModal } from '@/legacy/components/calendar/CustomTuiModal'
import { LnbCalendarsItem } from '@/legacy/components/calendar/LnbCalendarsItem'
import { Blank } from '@/legacy/components/common'
import { Guide, useCoachMark } from '@/legacy/components/common/CoachMark'
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
        <div className="w-[25%] border-r px-3 py-4">
          <Flex direction="col" gap="2" className="border-b pb-3">
            <Flex direction="row" items="center" justify="between" gap="2">
              <Text size="lg" weight="lg" variant="default">
                내 캘린더
              </Text>
              <Icon stroke name="Info" customSize={{ width: '20px', height: '20px' }} onClick={reOpenCoach} />
            </Flex>
            <Flex direction="row" items="center" gap="1">
              <Checkbox checked={!filterId} onChange={() => filterId && setFilterId(undefined)} size="md" />
              <Text size="sm" weight="sm" variant="sub">
                {t('view_all')}
              </Text>
            </Flex>
          </Flex>
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
        </div>
        <div className="scroll-box max-h-[100vh] w-full overflow-y-scroll">
          <Flex direction="row" items="center" justify="between" className="p-5">
            <Button
              size="lg"
              color="tertiary"
              variant="outline"
              children={t('today')}
              className="rounded-full"
              onClick={() => setSelectedDate(new Date())}
            />
            <Flex direction="row" items="center" justify="center" gap="6" className="flex-1">
              <Icon
                name="chevronLeft"
                size="md"
                data-action="move-prev"
                stroke
                className="cursor-pointer"
                onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
              />
              <Text size="md" weight="md" variant="title">
                {format(selectedDate, 'yyyy.MM')}
              </Text>
              <Icon
                name="chevronRight"
                size="md"
                data-action="move-next"
                stroke
                className="cursor-pointer"
                onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
              />
            </Flex>
            <Button
              size="md"
              color="primary"
              variant="solid"
              children={t('add_new_event')}
              onClick={() => {
                if (readOnly) {
                  alert('일정 추가 권한이 없습니다.')
                } else {
                  setModalOpen(true)
                }
              }}
            />
          </Flex>
          <FullCalendar
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
