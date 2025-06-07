import { useEffect, useRef, useState } from 'react'
import { Row } from 'read-excel-file'
import { useLanguageStore } from '@/stores/language'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import { SuperModal } from '@/legacy/components'
import { BackButton, Blank, Chip, Divider, Section, Select, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Icon } from '@/legacy/components/common/icons'
import { TextInput } from '@/legacy/components/common/TextInput'
import { GroupContainer } from '@/legacy/container/group'
import { DayOfWeekEnum, useTeacherAttendanceBook1 } from '@/legacy/container/teacher-attendance-book-1'
import { useAttendanceDownload } from '@/legacy/container/teacher-attendance-download'
import { useTeacherTimetableDetail } from '@/legacy/container/teacher-timetable-v3-detail'
import { Attendance, ResponseTimetableV3Dto, Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useModals } from '@/legacy/modals/ModalStack'
import { StudentModal } from '@/legacy/modals/StudentModal'
import { AbsentSave, PeriodSubjectTeacher } from '@/legacy/types'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { getNickName } from '@/legacy/util/status'
import { getDayOfSemester, getDayOfYear, toLocaleDateFormatString, weekCount } from '@/legacy/util/time'

type TimeTableInfo = {
  studentId: string
  day: Date
  period: number
  dayOfWeek: keyof typeof DayOfWeekEnum
}

const createNumberArray = (startNumber: number, lastNumber: number) => {
  if (lastNumber < startNumber) return []
  return Array.from({ length: lastNumber - startNumber + 1 }, (_, i) => i + startNumber)
}

const nullSafeValue = (str: string | number | boolean | typeof Date | null | undefined) => {
  return (str as string) ?? ''
}

const getStudentIdList = (data?: Row[]) => {
  return data?.map((row) => row[1] as string) || []
}

const mergeSubjectAndTeacher = (subject: string, teacher: string) => {
  const subjects = subject.split(',')
  const teachers = teacher.split(',')

  let merged = ''

  for (let i = 0; i < subjects.length; i++) {
    merged += `${nullSafeValue(subjects[i])}-${nullSafeValue(teachers[i])}\n`
  }

  return merged
}

const subjectAndTeacher: string[] = []

const getRows = (rowsParam?: Row[]) => {
  if (rowsParam && rowsParam?.length >= 5) {
    const [row0, row1, rowId, row2, row3, row4, ...restTemp] = rowsParam
    const last1 = restTemp[restTemp.length - 2]
    const last2 = restTemp[restTemp.length - 1]
    const rest = restTemp.slice(0, -2)

    subjectAndTeacher.length = 0

    if (row1.length > 0 && row2.length > 0 && row1.length === row2.length) {
      for (let i = 2; i < row1.length; i++) {
        if (nullSafeValue(row1[i]) !== '' && nullSafeValue(row2[i]) !== '') {
          subjectAndTeacher[i] = mergeSubjectAndTeacher(nullSafeValue(row1[i]), nullSafeValue(row2[i]))
        }
      }
    }

    return { row0, row1, rowId, row2, row3, row4, rest, last1, last2 }
  }
  return { row0: [], row1: [], rowId: [], row2: [], row3: [], row4: [], rest: [], last1: [], last2: [] }
}

const makeSubjectMap = (
  studentIdList: string[],
  row1: Row,
  row2: Row,
  _: Row,
  rest: Row[],
  periodCount: number,
): Map<string, Map<number, PeriodSubjectTeacher[]>> => {
  if (!studentIdList) return new Map()
  const studentMap = new Map<string, Map<number, PeriodSubjectTeacher[]>>()

  studentIdList.forEach((studentId) => {
    const studentAttendanceList = rest.find((row) => row[1] === studentId)
    if (!studentAttendanceList) return

    const studentSubjectMap = new Map<number, PeriodSubjectTeacher[]>() // 요일별 과목
    for (const dayOfWeek of Object.values(DayOfWeekEnum)) {
      const classByDay: PeriodSubjectTeacher[] = []
      for (let i = 0; i < periodCount; i++) {
        const subject = nullSafeValue(row1[3 + i + dayOfWeek * periodCount]).toString()
        const teacher = nullSafeValue(row2[3 + i + dayOfWeek * periodCount]).toString()
        const mark = nullSafeValue(studentAttendanceList[3 + i + dayOfWeek * periodCount]).toString()
        classByDay.push({
          period: i,
          subject,
          teacher,
          mark,
        })
      }
      studentSubjectMap.set(dayOfWeek, classByDay)
    }
    studentMap.set(studentId, studentSubjectMap)
  })
  return studentMap
}

const getPreviousContentByPeriod = (
  attendanceAbsentData: Attendance[] | undefined,
  day: Date,
  studentId: string,
): Map<number, AbsentSave> => {
  const previousAbsentData = attendanceAbsentData?.find((absentData) => {
    return (
      absentData.userId === +studentId &&
      absentData.attendanceDay === DateUtil.formatDate(day.toISOString(), DateFormat['YYYY-MM-DD'])
    )
  })
  const previousContent = JSON.parse(previousAbsentData?.content || '{ "attendance": [] }') as {
    attendance: AbsentSave[]
  }
  const previousContentByPeriod = new Map<number, AbsentSave>()
  previousContent.attendance.forEach((absentSave) => {
    previousContentByPeriod.set(absentSave.period, absentSave)
  })
  return previousContentByPeriod
}

const getStudentAttendanceByDayOfWeekMobile = (
  rowsParam: Row[] | undefined,
  studentNumber: string,
  selectedDayOfWeek: number,
  classCount: number,
) => {
  const studentData = rowsParam?.find((row) => row[1] === studentNumber)
  if (!studentData) return []

  const updatedStudentData = studentData.map((value, index) =>
    subjectAndTeacher.filter((item) => item !== undefined).length < 10 || subjectAndTeacher[index] ? value : '',
  )

  const dayOfWeekData = updatedStudentData.slice(
    3 + (selectedDayOfWeek - 1) * classCount,
    3 + (selectedDayOfWeek - 1) * classCount + classCount,
  )
  return dayOfWeekData
}

const getStudentAttendanceByDayOfWeek = (
  rowsParam: Row[] | undefined,
  studentNumber: string,
  dayOfWeek: keyof typeof DayOfWeekEnum, // 0: 월요일, 1: 화요일, 2: 수요일, 3: 목요일, 4: 금요일, 5: 토요일
  classCount: number,
) => {
  const studentData = rowsParam?.find((row) => row[1] === studentNumber)
  if (!studentData) return []

  const updatedStudentData = studentData.map((value, index) =>
    subjectAndTeacher.filter((item) => item !== undefined).length < 8 || subjectAndTeacher[index] ? value : '',
  )

  const dayOfWeekData = updatedStudentData.slice(
    3 + DayOfWeekEnum[dayOfWeek] * classCount,
    3 + DayOfWeekEnum[dayOfWeek] * classCount + classCount,
  )
  return dayOfWeekData
}

const getStudentAttendanceHead = (rowsParam: Row[] | undefined, studentId: string) => {
  const studentData = rowsParam?.find((row) => row[1] === studentId)
  if (!studentData) return []
  return [studentData[0], studentData[2]]
}

const setCommentColor = (last1: Row, last2: Row) => {
  const specialCommentList = last2.map((value, index) => {
    if (!value) return []
    const requestCommentList = last1[index] ? last1[index].toString().split('\n') : []

    const requestCommentListEx: string[] = requestCommentList.map((item) => {
      const parts = item.split(':')
      return parts[0]
    })

    const commentList = value.toString().split('\n')
    return commentList.map((comment) => {
      const frontPart = comment.split(':')[0]
      return { isColored: !requestCommentListEx.includes(frontPart), comment }
    })
  })
  return specialCommentList
}

