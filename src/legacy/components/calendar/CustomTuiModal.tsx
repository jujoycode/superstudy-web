import { useEffect, useRef, useState } from 'react'

import { toDate } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Box } from '@/atoms/Box'
import { Button } from '@/atoms/Button'
import { Flex } from '@/atoms/Flex'
import { Icon } from '@/atoms/Icon'
import { Input } from '@/atoms/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/atoms/Select'
import { Text } from '@/atoms/Text'
import { DateRangePicker } from '@/molecules/DateRangePicker'
import { ResponsiveRenderer } from '@/organisms/ResponsiveRenderer'
import { MergedGroupType } from '@/legacy/container/teacher-chat-user-list'
import { GroupType } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { DateUtil } from '@/legacy/util/date'
import { getCurrentSchoolYear, makeDateToString } from '@/legacy/util/time'

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

export function CustomTuiModal(props: CustomTuiModalProps) {
  return (
    <ResponsiveRenderer mobile={<MobileCustomTuiModal {...props} />} default={<DesktopCustomTuiModal {...props} />} />
  )
}

function MobileCustomTuiModal({
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
  const subjectRef = useRef<any>(null)
  const { t } = useLanguage()

  const [calendarId, setCalendarId] = useState(calendars[0]?.id)
  const [title, setTitle] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const schoolYear = getCurrentSchoolYear()
  const [dateRange, setDateRange] = useState<DateRange>({
    from: toDate(DateUtil.getAMonthAgo(new Date())),
    to: new Date(),
  })
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

  useEffect(() => {
    if (startAt && endAt) {
      if (startAt > endAt) setEndAt(startAt)
    }
  }, [startAt, endAt])

  useEffect(() => {
    if (schedule && isOpen) {
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
    if (startDate && endDate) {
      setStartAt(makeDateToString(startDate))
      setEndAt(makeDateToString(endDate))
    }
  }, [startDate, endDate])

  useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setCalendarId('0')
      setAttendee(attendees[0].name)
      setSelectedGrade('')
      setSelectedGroupType(GroupType.KLASS)
      setSelectedGroup(null)
    }
  }, [isOpen])

  useEffect(() => {
    setAttendee(attendees[0].name)
    setSelectedGrade('')
    setSelectedGroupType(GroupType.KLASS)
    setSelectedGroup(null)
  }, [calendarId])

  return (
    <div
      className={`fixed inset-0 z-10 flex h-screen w-full items-center justify-center rounded-lg bg-neutral-500/50 ${
        !isOpen && 'hidden'
      }`}
    >
      {/* 모바일 최적화 UI */}
      <Box width="90%" className="rounded-lg bg-white p-4">
        <Flex direction="col" gap="4">
          <Flex direction="row" items="center" justify="between">
            <Text variant="title" color="primary">
              새 일정 추가
            </Text>
            <Icon
              name="X"
              size="md"
              className="bg-secondary-800 cursor-pointer rounded-full p-1.5 text-white"
              stroke
              strokeWidth={3}
              onClick={onClose}
            />
          </Flex>
          <Flex direction="col" gap="2">
            <Select value={calendarId} onValueChange={(value) => setCalendarId(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="일정 타입 선택" />
              </SelectTrigger>
              <SelectContent>
                {calendars.map((element, i) => (
                  <SelectItem key={i} value={element.id}>
                    {element.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={attendee} onValueChange={(value) => setAttendee(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {attendees.map((element, i) => (
                  <SelectItem key={i} value={element.name}>
                    {element.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {calendarId === calendars[0]?.id && attendee === attendees[1]?.name && (
              <Select value={selectedGrade} onValueChange={(value) => setSelectedGrade(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="학년 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">전체</SelectItem>
                  {gradeArray.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}학년
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {calendarId === calendars[2]?.id && (
              <Flex direction="col" gap="2">
                <Select value={selectedGroupType} onValueChange={(value) => setSelectedGroupType(value as GroupType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="그룹 타입 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GroupType.KLASS}>학급소속 그룹</SelectItem>
                    <SelectItem value={GroupType.KLUB}>사용자정의 그룹</SelectItem>
                  </SelectContent>
                </Select>

                {selectedGroupType && (
                  <Select value={selectedGroup || ''} onValueChange={(value) => setSelectedGroup(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="그룹 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {allGroups
                        ?.filter((g) => g.type === selectedGroupType && g?.id > 0)
                        .map((group: MergedGroupType) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </Flex>
            )}

            <Input size="md" width="full" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />

            <DateRangePicker.Default
              minDate={toDate(schoolYear.start)}
              maxDate={toDate(schoolYear.end)}
              dateRange={dateRange}
              setDateRange={(value) => setDateRange(value as DateRange)}
            />
          </Flex>

          <Flex direction="row" items="center" justify="end">
            <Button
              children="저장"
              size="lg"
              color="primary"
              className="w-full"
              disabled={!title || !dateRange.from || !dateRange.to}
              variant="solid"
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
            />
          </Flex>
        </Flex>
      </Box>
    </div>
  )
}

function DesktopCustomTuiModal({
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
  const subjectRef = useRef<any>(null)
  const { t } = useLanguage()

  const [calendarId, setCalendarId] = useState(calendars[0]?.id)
  const [title, setTitle] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const schoolYear = getCurrentSchoolYear()
  const [dateRange, setDateRange] = useState<DateRange>({
    from: toDate(DateUtil.getAMonthAgo(new Date())),
    to: new Date(),
  })
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

  useEffect(() => {
    if (startAt && endAt) {
      if (startAt > endAt) setEndAt(startAt)
    }
  }, [startAt, endAt])

  useEffect(() => {
    if (schedule && isOpen) {
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
    if (startDate && endDate) {
      setStartAt(makeDateToString(startDate))
      setEndAt(makeDateToString(endDate))
    }
  }, [startDate, endDate])

  useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setCalendarId('0')
      setAttendee(attendees[0].name)
      setSelectedGrade('')
      setSelectedGroupType(GroupType.KLASS)
      setSelectedGroup(null)
    }
  }, [isOpen])

  useEffect(() => {
    setAttendee(attendees[0].name)
    setSelectedGrade('')
    setSelectedGroupType(GroupType.KLASS)
    setSelectedGroup(null)
  }, [calendarId])

  return (
    <div
      className={`fixed inset-0 z-10 flex h-screen w-full items-center justify-center rounded-lg bg-neutral-500/50 ${
        !isOpen && 'hidden'
      }`}
    >
      <Box width="[632px]" className="rounded-lg bg-white p-8">
        <Flex direction="col" gap="6">
          <Flex direction="row" items="center" justify="between">
            <Text variant="title" color="primary">
              새 일정 추가
            </Text>
            <Icon
              name="X"
              size="md"
              className="bg-secondary-800 cursor-pointer rounded-full p-1.5 text-white"
              stroke
              strokeWidth={3}
              onClick={onClose}
            />
          </Flex>
          <Flex direction="col" gap="2">
            <Flex direction="row" items="center" gap="2">
              {/* 일정 타입 선택 */}
              <Select value={calendarId} onValueChange={(value) => setCalendarId(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="일정 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  {calendars.map((element, i) => (
                    <SelectItem key={i} value={element.id}>
                      {element.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* 일정 카테고리 선택 */}
              <Select value={attendee} onValueChange={(value) => setAttendee(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {attendees.map((element, i) => (
                    <SelectItem key={i} value={element.name}>
                      {element.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* 학년 선택 */}
              {calendarId === calendars[0]?.id && attendee === attendees[1]?.name && (
                <Select value={selectedGrade} onValueChange={(value) => setSelectedGrade(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="학년 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">전체</SelectItem>
                    {gradeArray.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}학년
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {/* 그룹 일정일 때만 그룹 선택 UI 표시 */}
              {calendarId === calendars[2]?.id && (
                <Flex direction="row" items="center" gap="2">
                  <Select value={selectedGroupType} onValueChange={(value) => setSelectedGroupType(value as GroupType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="그룹 타입 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={GroupType.KLASS}>학급소속 그룹</SelectItem>
                      <SelectItem value={GroupType.KLUB}>사용자정의 그룹</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedGroupType && (
                    <Select value={selectedGroup || ''} onValueChange={(value) => setSelectedGroup(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="그룹 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {allGroups
                          ?.filter((g) => g.type === selectedGroupType && g?.id > 0)
                          .map((group: MergedGroupType) => (
                            <SelectItem key={group.id} value={group.id.toString()}>
                              {group.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </Flex>
              )}
            </Flex>
            <Input size="md" width="full" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
            <DateRangePicker.Default
              minDate={toDate(schoolYear.start)}
              maxDate={toDate(schoolYear.end)}
              dateRange={dateRange}
              setDateRange={(value) => setDateRange(value as DateRange)}
            />
          </Flex>
          <Flex direction="row" items="center" justify="end">
            <Button
              children="저장"
              size="lg"
              color="primary"
              className="w-[120px]"
              disabled={!title || !dateRange.from || !dateRange.to}
              variant="solid"
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
            />
          </Flex>
        </Flex>
      </Box>
    </div>
  )
}
