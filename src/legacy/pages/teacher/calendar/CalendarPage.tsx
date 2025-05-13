import Calendar from '@toast-ui/react-calendar'
import { t } from 'i18next'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CoachMark } from 'react-coach-mark'
import { useRecoilValue } from 'recoil'
import { MenuType } from 'src/types'
import { ErrorBlank } from '@/legacy/components'
import { CustomTuiModal } from '@/legacy/components/calendar/CustomTuiModal'
import { LnbCalendarsItem } from '@/legacy/components/calendar/LnbCalendarsItem'
import { Blank, Label } from '@/legacy/components/common'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { Guide, useCoachMark } from '@/legacy/components/common/CoachMark'
import { Icon } from '@/legacy/components/common/icons'
import { useTeacherCalendarDetail } from '@/legacy/container/teacher-calendar-detail'
import { useTeacherChatUserList } from '@/legacy/container/teacher-chat-user-list'
import { CalendarIdEnum, Role } from '@/legacy/generated/model'
import { DayAfter, DayAgo, makeDateToString } from '@/legacy/util/time'
import { languageState, meState } from '@/stores'
import 'tui-calendar/dist/tui-calendar.css'
import 'tui-date-picker/dist/tui-date-picker.css'
import 'tui-time-picker/dist/tui-time-picker.css'
import './CalendarPage.css'

// export const attendees = [
//   { id: '1', name: t('general') },
//   { id: '2', name: t('no_experiential_learning') },
//   { id: '3', name: t('holiday') },
// ];