export function AttendancePage() {
  const { t } = useLanguage()
  const { pushModal } = useModals()
  const { me } = useUserStore()
  const lastPeriod = me?.school.lastPeriod || 8
  const hasSaturdayClass = me?.school.hasSaturdayClass || false

  const { setToast: setToastMsg } = useNotificationStore()
  const { currentLanguage: language } = useLanguageStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [absentComment, setAbsentComment] = useState('')

  const [selday, setSelday] = useState(new Date())
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(new Date().getDay())
  const [, selmonday, seltuesday, selwednesday, selthursday, selfriday, selsaturday] = weekCount(selday)
  const [absentType1, setAbsentType1] = useState('출석')
  const [absentType2, setAbsentType2] = useState('출석')
  const [absentMark, setAbsentMark] = useState('.')

  const [lecture, setLecture] = useState<ResponseTimetableV3Dto[] | undefined>()

  const { allKlassGroupsUnique: allKlassGroups } = GroupContainer.useContext()

  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollRefM = useRef<HTMLDivElement>(null)

  const [isScrolled, setIsScrolled] = useState(false)
  const [isScrolledM, setIsScrolledM] = useState(false)

  const [absentInfo, setAbsentInfo] = useState<TimeTableInfo | undefined>()

  const handleScroll = () => {
    if (scrollRef.current) {
      setIsScrolled(scrollRef.current.scrollTop !== 0)
    }
  }
  const handleScrollM = () => {
    if (scrollRefM.current) {
      setIsScrolledM(scrollRefM.current.scrollTop !== 0)
    }
  }

  // 교사 시간표
  const { teachers, timetableV3Teacher, teacherId, setTeacherId } = useTeacherTimetableDetail('출석부', selday)

  let uniqueTimetableV3Teacher = timetableV3Teacher
    ?.filter((obj, index, self) => index === self.findIndex((t) => t.groupId === obj.groupId))
    ?.sort((a, b) => {
      if (!a.room || !b.room) {
        return 0
      }
      const aData = a.room.match('([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반')
      const bData = b.room.match('([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반')

      if (aData && bData) {
        if (aData?.[1] === bData?.[1]) {
          return Number(aData?.[2]) - Number(bData?.[2])
        } else {
          return Number(aData?.[1]) - Number(bData?.[1])
        }
      } else if (a.room > b.room) {
        return 1 // a를 b보다 뒤로 보냄
      } else if (a.room < b.room) {
        return -1 // a를 b보다 앞으로 보냄
      } else {
        return 0 // 순서를 변경하지 않음
      }
    })

  useEffect(() => {
    if (selectedDayOfWeek === 0) {
      setSelectedDayOfWeek(1)
    } else if (!hasSaturdayClass && selectedDayOfWeek >= 6) {
      setSelectedDayOfWeek(5)
    } else if (hasSaturdayClass && selectedDayOfWeek >= 7) {
      setSelectedDayOfWeek(6)
    }
  }, [selectedDayOfWeek])

  const [groupId, setSelectedGroupId] = useState(me?.klassGroupId || 0)
  const hasEditPermission = () => {
    return me?.id === selectedKlass?.homeRoomTeacherId
  }

  // 내수업 선택시 출석부에서 내 수업을 하이라이트
  useEffect(() => {
    setLecture(timetableV3Teacher?.filter((obj) => obj.groupId === groupId))
  }, [timetableV3Teacher, groupId, selday])
  const isSelectedLecture = (day: number, time: number) => {
    return lecture?.find((obj) => obj.time === time && obj.day === day)
  }

  const { downloadStudentNameMatrix, downloadAttendanceBook, loadingAttendanceBookDataSemester } =
    useAttendanceDownload({ groupId, startDate: selmonday.toISOString() })

  const { rows, attendanceAbsentData, handleAbsent, createAttendanceCheck } = useTeacherAttendanceBook1({
    groupId,
    year: +getDayOfYear(selday),
    semester: +getDayOfSemester(selday),
    startDate: selmonday.toISOString(),
    endDate: hasSaturdayClass ? selsaturday.toISOString() : selfriday.toISOString(),
  })

  const [editMode, setEditMode] = useState(false)
  const [editType, setEditType] = useState<{
    mark: string
    type1: string
    type2: string
    absent: boolean
  }>({
    mark: '.',
    type1: '',
    type2: '',
    absent: false,
  })

  const [isLoading, setLoading] = useState(false)

  const selectedKlass = allKlassGroups?.find((klass) => klass.id === groupId)
  const klassName = selectedKlass?.name || ''
  const teacher = selectedKlass?.homeRoomTeacherName || '선생님'
  const teacherNickName = getNickName(selectedKlass?.homeRoomTeacherNickName)

  const { row0, row1, rowId, row2, row3, row4, rest, last1, last2 } = getRows(rows)
  const studentIdList = getStudentIdList(rest)
  const studentMap = makeSubjectMap(studentIdList, row1, row2, row3, rest, lastPeriod + 1)
  const coloredComment = setCommentColor(last1, last2)

  const handleDateChange = (offset: number) => {
    const tempDay = selday
    tempDay.setDate(tempDay.getDate() + offset)
    setSelday(new Date(tempDay))
  }

  const setAbsentReady = (studentId: string, day: Date, period: number, dayOfWeek: keyof typeof DayOfWeekEnum) => {
    setAbsentInfo({ studentId, day, period, dayOfWeek })
    setAbsentComment(getAbsentInfoComment(studentId, selmonday, period) || '')
    setModalOpen(true)
  }

  const setAbsent = (studentId: string, day: Date, period: number, dayOfWeek: keyof typeof DayOfWeekEnum) => {
    if (!editMode) return

    // console.log('setAbsent', { studentId, day, period, dayOfWeek, editMode });
    // 특정 요일의 과목, 선생님, 교시
    const studentAttendanceByWeek = studentMap.get(studentId)
    // console.log('studentAttendanceByWeek', studentAttendanceByWeek);
    if (!studentAttendanceByWeek) return

    const studentAttendanceByDayOfWeek = studentAttendanceByWeek.get(DayOfWeekEnum[dayOfWeek])
    // console.log('studentAttendanceByDayOfWeek', studentAttendanceByDayOfWeek);
    if (!studentAttendanceByDayOfWeek) return

    // console.log('attendanceAbsentData', attendanceAbsentData);
    const previousContentByPeriod = getPreviousContentByPeriod(attendanceAbsentData, day, studentId)

    const attendance = studentAttendanceByDayOfWeek.map((periodSubjectTeacher: PeriodSubjectTeacher) => {
      const previousData = previousContentByPeriod.get(periodSubjectTeacher.period)
      if (
        periodSubjectTeacher.period === period ||
        !editType.absent ||
        (editType.type1 === '지각' && periodSubjectTeacher.period < period) ||
        (editType.type1 === '조퇴' && periodSubjectTeacher.period > period) ||
        editType.type1 === '결석'
      ) {
        return {
          subject: periodSubjectTeacher.subject,
          period: periodSubjectTeacher.period,
          creator: previousData?.creator ? previousData.creator : me?.name || '',
          createtime: previousData?.createtime ? previousData.createtime : new Date().toISOString(),
          editor: previousData?.creator ? me?.name || '' : '',
          edittime: previousData?.creator ? new Date().toISOString() : '',
          comment: absentComment || '',
          absent: editType.absent,
          type1: editType.type1,
          type2: editType.type2,
        }
      }
      return {
        subject: previousData?.subject || periodSubjectTeacher.subject,
        period: previousData?.period || periodSubjectTeacher.period,
        creator: previousData?.creator || '',
        createtime: previousData?.createtime || '',
        editor: previousData?.editor || '',
        edittime: previousData?.edittime || '',
        comment: previousData?.comment || '',
        absent: previousData?.absent || false,
        type1: previousData?.type1 || '',
        type2: previousData?.type2 || '',
      }
    })

    handleAbsent({
      attendanceDay: toLocaleDateFormatString(day),
      absent: editType.absent,
      type1: editType.type1,
      type2: editType.type2,
      comment: '',
      content: JSON.stringify({ attendance }),
      year: +getDayOfYear(day),
      semester: +getDayOfSemester(day),
      userId: +studentId,
      schoolId: me?.schoolId || 0,
      sendNoti: true,
      notiType: 'day',
      period: 0,
    })

    return
  }

  const getAbsentInfo = (studentId: string, day: Date, period: number) => {
    const previousContentByPeriod = getPreviousContentByPeriod(attendanceAbsentData, day, studentId).get(period)

    return previousContentByPeriod
  }

  const getAbsentInfoComment = (studentId: string, day: Date, period: number) => {
    const info = getAbsentInfo(studentId, day, period)

    return info?.comment
  }

  useEffect(() => {
    let mark = '.'
    let type1: string = absentType1
    let type2: string = absentType2
    let absent = true
    switch (absentType2 + absentType1) {
      case '출석출석':
        type1 = ''
        type2 = ''
        mark = '.'
        absent = false
        break
      case '질병결석':
        mark = '♡'
        break
      case '미인정결석':
        mark = '♥'
        break
      case '기타결석':
        mark = '▲'
        break
      case '인정결석':
        mark = '△'
        break

      case '질병지각':
        mark = '＃'
        break
      case '미인정지각':
        mark = 'Ｘ'
        break
      case '기타지각':
        mark = '≠'
        break
      case '인정지각':
        mark = '◁'
        break

      case '질병조퇴':
        mark = '＠'
        break
      case '미인정조퇴':
        mark = '◎'
        break
      case '기타조퇴':
        mark = '∞'
        break
      case '인정조퇴':
        mark = '▷'
        break

      case '질병결과':
        mark = '☆'
        break
      case '미인정결과':
        mark = '◇'
        break
      case '기타결과':
        mark = '＝'
        break
      case '인정결과':
        mark = '▽'
        break

      case '질병기타':
        mark = 'v'
        break
      case '미인정기타':
        mark = 'v'
        break
      case '기타기타':
        mark = 'v'
        break
      case '인정기타':
        mark = 'v'
        break
    }
    setAbsentMark(mark)
    setEditType({ mark, type1, type2, absent })
  }, [absentType1, absentType2])

  const permittedGroups = allKlassGroups.filter((item) => {
    if (me?.role === Role.TEACHER) {
      return item.id === me.klassGroupId
    } else if (me?.role === Role.HEAD || me?.role === Role.PRE_HEAD) {
      return item.name?.startsWith(me?.headNumber.toString())
    } else if (
      me?.role === Role.HEAD_PRINCIPAL ||
      me?.role === Role.PRE_PRINCIPAL ||
      me?.role === Role.PRINCIPAL ||
      me?.role === Role.VICE_PRINCIPAL ||
      me?.role === Role.ADMIN
    ) {
      return true
    } else {
      return false
    }
  })

  const attendenceCheck = (lectureId: string, idx: number, myLecture: boolean) => {
    if (hasEditPermission() || myLecture) {
      const dayKorean = nullSafeValue(row0[0]) + ' ' + nullSafeValue(row0[idx - ((idx - 3) % (lastPeriod + 1)) + 1])
      const parts = dayKorean.match(/(\d+)[년월일]/g)

      if (parts && parts.length === 3) {
        const month = parts[1].slice(0, -1).padStart(2, '0') // '월'을 제거하고, 2자리가 되도록 앞에 '0'을 추가
        const year = +month >= 3 ? parts[0].slice(0, -1) : +parts[0].slice(0, -1) + 1 // '년'을 제거
        const day = parts[2].slice(0, -1).padStart(2, '0') // '일'을 제거하고, 2자리가 되도록 앞에 '0'을 추가

        const formatDate = `${year}-${month}-${day}`

        const result = confirm(`${year}년 ${month}월 ${day}일 ${row4[idx]}교시의 출석 확인을 하셨습니까? `)
        if (result) {
          createAttendanceCheck(+lectureId, formatDate)
        }
      } else {
        setToastMsg('출석확인 저장을 실패했습니다.')
      }
    } else {
      setToastMsg('출석확인 권한이 없습니다.')
    }
  }

  return (
    <div className="col-span-6">
      {/*{isTimetableLoading && <Blank />}*/}
      {(isLoading || loadingAttendanceBookDataSemester) && <Blank />}
      <div className="w-full justify-center">
        {/* 모바일용 뷰 */}
        <div className="md:hidden">
          <div>
            <TopNavbar title={`${t('attendance_register')}`} left={<BackButton />} />
          </div>

          <div className="flex justify-between px-3 py-3">
            <Select.lg
              className="w-1/3"
              placeholder="학급 선택"
              value={groupId}
              onChange={(e) => setSelectedGroupId(Number(e.target.value))}
            >
              <option key={0} value={0}>
                학급 선택
              </option>
              {permittedGroups?.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </Select.lg>

            <Select.lg
              className="w-2/3"
              placeholder="그룹 선택"
              value={groupId}
              onChange={(e) => setSelectedGroupId(Number(e.target.value))}
            >
              <option key={0} value={0}>
                내 수업 선택
              </option>
              {uniqueTimetableV3Teacher?.map((group) => (
                <option key={group.groupId} value={group.groupId}>
                  {group.room} {group.subject}
                </option>
              ))}
            </Select.lg>

            {/* <div className="grid h-12 w-2/5 place-items-center align-middle font-semibold ">
              {groupId && '담임 : ' + teacher}
            </div> */}
          </div>

          <div className="flex w-full items-center justify-center space-x-4">
            <div
              onClick={() => handleDateChange(-7)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2"
            >
              <Icon.ChevronLeft />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{selday.getFullYear()}년</p>
              <p className="text-sm">
                {selmonday.getMonth() + 1}월 {selmonday.getDate()}일 ~{' '}
                {(hasSaturdayClass ? selsaturday : selfriday).getMonth() + 1}월{' '}
                {(hasSaturdayClass ? selsaturday : selfriday).getDate()}일
              </p>
            </div>
            <div
              className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2`}
              onClick={() => handleDateChange(7)}
            >
              <Icon.ChevronRight />
            </div>
          </div>

          <div className="flex flex-row px-6 py-2 text-center">
            <div
              onClick={() => setSelectedDayOfWeek(1)}
              className={`w-full cursor-pointer rounded-tl-xl rounded-bl-xl border border-white px-1 ${
                selectedDayOfWeek === 1 ? 'bg-orange-200 text-red-500' : 'bg-gray-300'
              } `}
            >
              월
            </div>
            <div
              onClick={() => setSelectedDayOfWeek(2)}
              className={`w-full cursor-pointer border border-white px-1 ${
                selectedDayOfWeek === 2 ? 'bg-pink-100 text-red-500' : 'bg-gray-300'
              } `}
            >
              화
            </div>
            <div
              onClick={() => setSelectedDayOfWeek(3)}
              className={`w-full cursor-pointer border border-white px-1 ${
                selectedDayOfWeek === 3 ? 'bg-sky-300 text-red-500' : 'bg-gray-300'
              } `}
            >
              수
            </div>
            <div
              onClick={() => setSelectedDayOfWeek(4)}
              className={`w-full cursor-pointer border border-white px-1 ${
                selectedDayOfWeek === 4 ? 'bg-green-200 text-red-500' : 'bg-gray-300'
              } `}
            >
              목
            </div>
            <div
              onClick={() => setSelectedDayOfWeek(5)}
              className={`w-full cursor-pointer ${
                hasSaturdayClass ? '' : 'rounded-tr-xl rounded-br-xl'
              } border border-white px-1 ${selectedDayOfWeek === 5 ? 'bg-violet-200 text-red-500' : 'bg-gray-300'} `}
            >
              금
            </div>

            {hasSaturdayClass && (
              <div
                onClick={() => setSelectedDayOfWeek(6)}
                className={`w-full cursor-pointer rounded-tr-xl rounded-br-xl border border-white px-1 ${
                  selectedDayOfWeek === 6 ? 'bg-orange-200 text-red-500' : 'bg-gray-300'
                } `}
              >
                토
              </div>
            )}
          </div>

          <div className="h-screen-14 w-full overflow-y-scroll px-6 pb-20" ref={scrollRefM} onScroll={handleScrollM}>
            {!groupId && <div className="text-center text-3xl">학급 또는 수업을 선택해주세요.</div>}
            {!!groupId && (
              <>
                <table className="mb-16 w-full table-fixed border-collapse rounded-lg text-center">
                  <thead className="sticky top-0 bg-black">
                    {!isScrolledM && (
                      <>
                        {/* 과목 row */}
                        <tr className={'h-2'}>
                          <td
                            colSpan={3}
                            className="w-30 border border-gray-200 bg-gray-50 py-2 text-center"
                          >{`${nullSafeValue(row1[2])}`}</td>
                          {createNumberArray(
                            3 + (selectedDayOfWeek - 1) * (lastPeriod + 1),
                            lastPeriod + 3 + (selectedDayOfWeek - 1) * (lastPeriod + 1),
                          ).map((i, index) => (
                            <td
                              key={i}
                              className={`border border-gray-200 text-sm break-all ${
                                selectedDayOfWeek === 1
                                  ? 'bg-orange-200'
                                  : selectedDayOfWeek === 2
                                    ? 'bg-pink-100'
                                    : selectedDayOfWeek === 3
                                      ? 'bg-sky-300'
                                      : selectedDayOfWeek === 4
                                        ? 'bg-green-200'
                                        : selectedDayOfWeek === 5
                                          ? 'bg-violet-200'
                                          : selectedDayOfWeek === 6
                                            ? 'bg-orange-200'
                                            : 'bg-primary-800'
                              } ${isSelectedLecture(selectedDayOfWeek, index) && 'bg-red-500 text-white'} `}
                              onClick={() => subjectAndTeacher[i] && alert(subjectAndTeacher[i])}
                            >
                              {nullSafeValue(row1[i]).substring(0, 2)}
                            </td>
                          ))}
                        </tr>

                        {/* 선생님 row */}
                        <tr className={'h-2'}>
                          <td
                            colSpan={3}
                            className="w-30 border border-gray-200 bg-gray-50 py-2 text-center"
                          >{`${nullSafeValue(row2[2])}`}</td>
                          {createNumberArray(
                            3 + (selectedDayOfWeek - 1) * (lastPeriod + 1),
                            lastPeriod + 3 + (selectedDayOfWeek - 1) * (lastPeriod + 1),
                          ).map((i, index) => (
                            <td
                              key={i}
                              className={`border border-gray-200 text-sm break-all ${
                                selectedDayOfWeek === 1
                                  ? 'bg-orange-200'
                                  : selectedDayOfWeek === 2
                                    ? 'bg-pink-100'
                                    : selectedDayOfWeek === 3
                                      ? 'bg-sky-300'
                                      : selectedDayOfWeek === 4
                                        ? 'bg-green-200'
                                        : selectedDayOfWeek === 5
                                          ? 'bg-violet-200'
                                          : selectedDayOfWeek === 6
                                            ? 'bg-orange-200'
                                            : 'bg-primary-800'
                              } ${isSelectedLecture(selectedDayOfWeek, index) && 'bg-red-500 text-white'} `}
                              onClick={() => subjectAndTeacher[i] && alert(subjectAndTeacher[i])}
                            >
                              {nullSafeValue(row2[i])}
                            </td>
                          ))}
                        </tr>

                        {/* 출석체크 row */}
                        <tr className={'h-2'}>
                          <td
                            colSpan={3}
                            className="w-30 border border-gray-200 bg-gray-50 py-2 text-center"
                          >{`${nullSafeValue(row3[2])}`}</td>
                          {createNumberArray(
                            3 + (selectedDayOfWeek - 1) * (lastPeriod + 1),
                            lastPeriod + 3 + (selectedDayOfWeek - 1) * (lastPeriod + 1),
                          ).map((i, index) => (
                            <td
                              key={i}
                              className={`border border-gray-200 text-sm break-all ${
                                selectedDayOfWeek === 1
                                  ? 'bg-orange-200'
                                  : selectedDayOfWeek === 2
                                    ? 'bg-pink-100'
                                    : selectedDayOfWeek === 3
                                      ? 'bg-sky-300'
                                      : selectedDayOfWeek === 4
                                        ? 'bg-green-200'
                                        : selectedDayOfWeek === 5
                                          ? 'bg-violet-200'
                                          : selectedDayOfWeek === 6
                                            ? 'bg-orange-200'
                                            : 'bg-primary-800'
                              } ${isSelectedLecture(selectedDayOfWeek, index) && 'bg-red-500 text-white'} `}
                              onClick={() =>
                                attendenceCheck(
                                  nullSafeValue(rowId[i]),
                                  i,
                                  !!isSelectedLecture(selectedDayOfWeek, index),
                                )
                              }
                            >
                              {`${nullSafeValue(row2[i]) === '' ? '' : nullSafeValue(row3[i])}`}
                            </td>
                          ))}
                        </tr>
                      </>
                    )}

                    {/* 번호 이름 row */}
                    <tr className={'h-2'}>
                      <td className="w-15 border border-gray-200 bg-gray-50 text-center">{`${nullSafeValue(
                        row4[0],
                      )}`}</td>
                      <td colSpan={2} className="w-15 border border-gray-200 bg-gray-50 text-center">{`${nullSafeValue(
                        row4[2],
                      )}`}</td>
                      {createNumberArray(
                        3 + (selectedDayOfWeek - 1) * (lastPeriod + 1),
                        lastPeriod + 3 + (selectedDayOfWeek - 1) * (lastPeriod + 1),
                      ).map((i) => (
                        <td
                          key={i}
                          className={`border border-gray-200 text-sm break-all ${
                            selectedDayOfWeek === 1
                              ? 'bg-orange-200'
                              : selectedDayOfWeek === 2
                                ? 'bg-pink-100'
                                : selectedDayOfWeek === 3
                                  ? 'bg-sky-300'
                                  : selectedDayOfWeek === 4
                                    ? 'bg-green-200'
                                    : selectedDayOfWeek === 5
                                      ? 'bg-violet-200'
                                      : selectedDayOfWeek === 6
                                        ? 'bg-orange-200'
                                        : 'bg-primary-800'
                          } `}
                        >{`${nullSafeValue(row4[i])}`}</td>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {studentIdList.map((studentId, i) => {
                      return (
                        <tr key={studentId} className={`h-2 ${i % 5 === 4 && 'border-b-2 border-gray-300'}`}>
                          {getStudentAttendanceHead(rest, studentId).map((cell, index) => {
                            return (
                              <td
                                colSpan={index + 1}
                                key={index}
                                className="w-15 cursor-pointer border border-gray-200 text-sm"
                                onClick={() => pushModal(<StudentModal id={Number(studentId)} />)}
                              >
                                {nullSafeValue(cell)}
                              </td>
                            )
                          })}
                          {getStudentAttendanceByDayOfWeekMobile(
                            rest,
                            studentId,
                            selectedDayOfWeek,
                            lastPeriod + 1,
                          ).map((cell, index) => {
                            return (
                              <td
                                key={index}
                                className={`border border-gray-200 bg-gray-50 text-center ${
                                  selectedDayOfWeek === 1
                                    ? 'bg-orange-100'
                                    : selectedDayOfWeek === 2
                                      ? 'bg-pink-50'
                                      : selectedDayOfWeek === 3
                                        ? 'bg-sky-200'
                                        : selectedDayOfWeek === 4
                                          ? 'bg-green-100'
                                          : selectedDayOfWeek === 5
                                            ? 'bg-purple-200'
                                            : selectedDayOfWeek === 6
                                              ? 'bg-orange-100'
                                              : 'bg-primary-800'
                                } ${editMode ? 'cursor-pointer' : ''} ${nullSafeValue(cell) === '.' ? '' : 'text-red-500'}`}
                                onClick={() => {
                                  if (!editMode) return
                                  selectedDayOfWeek === 1
                                    ? setAbsentReady(studentId, selmonday, index, 'monday')
                                    : selectedDayOfWeek === 2
                                      ? setAbsentReady(studentId, seltuesday, index, 'tuesday')
                                      : selectedDayOfWeek === 3
                                        ? setAbsentReady(studentId, selwednesday, index, 'wednesday')
                                        : selectedDayOfWeek === 4
                                          ? setAbsentReady(studentId, selthursday, index, 'thursday')
                                          : selectedDayOfWeek === 5
                                            ? setAbsentReady(studentId, selfriday, index, 'friday')
                                            : setAbsentReady(studentId, selsaturday, index, 'saturday')
                                }}
                              >
                                {nullSafeValue(cell)}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}

                    {/* 출결신청 */}
                    <tr className="h-2">
                      <td
                        colSpan={3}
                        className="w-20 border border-gray-200 bg-gray-50 py-2 text-center"
                      >{`${nullSafeValue(last1[2])}`}</td>
                      <td
                        colSpan={lastPeriod + 1}
                        className="border border-gray-200 text-left text-xs whitespace-pre-line"
                      >{`${nullSafeValue(last1[3 + (selectedDayOfWeek - 1) * (lastPeriod + 1)])}`}</td>
                    </tr>

                    {/* 득기사항 */}
                    <tr className="h-2">
                      <td
                        colSpan={3}
                        className="w-30 border border-gray-200 bg-gray-50 py-2 text-center"
                      >{`${nullSafeValue(last2[2])}`}</td>
                      <td
                        colSpan={lastPeriod + 1}
                        className="border border-gray-200 text-left text-xs whitespace-pre-line"
                      >
                        {coloredComment[3 + (selectedDayOfWeek - 1) * (lastPeriod + 1)]?.map(
                          ({ isColored, comment }) => {
                            return <p className={`${isColored ? 'text-red-500' : ''}`}>{comment}</p>
                          },
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {hasEditPermission() && !editMode ? (
                  <div className="mt-3 flex w-full flex-col items-center justify-center">
                    <Button.lg children="수정하기" onClick={() => setEditMode(true)} className="filled-primary" />
                  </div>
                ) : (
                  <div className="mt-32"></div>
                )}
              </>
            )}
          </div>

          {editMode && (
            <div className="absolute bottom-15 w-full px-10 py-2">
              <div className="flex w-full justify-end space-x-2 rounded-lg bg-gray-600 p-2">
                <div className="grid h-10 place-items-center align-middle text-2xl text-white">{absentMark}</div>

                <Select.lg
                  className="w-30"
                  value={absentType2}
                  onChange={(e) => {
                    e.target.value === '출석'
                      ? setAbsentType1('출석')
                      : absentType1 === '출석' && setAbsentType1('결석')
                    setAbsentType2(e.target.value)
                  }}
                >
                  {['출석', '인정', '질병', '미인정', '기타'].map((subject: string) => (
                    <option value={subject} key={subject}>
                      {subject}
                    </option>
                  ))}
                </Select.lg>
                <Select.lg
                  className="w-30"
                  value={absentType1}
                  onChange={(e) => {
                    e.target.value === '출석'
                      ? setAbsentType2('출석')
                      : absentType2 === '출석' && setAbsentType2('인정')
                    setAbsentType1(e.target.value)
                  }}
                >
                  {['출석', '결석', '지각', '조퇴', '결과', '기타'].map((subject: string) => (
                    <option value={subject} key={subject}>
                      {subject}
                    </option>
                  ))}
                </Select.lg>

                <Button.lg children="닫기" onClick={() => setEditMode(false)} className="filled-primary" />
              </div>
            </div>
          )}
        </div>

        {/* PC용 뷰 */}
        <div className="hidden md:block">
          <div className="px-6 py-6">
            <div className="flex justify-between">
              <div>
                <h1 className="text-2xl font-semibold">
                  {t('attendance_register', '출석부')}
                  {!!groupId &&
                    klassName &&
                    '(' + klassName + ` - ${t('homeroom_teacher', '담임선생님')} : ` + teacher + teacherNickName + ')'}
                </h1>
                <div className="mb-5 text-sm text-gray-500">
                  *학생 출석을 입력하고 출결 현황을 한눈에 확인할 수 있어요.
                </div>
              </div>
              <div className="flex space-x-2">
                <Select.lg
                  placeholder={language === 'ko' ? '학급 선택' : 'Select Class'}
                  value={groupId}
                  onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                >
                  <option key={0} value={0}>
                    {language === 'ko' ? '학급 선택' : 'Select Class'}
                  </option>
                  {permittedGroups?.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </Select.lg>

                {me?.role === Role.ADMIN && (
                  <Select.lg
                    placeholder={language === 'ko' ? '선생님 선택' : 'Select Teacher'}
                    value={teacherId}
                    onChange={(e) => setTeacherId(+e.target.value)}
                  >
                    <option value="0">{t('select')}</option>
                    {teachers?.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher?.name}
                        {getNickName(teacher?.nickName)}
                      </option>
                    ))}
                  </Select.lg>
                )}

                <Select.lg
                  placeholder={language === 'ko' ? '그룹 선택' : 'Select Group'}
                  value={groupId}
                  onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                >
                  <option key={0} value={0}>
                    {me?.role === Role.ADMIN
                      ? language === 'ko'
                        ? '수업 선택'
                        : 'Select Lesson'
                      : t('select_my_class')}
                  </option>
                  {uniqueTimetableV3Teacher?.map((group) => (
                    <option key={group.groupId} value={group.groupId}>
                      {group.room} {group.subject}
                    </option>
                  ))}
                </Select.lg>
              </div>
            </div>
          </div>
          <Divider />
          <div className="flex w-full items-center bg-white px-6 py-3">
            {/* TODO : 엑셀버튼 누르면 해당주의 시간표만 나오는데, 이전에는 해당 학기의 시간표가 모두나왔다.*/}
            <Button.lg
              children="출석부"
              onClick={() => {
                setLoading(true)
                downloadAttendanceBook()
                setLoading(false)
              }}
              className="filled-green w-30"
            />

            <div className="flex w-full items-center justify-center space-x-4">
              <div
                onClick={() => handleDateChange(-7)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2"
              >
                <Icon.ChevronLeft />
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold">
                  {selday.getFullYear()}
                  {t('year', '년')}
                </p>
                <p className="text-sm">
                  {language === 'ko' ? (
                    <>
                      {selmonday.getMonth() + 1}월 {selmonday.getDate()}일 ~{' '}
                      {(hasSaturdayClass ? selsaturday : selfriday).getMonth() + 1}월{' '}
                      {(hasSaturdayClass ? selsaturday : selfriday).getDate()}일
                    </>
                  ) : (
                    <>
                      {selmonday.getDate()}th {selmonday.getMonth() + 1}~{' '}
                      {(hasSaturdayClass ? selsaturday : selfriday).getDate()}th{' '}
                      {(hasSaturdayClass ? selsaturday : selfriday).getMonth() + 1}
                    </>
                  )}
                </p>
              </div>
              <div
                onClick={() => handleDateChange(7)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2"
              >
                <Icon.ChevronRight />
              </div>
            </div>

            <Button.lg
              children={t('roster', '명렬표')}
              onClick={() => {
                setLoading(true)
                downloadStudentNameMatrix()
                setLoading(false)
              }}
              className="filled-green w-30"
            />
          </div>

          <div
            className="scroll-box h-screen-10 w-full overflow-y-scroll px-6 pb-20"
            ref={scrollRef}
            onScroll={handleScroll}
          >
            {!groupId && (
              <div className="text-center text-3xl">
                {t('select_class_or_subject', '학급 또는 수업을 선택해주세요.')}
              </div>
            )}
            {!!groupId && (
              <table className="mb-16 w-full table-fixed border-collapse rounded-lg bg-white text-center">
                <thead className="sticky top-0 bg-black">
                  <tr className="z-900 h-2 bg-black">
                    <td colSpan={3} className="w-30 border border-gray-200 bg-gray-50 py-2 text-center"></td>
                    <td
                      colSpan={lastPeriod + 1}
                      className="w-1/5 border border-gray-200 bg-orange-300 py-2"
                    >{`${nullSafeValue(row0[4])} ${nullSafeValue(row0[3])}`}</td>
                    <td
                      colSpan={lastPeriod + 1}
                      className="w-1/5 border border-gray-200 bg-pink-200 py-2"
                    >{`${nullSafeValue(row0[4 + (lastPeriod + 1) * 1])} ${nullSafeValue(
                      row0[3 + (lastPeriod + 1) * 1],
                    )}`}</td>
                    <td
                      colSpan={lastPeriod + 1}
                      className="w-1/5 border border-gray-200 bg-sky-400 py-2"
                    >{`${nullSafeValue(row0[4 + (lastPeriod + 1) * 2])} ${nullSafeValue(
                      row0[3 + (lastPeriod + 1) * 2],
                    )}`}</td>
                    <td
                      colSpan={lastPeriod + 1}
                      className="w-1/5 border border-gray-200 bg-green-300 py-2"
                    >{`${nullSafeValue(row0[4 + (lastPeriod + 1) * 3])} ${nullSafeValue(
                      row0[3 + (lastPeriod + 1) * 3],
                    )}`}</td>
                    <td
                      colSpan={lastPeriod + 1}
                      className="w-1/5 border border-gray-200 bg-violet-300 py-2"
                    >{`${nullSafeValue(row0[4 + (lastPeriod + 1) * 4])} ${nullSafeValue(
                      row0[3 + (lastPeriod + 1) * 4],
                    )}`}</td>
                    {hasSaturdayClass && (
                      <td
                        colSpan={lastPeriod + 1}
                        className="w-1/5 border border-gray-200 bg-orange-300 py-2"
                      >{`${nullSafeValue(row0[4 + (lastPeriod + 1) * 5])} ${nullSafeValue(
                        row0[3 + (lastPeriod + 1) * 5],
                      )}`}</td>
                    )}
                  </tr>
                  {!isScrolled && (
                    <>
                      <tr className={'h-2 bg-black'}>
                        <td
                          colSpan={3}
                          className="w-30 border border-gray-200 bg-gray-50 py-2 text-center"
                        >{`${nullSafeValue(row1[2])}`}</td>
                        {createNumberArray(3, 2 + (lastPeriod + 1) * 1).map((i, index) => (
                          <td
                            key={i}
                            className={`cursor-pointer border border-gray-200 bg-orange-200 text-sm break-all ${isSelectedLecture(1, index) && 'bg-red-500 text-white'} `}
                            onClick={() => subjectAndTeacher[i] && alert(subjectAndTeacher[i])}
                          >
                            {nullSafeValue(row1[i]).substring(0, 2)}
                          </td>
                        ))}
                        {createNumberArray(3 + (lastPeriod + 1) * 1, 2 + (lastPeriod + 1) * 2).map((i, index) => (
                          <td
                            key={i}
                            className={`cursor-pointer border border-gray-200 bg-pink-100 text-sm break-all ${isSelectedLecture(2, index) && 'bg-red-500 text-white'} `}
                            onClick={() => subjectAndTeacher[i] && alert(subjectAndTeacher[i])}
                          >
                            {nullSafeValue(row1[i]).substring(0, 2)}
                          </td>
                        ))}
                        {createNumberArray(3 + (lastPeriod + 1) * 2, 2 + (lastPeriod + 1) * 3).map((i, index) => (
                          <td
                            key={i}
                            className={`cursor-pointer border border-gray-200 bg-sky-300 text-sm break-all ${isSelectedLecture(3, index) && 'bg-red-500 text-white'} `}
                            onClick={() => subjectAndTeacher[i] && alert(subjectAndTeacher[i])}
                          >
                            {nullSafeValue(row1[i]).substring(0, 2)}
                          </td>
                        ))}
                        {createNumberArray(3 + (lastPeriod + 1) * 3, 2 + (lastPeriod + 1) * 4).map((i, index) => (
                          <td
                            key={i}
                            className={`cursor-pointer border border-gray-200 bg-green-200 text-sm break-all ${isSelectedLecture(4, index) && 'bg-red-500 text-white'} `}
                            onClick={() => subjectAndTeacher[i] && alert(subjectAndTeacher[i])}
                          >
                            {nullSafeValue(row1[i]).substring(0, 2)}
                          </td>
                        ))}
                        {createNumberArray(3 + (lastPeriod + 1) * 4, 2 + (lastPeriod + 1) * 5).map((i, index) => (
                          <td
                            key={i}
                            className={`cursor-pointer border border-gray-200 bg-violet-200 text-sm break-all ${isSelectedLecture(5, index) && 'bg-red-500 text-white'} `}
                            onClick={() => subjectAndTeacher[i] && alert(subjectAndTeacher[i])}
                          >
                            {nullSafeValue(row1[i]).substring(0, 2)}
                          </td>
                        ))}

                        {hasSaturdayClass &&
                          createNumberArray(3 + (lastPeriod + 1) * 5, 2 + (lastPeriod + 1) * 6).map((i, index) => (
                            <td
                              key={i}
                              className={`cursor-pointer border border-gray-200 bg-orange-200 text-sm break-all ${isSelectedLecture(6, index) && 'bg-red-500 text-white'} `}
                              onClick={() => subjectAndTeacher[i] && alert(subjectAndTeacher[i])}
                            >
                              {nullSafeValue(row1[i]).substring(0, 2)}
                            </td>
                          ))}
                      </tr>
                      <tr className={'h-2'}>
                        <td
                          colSpan={3}
                          className="w-30 border border-gray-200 bg-gray-50 py-2 text-center"
                        >{`${nullSafeValue(row2[2])}`}</td>
                        {createNumberArray(3, 2 + (lastPeriod + 1) * 1).map((i, index) => (
                          <td
                            key={i}
                            className={`cursor-pointer border border-gray-200 bg-orange-200 text-sm break-all ${isSelectedLecture(1, index) && 'bg-red-500 text-white'} `}
                            onClick={() => subjectAndTeacher[i] && alert(subjectAndTeacher[i])}
                          >{`${nullSafeValue(row2[i])}`}</td>
                        ))}
                        {createNumberArray(3 + (lastPeriod + 1) * 1, 2 + (lastPeriod + 1) * 2).map((i, index) => (
                          <td
                            key={i}
                            className={`cursor-pointer border border-gray-200 bg-pink-100 text-sm break-all ${isSelectedLecture(2, index) && 'bg-red-500 text-white'} `}
                            onClick={() => subjectAndTeacher[i] && alert(subjectAndTeacher[i])}
                          >{`${nullSafeValue(row2[i])}`}</td>
                        ))}
                        {createNumberArray(3 + (lastPeriod + 1) * 2, 2 + (lastPeriod + 1) * 3).map((i, index) => (
                          <td
                            key={i}
                            className={`cursor-pointer border border-gray-200 bg-sky-300 text-sm break-all ${isSelectedLecture(3, index) && 'bg-red-500 text-white'} `}
                            onClick={() => subjectAndTeacher[i] && alert(subjectAndTeacher[i])}
                          >{`${nullSafeValue(row2[i])}`}</td>
                        ))}
                        {createNumberArray(3 + (lastPeriod + 1) * 3, 2 + (lastPeriod + 1) * 4).map((i, index) => (
                          <td
                            key={i}
                            className={`cursor-pointer border border-gray-200 bg-green-200 text-sm break-all ${isSelectedLecture(4, index) && 'bg-red-500 text-white'} `}
                            onClick={() => subjectAndTeacher[i] && alert(subjectAndTeacher[i])}
                          >{`${nullSafeValue(row2[i])}`}</td>
                        ))}
                        {createNumberArray(3 + (lastPeriod + 1) * 4, 2 + (lastPeriod + 1) * 5).map((i, index) => (
                          <td
                            key={i}
                            className={`cursor-pointer border border-gray-200 bg-violet-200 text-sm break-all ${isSelectedLecture(5, index) && 'bg-red-500 text-white'} `}
                            onClick={() => subjectAndTeacher[i] && alert(subjectAndTeacher[i])}
                          >{`${nullSafeValue(row2[i])}`}</td>
                        ))}

                        {hasSaturdayClass &&
                          createNumberArray(3 + (lastPeriod + 1) * 5, 2 + (lastPeriod + 1) * 6).map((i, index) => (
                            <td
                              key={i}
                              className={`cursor-pointer border border-gray-200 bg-orange-200 text-sm break-all ${isSelectedLecture(6, index) && 'bg-red-500 text-white'} `}
                              onClick={() => subjectAndTeacher[i] && alert(subjectAndTeacher[i])}
                            >{`${nullSafeValue(row2[i])}`}</td>
                          ))}
                      </tr>

                      <tr className={'h-2'}>
                        <td
                          colSpan={3}
                          className="w-30 border border-gray-200 bg-gray-50 py-2 text-center"
                        >{`${nullSafeValue(row3[2])}`}</td>
                        {createNumberArray(3, 2 + (lastPeriod + 1) * 1).map((i, index) => (
                          <td
                            key={i}
                            className={`cursor-pointer border border-gray-200 bg-orange-200 text-sm break-all ${isSelectedLecture(1, index) && 'bg-red-500 text-white'} `}
                            onClick={() => attendenceCheck(nullSafeValue(rowId[i]), i, !!isSelectedLecture(1, index))}
                          >{`${nullSafeValue(row2[i]) === '' ? '' : nullSafeValue(row3[i])}`}</td>
                        ))}
                        {createNumberArray(3 + (lastPeriod + 1) * 1, 2 + (lastPeriod + 1) * 2).map((i, index) => (
                          <td
                            key={i}
                            className={`cursor-pointer border border-gray-200 bg-pink-100 text-sm break-all ${isSelectedLecture(2, index) && 'bg-red-500 text-white'} `}
                            onClick={() => attendenceCheck(nullSafeValue(rowId[i]), i, !!isSelectedLecture(2, index))}
                          >{`${nullSafeValue(row2[i]) === '' ? '' : nullSafeValue(row3[i])}`}</td>
                        ))}
                        {createNumberArray(3 + (lastPeriod + 1) * 2, 2 + (lastPeriod + 1) * 3).map((i, index) => (
                          <td
                            key={i}
                            className={`cursor-pointer border border-gray-200 bg-sky-300 text-sm break-all ${isSelectedLecture(3, index) && 'bg-red-500 text-white'} `}
                            onClick={() => attendenceCheck(nullSafeValue(rowId[i]), i, !!isSelectedLecture(3, index))}
                          >{`${nullSafeValue(row2[i]) === '' ? '' : nullSafeValue(row3[i])}`}</td>
                        ))}
                        {createNumberArray(3 + (lastPeriod + 1) * 3, 2 + (lastPeriod + 1) * 4).map((i, index) => (
                          <td
                            key={i}
                            className={`cursor-pointer border border-gray-200 bg-green-200 text-sm break-all ${isSelectedLecture(4, index) && 'bg-red-500 text-white'} `}
                            onClick={() => attendenceCheck(nullSafeValue(rowId[i]), i, !!isSelectedLecture(4, index))}
                          >{`${nullSafeValue(row2[i]) === '' ? '' : nullSafeValue(row3[i])}`}</td>
                        ))}
                        {createNumberArray(3 + (lastPeriod + 1) * 4, 2 + (lastPeriod + 1) * 5).map((i, index) => (
                          <td
                            key={i}
                            className={`cursor-pointer border border-gray-200 bg-violet-200 text-sm break-all ${isSelectedLecture(5, index) && 'bg-red-500 text-white'} `}
                            onClick={() => attendenceCheck(nullSafeValue(rowId[i]), i, !!isSelectedLecture(5, index))}
                          >{`${nullSafeValue(row2[i]) === '' ? '' : nullSafeValue(row3[i])}`}</td>
                        ))}

                        {hasSaturdayClass &&
                          createNumberArray(3 + (lastPeriod + 1) * 5, 2 + (lastPeriod + 1) * 6).map((i, index) => (
                            <td
                              key={i}
                              className={`cursor-pointer border border-gray-200 bg-orange-200 text-sm break-all ${isSelectedLecture(6, index) && 'bg-red-500 text-white'} `}
                              onClick={() => attendenceCheck(nullSafeValue(rowId[i]), i, !!isSelectedLecture(6, index))}
                            >{`${nullSafeValue(row2[i]) === '' ? '' : nullSafeValue(row3[i])}`}</td>
                          ))}
                      </tr>
                    </>
                  )}

                  {/* 번호 이름 row */}
                  <tr className={'z-100 h-2'}>
                    <td className="border border-gray-200 bg-gray-50 text-center">{`${nullSafeValue(row4[0])}`}</td>
                    <td colSpan={2} className="border border-gray-200 bg-gray-50 text-center">{`${nullSafeValue(
                      row4[2],
                    )}`}</td>
                    {createNumberArray(3, 2 + (lastPeriod + 1) * 1).map((i) => (
                      <td key={i} className="border border-gray-200 bg-orange-200 text-sm break-all">{`${nullSafeValue(
                        row4[i],
                      )}`}</td>
                    ))}
                    {createNumberArray(3 + (lastPeriod + 1) * 1, 2 + (lastPeriod + 1) * 2).map((i) => (
                      <td key={i} className="border border-gray-200 bg-pink-100 text-sm break-all">{`${nullSafeValue(
                        row4[i],
                      )}`}</td>
                    ))}
                    {createNumberArray(3 + (lastPeriod + 1) * 2, 2 + (lastPeriod + 1) * 3).map((i) => (
                      <td key={i} className="border border-gray-200 bg-sky-300 text-sm break-all">{`${nullSafeValue(
                        row4[i],
                      )}`}</td>
                    ))}
                    {createNumberArray(3 + (lastPeriod + 1) * 3, 2 + (lastPeriod + 1) * 4).map((i) => (
                      <td
                        key={i}
                        className="border border-gray-200 bg-green-200 text-sm break-all"
                      >{`${nullSafeValue(row4[i])}`}</td>
                    ))}
                    {createNumberArray(3 + (lastPeriod + 1) * 4, 2 + (lastPeriod + 1) * 5).map((i) => (
                      <td
                        key={i}
                        className="border border-gray-200 bg-violet-200 text-sm break-all"
                      >{`${nullSafeValue(row4[i])}`}</td>
                    ))}
                    {hasSaturdayClass &&
                      createNumberArray(3 + (lastPeriod + 1) * 5, 2 + (lastPeriod + 1) * 6).map((i) => (
                        <td
                          key={i}
                          className="border border-gray-200 bg-orange-200 text-sm break-all"
                        >{`${nullSafeValue(row4[i])}`}</td>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {studentIdList.map((studentId: string, i) => {
                    return (
                      <tr key={studentId} className={`h-2 ${i % 5 === 4 && 'border-b-2 border-gray-300'}`}>
                        {getStudentAttendanceHead(rest, studentId).map((cell, index) => {
                          return (
                            <td
                              colSpan={index + 1}
                              key={index}
                              className={`border border-gray-200 ${index === 1 ? 'text-left' : 'text-center'} cursor-pointer text-sm`}
                              onClick={() => pushModal(<StudentModal id={Number(studentId)} />)}
                            >
                              {nullSafeValue(cell)}
                              {/* <Tooltip value={nullSafeValue(cell)} showArrow>
                                {nullSafeValue(cell)}
                              </Tooltip> */}
                            </td>
                          )
                        })}
                        {/* 월요일 */}
                        {getStudentAttendanceByDayOfWeek(rest, studentId, 'monday', lastPeriod + 1).map(
                          (cell, index) => {
                            return (
                              <td
                                key={index}
                                onClick={() => {
                                  if (!editMode) return
                                  setAbsentReady(studentId, selmonday, index, 'monday')
                                }}
                                className={`border border-gray-200 bg-gray-50 bg-orange-100 text-center ${editMode ? 'cursor-pointer' : ''} ${nullSafeValue(cell) === '.' ? '' : 'text-red-500'}`}
                              >
                                {nullSafeValue(cell)}
                                {/* <Tooltip value={getAbsentInfoString(studentId, selmonday, index) || ''} placement={'bottom'}>
                                  {nullSafeValue(cell)}
                                </Tooltip> */}
                              </td>
                            )
                          },
                        )}
                        {/* 화요일 */}
                        {getStudentAttendanceByDayOfWeek(rest, studentId, 'tuesday', lastPeriod + 1).map(
                          (cell, index) => {
                            return (
                              <td
                                key={index}
                                onClick={() => {
                                  if (!editMode) return
                                  setAbsentReady(studentId, seltuesday, index, 'tuesday')
                                }}
                                className={`border border-gray-200 bg-gray-50 bg-pink-50 text-center ${editMode ? 'cursor-pointer' : ''} ${nullSafeValue(cell) === '.' ? '' : 'text-red-500'}`}
                              >
                                {nullSafeValue(cell)}
                              </td>
                            )
                          },
                        )}
                        {/* 수요일 */}
                        {getStudentAttendanceByDayOfWeek(rest, studentId, 'wednesday', lastPeriod + 1).map(
                          (cell, index) => {
                            return (
                              <td
                                key={index}
                                onClick={() => {
                                  if (!editMode) return
                                  setAbsentReady(studentId, selwednesday, index, 'wednesday')
                                }}
                                className={`border border-gray-200 bg-gray-50 bg-sky-200 text-center ${editMode ? 'cursor-pointer' : ''} ${nullSafeValue(cell) === '.' ? '' : 'text-red-500'}`}
                              >
                                {nullSafeValue(cell)}
                              </td>
                            )
                          },
                        )}
                        {/* 목요일 */}
                        {getStudentAttendanceByDayOfWeek(rest, studentId, 'thursday', lastPeriod + 1).map(
                          (cell, index) => {
                            return (
                              <td
                                key={index}
                                onClick={() => {
                                  if (!editMode) return
                                  setAbsentReady(studentId, selthursday, index, 'thursday')
                                }}
                                className={`border border-gray-200 bg-gray-50 bg-green-100 text-center ${editMode ? 'cursor-pointer' : ''} ${nullSafeValue(cell) === '.' ? '' : 'text-red-500'}`}
                              >
                                {nullSafeValue(cell)}
                              </td>
                            )
                          },
                        )}
                        {/* 금요일 */}
                        {getStudentAttendanceByDayOfWeek(rest, studentId, 'friday', lastPeriod + 1).map(
                          (cell, index) => {
                            return (
                              <td
                                key={index}
                                onClick={() => {
                                  if (!editMode) return
                                  setAbsentReady(studentId, selfriday, index, 'friday')
                                }}
                                className={`border border-gray-200 bg-gray-50 bg-purple-200 text-center ${editMode ? 'cursor-pointer' : ''} ${nullSafeValue(cell) === '.' ? '' : 'text-red-500'}`}
                              >
                                {nullSafeValue(cell)}
                                {/* <Tooltip value={getAbsentInfoString(studentId, selfriday, index) || ''} placement={'bottom'}>
                                  {nullSafeValue(cell)}
                                </Tooltip> */}
                              </td>
                            )
                          },
                        )}
                        {/* 토요일 */}
                        {hasSaturdayClass &&
                          getStudentAttendanceByDayOfWeek(rest, studentId, 'saturday', lastPeriod + 1).map(
                            (cell, index) => {
                              return (
                                <td
                                  key={index}
                                  onClick={() => {
                                    if (!editMode) return
                                    setAbsentReady(studentId, selsaturday, index, 'saturday')
                                  }}
                                  className={`border border-gray-200 bg-gray-50 bg-orange-100 text-center ${editMode ? 'cursor-pointer' : ''} ${nullSafeValue(cell) === '.' ? '' : 'text-red-500'}`}
                                >
                                  {nullSafeValue(cell)}
                                </td>
                              )
                            },
                          )}
                      </tr>
                    )
                  })}

                  {/* 출결신청 */}
                  <tr className="h-2">
                    <td
                      colSpan={3}
                      className="w-30 border border-gray-200 bg-gray-50 py-2 text-center"
                    >{`${nullSafeValue(last1[2])}`}</td>
                    {Array(hasSaturdayClass ? 6 : 5)
                      .fill(1)
                      .map((_, index) => (
                        <td
                          key={index}
                          colSpan={lastPeriod + 1}
                          className="border border-gray-200 text-left text-xs whitespace-pre-line"
                        >{`${nullSafeValue(last1[3 + index * (lastPeriod + 1)])}`}</td>
                      ))}
                  </tr>

                  {/* 득기사항 */}
                  <tr className="h-2">
                    <td
                      colSpan={3}
                      className="w-30 border border-gray-200 bg-gray-50 py-2 text-center"
                    >{`${nullSafeValue(last2[2])}`}</td>
                    {Array(hasSaturdayClass ? 6 : 5)
                      .fill(1)
                      .map((_, index) => (
                        <>
                          {coloredComment.length > 0 && (
                            <td
                              key={index}
                              colSpan={lastPeriod + 1}
                              className="border border-gray-200 text-left text-xs whitespace-pre-line"
                            >
                              {coloredComment[3 + index * (lastPeriod + 1)].map(({ isColored, comment }, index) => {
                                return (
                                  <p key={index} className={`${isColored ? 'text-red-500' : ''}`}>
                                    {comment}
                                  </p>
                                )
                              })}
                            </td>
                          )}
                        </>
                      ))}
                  </tr>
                </tbody>
              </table>
            )}

            {hasEditPermission() && !editMode ? (
              <div className="mt-6 mb-64 flex flex-col items-center justify-center">
                <Button.lg children="수정하기" onClick={() => setEditMode(true)} className="filled-primary" />
              </div>
            ) : (
              <div className="mb-64"></div>
            )}
            {editMode && (
              <div className="absolute bottom-4 mr-10 flex items-stretch space-x-2 rounded-lg bg-gray-600 p-5">
                <div
                  onClick={() => setEditType({ mark: '.', type1: '', type2: '', absent: false })}
                  className={`mt-2 grid w-30 cursor-pointer place-items-center rounded-lg text-center align-middle ${
                    '.' === editType.mark ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'
                  } `}
                >
                  출석
                </div>
                <div className="space-y-2 space-x-2">
                  <Chip
                    children="♡질병결석"
                    onClick={() => setEditType({ mark: '♡', type1: '결석', type2: '질병', absent: true })}
                    selected={'♡' === editType.mark}
                    className="ml-2 w-30 py-0.5"
                  />
                  <Chip
                    children="♥미인정결석"
                    onClick={() => setEditType({ mark: '♥', type1: '결석', type2: '미인정', absent: true })}
                    selected={'♥' === editType.mark}
                    className="w-30 py-0.5"
                  />
                  <Chip
                    children="▲기타결석"
                    onClick={() => setEditType({ mark: '▲', type1: '결석', type2: '기타', absent: true })}
                    selected={'▲' === editType.mark}
                    className="w-30 py-0.5"
                  />
                  <Chip
                    children="△인정결석"
                    onClick={() => setEditType({ mark: '△', type1: '결석', type2: '인정', absent: true })}
                    selected={'△' === editType.mark}
                    className="w-30 py-0.5"
                  />

                  <Chip
                    children="＃질병지각"
                    onClick={() => setEditType({ mark: '＃', type1: '지각', type2: '질병', absent: true })}
                    selected={'＃' === editType.mark}
                    className="w-30 py-0.5"
                  />
                  <Chip
                    children="Ｘ미인정지각"
                    onClick={() => setEditType({ mark: 'Ｘ', type1: '지각', type2: '미인정', absent: true })}
                    selected={'Ｘ' === editType.mark}
                    className="w-30 py-0.5"
                  />
                  <Chip
                    children="≠기타지각"
                    onClick={() => setEditType({ mark: '≠', type1: '지각', type2: '기타', absent: true })}
                    selected={'≠' === editType.mark}
                    className="w-30 py-0.5"
                  />
                  <Chip
                    children="◁인정지각"
                    onClick={() => setEditType({ mark: '◁', type1: '지각', type2: '인정', absent: true })}
                    selected={'◁' === editType.mark}
                    className="w-30 py-0.5"
                  />

                  <Chip
                    children="＠질병조퇴"
                    onClick={() => setEditType({ mark: '＠', type1: '조퇴', type2: '질병', absent: true })}
                    selected={'＠' === editType.mark}
                    className="w-30 py-0.5"
                  />
                  <Chip
                    children="◎미인정조퇴"
                    onClick={() => setEditType({ mark: '◎', type1: '조퇴', type2: '미인정', absent: true })}
                    selected={'◎' === editType.mark}
                    className="w-30 py-0.5"
                  />
                  <Chip
                    children="∞기타조퇴"
                    onClick={() => setEditType({ mark: '∞', type1: '조퇴', type2: '기타', absent: true })}
                    selected={'∞' === editType.mark}
                    className="w-30 py-0.5"
                  />
                  <Chip
                    children="▷인정조퇴"
                    onClick={() => setEditType({ mark: '▷', type1: '조퇴', type2: '인정', absent: true })}
                    selected={'▷' === editType.mark}
                    className="w-30 py-0.5"
                  />
                  <Chip
                    children="☆질병결과"
                    onClick={() => setEditType({ mark: '☆', type1: '결과', type2: '질병', absent: true })}
                    selected={'☆' === editType.mark}
                    className="w-30 py-0.5"
                  />
                  <Chip
                    children="◇미인정결과"
                    onClick={() => setEditType({ mark: '◇', type1: '결과', type2: '미인정', absent: true })}
                    selected={'◇' === editType.mark}
                    className="w-30 py-0.5"
                  />
                  <Chip
                    children="＝기타결과"
                    onClick={() => setEditType({ mark: '＝', type1: '결과', type2: '기타', absent: true })}
                    selected={'＝' === editType.mark}
                    className="w-30 py-0.5"
                  />
                  <Chip
                    children="▽인정결과"
                    onClick={() => setEditType({ mark: '▽', type1: '결과', type2: '인정', absent: true })}
                    selected={'▽' === editType.mark}
                    className="w-30 py-0.5"
                  />

                  <Chip
                    children="v질병기타"
                    onClick={() => setEditType({ mark: 'v1', type1: '기타', type2: '질병', absent: true })}
                    selected={'v1' === editType.mark}
                    className="w-30 py-0.5"
                  />
                  <Chip
                    children="v미인정기타"
                    onClick={() => setEditType({ mark: 'v2', type1: '기타', type2: '미인정', absent: true })}
                    selected={'v2' === editType.mark}
                    className="w-30 py-0.5"
                  />
                  <Chip
                    children="v기타기타"
                    onClick={() => setEditType({ mark: 'v3', type1: '기타', type2: '기타', absent: true })}
                    selected={'v3' === editType.mark}
                    className="w-30 py-0.5"
                  />
                  <Chip
                    children="v인정기타"
                    onClick={() => setEditType({ mark: 'v4', type1: '기타', type2: '인정', absent: true })}
                    selected={'v4' === editType.mark}
                    className="w-30 py-0.5"
                  />
                </div>
                <div
                  onClick={() => setEditMode(false)}
                  className="bg-primary-800 mt-2 grid w-30 cursor-pointer place-items-center rounded-lg text-center align-middle text-white"
                >
                  닫기
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SuperModal
        modalOpen={modalOpen}
        setModalClose={() => {
          setModalOpen(false)
        }}
        className="w-max"
      >
        <Section className="mt-7">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            출결상태의 변경사유를 입력하세요.
          </div>
          <TextInput placeholder="특기사항" value={absentComment} onChange={(e) => setAbsentComment(e.target.value)} />
          <Button.xl
            children="확인"
            onClick={() => {
              if (absentInfo) {
                setAbsent(absentInfo?.studentId, absentInfo?.day, absentInfo?.period, absentInfo?.dayOfWeek)
                setModalOpen(false)
              }
            }}
            className="filled-primary"
          />
        </Section>
      </SuperModal>
    </div>
  )
}
