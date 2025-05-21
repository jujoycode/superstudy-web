import { useEffect, useRef, useState } from 'react'

import { MergedGroupType } from '@/legacy/container/teacher-chat-user-list'
import { GroupType } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { makeDateToString } from '@/legacy/util/time'

interface CustomTuiModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: any) => void
  calendars: any[]
  schedule: any
  startDate: Date
  endDate: Date
  schoolType: string
  groupProps?: {
    allGroups: any[]
    selectedGroup: any
    setSelectedGroup: (group: any) => void
  }
}

export function CustomTuiModal({
  isOpen = false,
  onClose,
  onSubmit,
  calendars = [],
  schedule,
  startDate,
  endDate,
  schoolType,
  groupProps,
}: CustomTuiModalProps) {
  const [openSelectCalendars, setOpenSelectCalendars] = useState(false)
  const [openSelectAttendees, setOpenSelectAttendees] = useState(false)
  const [openSelectGrade, setOpenSelectGrade] = useState(false)
  const [openSelectGroupType, setOpenSelectGroupType] = useState(false)
  const [openSelectGroup, setOpenSelectGroup] = useState(false)
  const wrapperSelectCalendarsRef = useRef<any>(null)
  const wrapperSelectAttendeesRef = useRef<any>(null)
  const wrapperSelectGradeRef = useRef<any>(null)
  const wrapperSelectGroupTypeRef = useRef<any>(null)
  const wrapperSelectGroupRef = useRef<any>(null)
  const subjectRef = useRef<any>(null)
  const { t } = useLanguage()

  const [calendarId, setCalendarId] = useState(calendars[0]?.id)
  const [title, setTitle] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const { allGroups, selectedGroup, setSelectedGroup = () => {} } = groupProps || {}
  const [selectedGroupType, setSelectedGroupType] = useState<GroupType>(GroupType.KLASS)
  // 상세 일정 카테고리
  const baseAttendees = [
    { id: '1', name: t('general') },
    { id: '2', name: t('no_experiential_learning') },
    { id: '3', name: t('holiday') },
  ]

  const attendees = calendarId !== '0' ? [baseAttendees[0]] : baseAttendees // 학사일정이 아닐때는 일반 카테고리만 노출

  const [attendee, setAttendee] = useState(attendees[0].name)

  // 학교 타입에 따라 학년 배열 생성
  const gradeArray =
    schoolType === 'ES'
      ? ['1', '2', '3', '4', '5', '6'] // 초등학교
      : ['1', '2', '3'] // 중학교/고등학교

  const handleClick = (e: any) => {
    if (wrapperSelectCalendarsRef.current?.contains(e.target)) {
      return
    }
    if (wrapperSelectAttendeesRef.current?.contains(e.target)) {
      return
    }
    if (wrapperSelectGradeRef.current?.contains(e.target)) {
      return
    }
    if (wrapperSelectGroupTypeRef.current?.contains(e.target)) {
      return
    }
    if (wrapperSelectGroupRef.current?.contains(e.target)) {
      return
    }
    setOpenSelectCalendars(false)
    setOpenSelectAttendees(false)
    setOpenSelectGrade(false)
    setOpenSelectGroupType(false)
    setOpenSelectGroup(false)
  }

  useEffect(() => {
    document.addEventListener('click', handleClick, false)

    return () => {
      document.removeEventListener('click', handleClick, false)
    }
  })

  useEffect(() => {
    if (schedule) {
      setCalendarId(schedule.calendarId)
      setAttendee(schedule?.attendee)
      setTitle(schedule.title)
      setStartAt(makeDateToString(startDate))
      setEndAt(makeDateToString(endDate))
      setSelectedGrade(schedule?.grade || '')
      setSelectedGroupType(schedule?.group?.type || GroupType.KLASS)
      setSelectedGroup(schedule?.group || null)
    }
    return () => {}
  }, [schedule, startDate, endDate])

  useEffect(() => {
    if (startAt && endAt) {
      if (startAt > endAt) setEndAt(startAt)
    }
  }, [startAt, endAt])

  useEffect(() => {
    if (startDate && endDate) {
      setStartAt(makeDateToString(startDate))
      setEndAt(makeDateToString(endDate))
    }
  }, [startDate, endDate])

  useEffect(() => {
    setTitle('')
    setCalendarId('0')
    setAttendee(attendees[0].name)
    setSelectedGrade('')
    setSelectedGroupType(GroupType.KLASS)
    setSelectedGroup(null)
  }, [isOpen])

  return (
    <div
      className={`bg-littleblack fixed inset-0 z-60 flex h-screen w-full items-center justify-center ${
        !isOpen && 'hidden'
      }`}
    >
      <div className="tui-full-calendar-popup-container">
        <div className="flex flex-row-reverse">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden focus:ring-inset"
            onClick={() => onClose()}
          >
            <span className="sr-only">Close menu</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex">
          <div
            ref={wrapperSelectCalendarsRef}
            className={`tui-full-calendar-popup-section tui-full-calendar-dropdown tui-full-calendar-close tui-full-calendar-section-calendar w-36 ${
              openSelectCalendars && 'tui-full-calendar-open'
            }`}
          >
            <button
              onClick={() => setOpenSelectCalendars(!openSelectCalendars)}
              className="tui-full-calendar-button tui-full-calendar-dropdown-button tui-full-calendar-popup-section-item flex w-36 items-center justify-between text-left"
            >
              <span
                className="tui-full-calendar-icon tui-full-calendar-calendar-dot h-4 w-4 shrink-0"
                style={{ backgroundColor: calendars?.find((element: any) => element.id === calendarId)?.bgColor }}
              />
              <span id="tui-full-calendar-schedule-calendar" className="tui-full-calendar-content truncate">
                {calendars?.find((element) => element.id === calendarId)?.name}
              </span>
              <span className="tui-full-calendar-icon tui-full-calendar-dropdown-arrow" />
            </button>
            <ul className="tui-full-calendar-dropdown-menu" style={{ zIndex: 1004 }}>
              {calendars.map((element, i) => (
                <li
                  onClick={() => {
                    setCalendarId(element.id)
                    setOpenSelectCalendars(false)
                  }}
                  key={i}
                  className="tui-full-calendar-popup-section-item tui-full-calendar-dropdown-menu-item"
                  data-calendar-id={element.id}
                >
                  <span
                    className="tui-full-calendar-icon tui-full-calendar-calendar-dot"
                    style={{ backgroundColor: element.bgColor }}
                  />
                  <span className="tui-full-calendar-content">{element?.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            ref={wrapperSelectAttendeesRef}
            className={`tui-full-calendar-popup-section tui-full-calendar-dropdown tui-full-calendar-close tui-full-calendar-section-state ml-3 w-56 ${
              openSelectAttendees && 'tui-full-calendar-open'
            }`}
          >
            <button
              onClick={() => setOpenSelectAttendees(!openSelectAttendees)}
              className="tui-full-calendar-button tui-full-calendar-dropdown-button tui-full-calendar-popup-section-item flex w-56 items-center justify-between text-left"
            >
              <span className="tui-full-calendar-icon tui-full-calendar-ic-state" />
              <span
                id="tui-full-calendar-schedule-state"
                className="tui-full-calendar-content"
                style={{ width: '150px' }}
              >
                {attendees?.find((element) => element.name === attendee)?.name}
              </span>
              <span className="tui-full-calendar-icon tui-full-calendar-dropdown-arrow" />
            </button>
            <ul className="tui-full-calendar-dropdown-menu" style={{ zIndex: 1004 }}>
              {attendees.map((element, i) => (
                <li
                  onClick={() => {
                    setAttendee(element.name)
                    setOpenSelectAttendees(false)
                  }}
                  key={i}
                  className="tui-full-calendar-popup-section-item tui-full-calendar-dropdown-menu-item"
                >
                  <span className="tui-full-calendar-icon tui-full-calendar-none" />
                  <span className="tui-full-calendar-content" style={{ width: '150px' }}>
                    {element?.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {calendarId === calendars[0]?.id && attendee === attendees[1]?.name && (
            <div
              ref={wrapperSelectGradeRef}
              className={`tui-full-calendar-popup-section tui-full-calendar-dropdown tui-full-calendar-close tui-full-calendar-section-state ml-3 w-40 ${
                openSelectGrade && 'tui-full-calendar-open'
              }`}
            >
              <button
                onClick={() => setOpenSelectGrade(!openSelectGrade)}
                className="tui-full-calendar-button tui-full-calendar-dropdown-button tui-full-calendar-popup-section-item flex w-40 items-center justify-between text-left"
              >
                <div className="flex items-center gap-1">
                  <span className="tui-full-calendar-icon tui-full-calendar-ic-user-b" />
                  <span id="tui-full-calendar-schedule-grade" className="tui-full-calendar-content">
                    {selectedGrade ? `${selectedGrade}학년` : '전체'}
                  </span>
                </div>
                <span className="tui-full-calendar-icon tui-full-calendar-dropdown-arrow" />
              </button>
              <ul className="tui-full-calendar-dropdown-menu" style={{ zIndex: 1004 }}>
                <li
                  onClick={() => {
                    setSelectedGrade('')
                    setOpenSelectGrade(false)
                  }}
                  className="tui-full-calendar-popup-section-item tui-full-calendar-dropdown-menu-item"
                >
                  <span className="tui-full-calendar-icon tui-full-calendar-ic-user-b" />
                  <span className="tui-full-calendar-content">전체</span>
                </li>
                {gradeArray.map((grade) => (
                  <li
                    key={grade}
                    onClick={() => {
                      setSelectedGrade(grade)
                      setOpenSelectGrade(false)
                    }}
                    className="tui-full-calendar-popup-section-item tui-full-calendar-dropdown-menu-item"
                  >
                    <span className="tui-full-calendar-icon tui-full-calendar-ic-user-b" />
                    <span className="tui-full-calendar-content">{grade}학년</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* 그룹 일정일 때만 그룹 선택 UI 표시 */}
          {calendarId === calendars[2]?.id && (
            <div className="flex">
              <div
                ref={wrapperSelectGroupTypeRef}
                className={`tui-full-calendar-popup-section tui-full-calendar-dropdown tui-full-calendar-close tui-full-calendar-section-state ml-3 w-40 ${
                  openSelectGroupType && 'tui-full-calendar-open'
                }`}
              >
                <button
                  onClick={() => setOpenSelectGroupType(!openSelectGroupType)}
                  className="tui-full-calendar-button tui-full-calendar-dropdown-button tui-full-calendar-popup-section-item flex w-40 items-center justify-between text-left"
                >
                  <span className="tui-full-calendar-icon tui-full-calendar-ic-state" />
                  <span className="tui-full-calendar-content" style={{ width: '100px' }}>
                    {selectedGroupType === GroupType.KLUB ? '사용자정의 그룹' : '학급소속 그룹'}
                  </span>
                  <span className="tui-full-calendar-icon tui-full-calendar-dropdown-arrow" />
                </button>
                <ul className="tui-full-calendar-dropdown-menu" style={{ zIndex: 1004 }}>
                  <li
                    onClick={() => {
                      setSelectedGroupType(GroupType.KLASS)
                      setOpenSelectGroupType(false)
                    }}
                    className="tui-full-calendar-popup-section-item tui-full-calendar-dropdown-menu-item"
                  >
                    <span className="tui-full-calendar-icon tui-full-calendar-ic-state" />
                    <span className="tui-full-calendar-content" style={{ width: '100px' }}>
                      학급소속 그룹
                    </span>
                  </li>
                  <li
                    onClick={() => {
                      setSelectedGroupType(GroupType.KLUB)
                      setOpenSelectGroupType(false)
                    }}
                    className="tui-full-calendar-popup-section-item tui-full-calendar-dropdown-menu-item"
                  >
                    <span className="tui-full-calendar-icon tui-full-calendar-ic-state" />
                    <span className="tui-full-calendar-content" style={{ width: '100px' }}>
                      사용자정의 그룹
                    </span>
                  </li>
                </ul>
              </div>

              {selectedGroupType && (
                <div
                  ref={wrapperSelectGroupRef}
                  className={`tui-full-calendar-popup-section tui-full-calendar-dropdown tui-full-calendar-close tui-full-calendar-section-state ml-3 w-48 ${
                    openSelectGroup && 'tui-full-calendar-open'
                  }`}
                >
                  <button
                    onClick={() => setOpenSelectGroup(!openSelectGroup)}
                    className="tui-full-calendar-button tui-full-calendar-dropdown-button tui-full-calendar-popup-section-item flex w-48 items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-1">
                      <span className="tui-full-calendar-icon tui-full-calendar-ic-user-b" />
                      <span className="tui-full-calendar-content" style={{ width: '150px' }}>
                        {selectedGroup?.name || '그룹 선택'}
                      </span>
                    </div>
                    <span className="tui-full-calendar-icon tui-full-calendar-dropdown-arrow" />
                  </button>
                  <ul className="tui-full-calendar-dropdown-menu max-h-60 overflow-y-auto" style={{ zIndex: 1004 }}>
                    {allGroups
                      ?.filter((g) => g.type === selectedGroupType && g?.id > 0)
                      ?.map((group: MergedGroupType) => (
                        <li
                          key={group.id}
                          onClick={() => {
                            setSelectedGroup(group)
                            setOpenSelectGroup(false)
                          }}
                          className="tui-full-calendar-popup-section-item tui-full-calendar-dropdown-menu-item"
                        >
                          <span className="tui-full-calendar-icon tui-full-calendar-ic-user-b" />
                          <span
                            className="tui-full-calendar-content block truncate"
                            style={{ width: '130px', minHeight: '20px' }}
                            title={group.name}
                          >
                            {group.name}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="tui-full-calendar-popup-section">
          <div className="tui-full-calendar-popup-section-item tui-full-calendar-section-location">
            <span className="tui-full-calendar-icon tui-full-calendar-ic-title" />
            <input
              ref={subjectRef}
              id="tui-full-calendar-schedule-title"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="tui-full-calendar-content"
            />
          </div>
        </div>
        <div>
          <input
            type="date"
            value={startAt}
            className="focus:border-brand-1 mb-5 h-10 w-60 rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
            onChange={(e) => setStartAt(e.target.value)}
          />
          <span className="tui-full-calendar-section-date-dash">-</span>
          <input
            type="date"
            value={endAt}
            className="focus:border-brand-1 mb-5 h-10 w-60 rounded-md border border-gray-200 px-3 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
            onChange={(e) => setEndAt(e.target.value)}
          />
        </div>
        <div className="tui-full-calendar-section-button-save">
          <button
            children="저장"
            onClick={() => {
              if (!title) {
                subjectRef.current.focus()
              } else {
                const event: any = {
                  calendarId,
                  attendee,
                  title,
                  start: startAt,
                  end: endAt,
                  isAllDay: makeDateToString(new Date(startAt)) === makeDateToString(new Date(endAt)),
                  location: '',
                  grade: 0,
                  groupId: selectedGroup?.id,
                }

                // 학사일정이면서 체험학습지정불가인 경우
                if (calendarId === calendars[0]?.id && attendee === attendees[1]?.name) {
                  // 전체 선택인 경우 0, 특정 학년 선택인 경우 해당 학년 값
                  event.grade = selectedGrade === '' ? 0 : parseInt(selectedGrade)
                }

                // 그룹 일정인데 그룹이 선택되지 않은 경우
                if (calendarId === calendars[2]?.id && !selectedGroup?.id) {
                  alert('그룹을 선택해주세요.')
                  return
                }

                const _start = new Date(startAt)
                _start.setHours(0, 0, 0, 0)
                event.start = _start

                const _end = new Date(endAt)
                _end.setHours(23, 59, 59, 999)
                event.end = _end

                onSubmit(event)
              }
            }}
            className="tui-full-calendar-button tui-full-calendar-confirm tui-full-calendar-popup-save"
          />
        </div>
      </div>
    </div>
  )
}