export function CalendarPage() {
  const {
    setDateRange,
    errorMessage,
    calendarData: schedules,
    isCalendarLoading,
    refetchCalendar,
    handleCalendarCreate,
    handleCalendarUpdate,
    handleCalendarDelete,
    calendarId: filterId,
    setCalendarId: setFilterId,
  } = useTeacherCalendarDetail()

  // 그룹 조회
  const groupProps = useTeacherChatUserList(MenuType.List)
  const [modalOpen, setModalOpen] = useState(false)
  const [event, setEvent] = useState<any>(null)
  const calendarRef = useRef<any>(null)
  const [currentDateString, setCurrentDateString] = useState('')
  const [isLoading, setLoading] = useState(false)

  const me = useRecoilValue(meState)
  const language = useRecoilValue(languageState)

  const calendars = [
    {
      id: CalendarIdEnum.NUMBER_0,
      name: t('academic_schedule'),
      bgColor: '#9e5fff',
      borderColor: '#9e5fff',
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

  const getDayName = useMemo(() => {
    console.log(language)
    return (model: any) => {
      let dayName = ''
      switch (model.label) {
        case 'Sun':
          dayName = language === 'ko' ? '일' : 'Sun'
          break
        case 'Mon':
          dayName = language === 'ko' ? '월' : 'Mon'
          break
        case 'Tue':
          dayName = language === 'ko' ? '화' : 'Tue'
          break
        case 'Wed':
          dayName = language === 'ko' ? '수' : 'Wed'
          break
        case 'Thu':
          dayName = language === 'ko' ? '목' : 'Thu'
          break
        case 'Fri':
          dayName = language === 'ko' ? '금' : 'Fri'
          break
        case 'Sat':
          dayName = language === 'ko' ? '토' : 'Sat'
          break
      }
      return `<span class="tui-full-calendar-dayname-name" style="padding-left:calc(50% - 4px);">${dayName}</span>`
    }
  }, [language])

  const readOnly = me?.role !== Role.ADMIN && me?.canEditTimetable === false

  const onClickNavi = (event: any) => {
    const calendar = calendarRef?.current?.getInstance()
    if (calendar) {
      const { target } = event
      let action = target.dataset ? target.dataset.action : target.getAttribute('data-action')
      action = action?.replace('move-', '')

      const _date = calendar.getDate().toDate()
      _date.setDate(1)
      calendar.setDate(_date)

      typeof calendar[action] === 'function' && calendar[action]()
      calendar.render()

      setCurrentDateString(makeDateToString(calendar.getDate()) || '')
    }
  }

  const handleCreateSchedule = (scheduleData: any) => {
    try {
      setModalOpen(false)
      setEvent(null)
      handleCalendarCreate({
        title: scheduleData?.title,
        location: scheduleData?.location,
        isAllDay: scheduleData?.isAllDay,
        start: scheduleData?.start,
        end: scheduleData?.end,
        category: scheduleData?.isAllDay ? 'allday' : 'time',
        calendarId: scheduleData?.calendarId,
        attendee: scheduleData?.attendee,
        grade: scheduleData?.grade,
        groupId: scheduleData?.groupId,
      })
        .then(() => setLoading(false))
        .then(() => refetchCalendar())
    } catch (err: any) {}
  }

  const handleUpdateSchedule = (schedule: any) => {
    try {
      handleCalendarUpdate(event?.schedule?.id, {
        title: schedule.title,
        location: schedule.location,
        isAllDay: schedule.isAllDay,
        category: schedule.isAllDay ? 'allday' : 'time',
        calendarId: schedule.calendarId,
        attendee: schedule.attendee,
        start: schedule.start,
        end: schedule.end,
        grade: schedule.grade,
        groupId: schedule.groupId,
      })
        .then(() => setLoading(false))
        .then(() => refetchCalendar())
        .then(() => setEvent(null))
        .then(() => setModalOpen(false))
    } catch (err: any) {
      console.log(err?.message)
    }
  }

  useEffect(() => {
    const calendar = calendarRef?.current?.getInstance()

    if (calendar) {
      setDateRange({
        startDate: DayAgo(calendar.getDateRangeStart().toDate()),
        endDate: DayAfter(calendar.getDateRangeEnd().toDate()),
      })

      if (!calendar?.events?.beforeCreateSchedule?.length) {
        calendar.on('beforeCreateSchedule', (event: any) => {
          setModalOpen(true)
          setEvent(event)
          //calendar.setDate();
        })
      }

      if (!calendar?.events?.beforeUpdateSchedule?.length) {
        calendar.on('beforeUpdateSchedule', (event: any) => {
          calendar.setDate()
          if (event?.triggerEventName === 'click') {
            refetchCalendar().then(() => {
              setModalOpen(true)
              setEvent(event)
            })
          } else {
            const { schedule, changes } = event
            handleUpdateSchedule({
              title: schedule.title,
              location: schedule.location,
              isAllDay: schedule.isAllDay,
              category: schedule.isAllDay ? 'allday' : 'time',
              ...changes,
              calendarId: changes?.calendarId || schedule.calendarId,
              start: changes?.start?.toDate() || schedule.start?.toDate(),
              end: changes?.end?.toDate() || schedule.end?.toDate(),
              groupId: changes?.groupId || schedule.groupId,
            })
          }
        })
      }

      if (!calendar?.events?.beforeDeleteSchedule?.length) {
        calendar.on('beforeDeleteSchedule', (scheduleData: any) => {
          calendar.setDate()
          const { schedule } = scheduleData
          try {
            refetchCalendar().then(() => handleCalendarDelete(schedule.id))
          } catch (err: any) {
            console.log(err?.message)
          }
        })
      }

      setCurrentDateString(makeDateToString(calendar.getDate()) || '')
    }
  }, [currentDateString])

  useEffect(() => {
    const calendar = calendarRef?.current?.getInstance()

    if (calendar) {
      const _schedules = schedules && JSON.parse(JSON.stringify(schedules))

      const updatedArray = _schedules?.map((obj: any) => ({
        ...obj,
        title:
          (obj.grade ? `[${obj.grade}학년] ${obj.title}` : obj.group ? `[${obj.group.name}] ${obj.title}` : obj.title) +
          (obj.attendee === '일반' ? '' : ' (' + obj.attendee + ')'),
      }))

      calendar.clear()
      calendar.createSchedules(updatedArray)
    }
  }, [schedules])

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
  const calendarKey = useMemo(() => `calendar-${language}`, [language])

  return (
    <>
      {(isCalendarLoading || isLoading) && <Blank />}
      {errorMessage && <ErrorBlank />}
      {<CoachMark {...coach} />}
      <div className="col-span-6 grid grid-cols-6">
        <div className="relative col-span-6 flex h-screen flex-col">
          <div className="hidden md:block">
            <div id="lnb">
              <div className="flex items-center space-x-2 border-b border-[#E5E5E5] pb-3">
                <button
                  children={t('add_new_event')}
                  id="btn-new-schedule"
                  type="button"
                  data-toggle="modal"
                  onClick={() => {
                    if (readOnly) {
                      alert('일정 추가 권한이 없습니다.')
                    } else {
                      setModalOpen(true)
                    }
                  }}
                  className="h-full rounded-full bg-[#FF6618] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#E55B15] active:bg-[#D95614]"
                />
                <div
                  className="cursor-pointer rounded-full border border-gray-500 px-2 text-sm text-gray-500"
                  onClick={reOpenCoach}
                >
                  ?
                </div>
              </div>
              <div id="lnb-calendars" className="lnb-calendars">
                <div>
                  <div className="lnb-calendars-item">
                    <Label.row>
                      <Checkbox checked={!filterId} onChange={() => filterId && setFilterId(undefined)} />
                      <strong>{t('view_all')}</strong>
                    </Label.row>
                  </div>
                </div>
                <div id="calendarList" className="lnb-calendars-d1" ref={refs[0]}>
                  {calendars.map((el: any) => (
                    <LnbCalendarsItem
                      key={el.id}
                      value={el.id}
                      checked={false}
                      color={el.bgColor}
                      text={el.name}
                      onClick={() => setFilterId(el.id)}
                    />
                  ))}
                </div>
              </div>
              <div className="lnb-footer">© NHN Corp.</div>
            </div>
            <div id="right" className="scroll-box overflow-y-scroll">
              <div className="flex items-center space-x-6" id="menu">
                <button
                  children={t('today')}
                  type="button"
                  className="rounded-full border border-gray-300 px-6 py-2 text-sm hover:border-gray-400"
                  data-action="move-today"
                  onClick={(e) => onClickNavi(e)}
                />
                <div className="flex items-center space-x-2">
                  <button
                    className="rounded-full border border-gray-300 p-2 hover:border-gray-400"
                    data-action="move-prev"
                    onClick={(e) => onClickNavi(e)}
                  >
                    <Icon.ChevronLeft className="h-4 w-4" data-action="move-prev" />
                  </button>
                  <p>{currentDateString}</p>
                  <button
                    className="rounded-full border border-gray-300 p-2 hover:border-gray-400"
                    data-action="move-next"
                    onClick={(e) => onClickNavi(e)}
                  >
                    <Icon.ChevronRight className="h-4 w-4" data-action="move-next" />
                  </button>
                </div>
              </div>
              {/* @ts-ignore */}
              <Calendar
                key={calendarKey}
                height="100%"
                calendars={calendars}
                disableDblClick
                disableClick={false}
                isReadOnly={readOnly}
                month={{
                  startDayOfWeek: 0,
                }}
                scheduleView
                taskView
                template={{
                  monthDayname: (model) => getDayName(model),
                  milestone(schedule) {
                    return `<span style="color:#fff;background-color: ${schedule.bgColor};">${schedule.title}</span>`
                  },
                  milestoneTitle() {
                    return '<div class="w-full h-full flex items-center justify-end">Milestone</div>'
                  },
                  allday(schedule) {
                    return `<span style="color:#fff;">${schedule.title}<i class="fa fa-refresh"></i></span>`
                  },
                  alldayTitle() {
                    return '<div class="w-full h-full flex items-center justify-end">All Day</div>'
                  },
                }}
                theme={{}}
                timezones={[
                  {
                    timezoneOffset: 540,
                    displayLabel: 'GMT+09:00',
                    tooltip: 'Seoul',
                    timezoneName: 'Asia/Seoul',
                  },
                ]}
                useDetailPopup
                defaultView="month"
                view="month"
                ref={calendarRef}
              />
              <CustomTuiModal
                {...{
                  isOpen: modalOpen,
                  onClose: () => {
                    setModalOpen(false)
                    setEvent(null)
                  },
                  onSubmit: !event?.schedule?.id ? handleCreateSchedule : handleUpdateSchedule,
                  submitText: event?.triggerEventName === 'mouseup' ? 'Save' : 'Update',
                  calendars: calendars,
                  schedule: schedules?.find((el: any) => el.id === event?.schedule?.id),
                  startDate: event?.start?.toDate() || event?.schedule?.start?.toDate() || new Date(),
                  endDate: event?.end?.toDate() || event?.schedule?.end?.toDate() || new Date(),
                  schoolType: me?.school?.schoolType || '',
                  groupProps: groupProps,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
