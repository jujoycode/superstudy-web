import { useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { LazyLoadImage } from 'react-lazy-load-image-component'

import { ReactComponent as SvgUser } from '@/assets/svg/user.svg'
import { cn } from '@/utils/commonUtil'
import { useUserStore } from '@/stores/user'
import { Button } from '@/atoms/Button'
import { Divider } from '@/atoms/Divider'
import { Tabs as TabsNew, TabsList, TabsTrigger } from '@/atoms/Tabs'
import { SelectMenus, SuperModal } from '@/legacy/components'
import { Label, Section, Select } from '@/legacy/components/common'
import { Tabs } from '@/legacy/components/common/Tabs'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Time } from '@/legacy/components/common/Time'
import { TimetableAtdCard } from '@/legacy/components/timetable/TimetableAtdCard'
import { TimetableStudentRole } from '@/legacy/components/timetable/TimetableStudentRole'
import { Constants } from '@/legacy/constants'
import { GroupContainer } from '@/legacy/container/group'
import { useTeacherSeatPosition } from '@/legacy/container/teacher-seat-position'
import { useTimeTableAttendancePageV3 } from '@/legacy/container/teacher-timetable-attendance-page-v3'
import {
  LectureType,
  RequestUpsertStudentRoleDto,
  ResponseTimetableV3Dto,
  ResponseUserAttendanceDto,
} from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import ConfirmModal from '@/legacy/modals/ConfirmModal'
import { useModals } from '@/legacy/modals/ModalStack'
import { StudentModal } from '@/legacy/modals/StudentModal'
import { dayOfEngWeek, dayOfKorWeek } from '@/legacy/util/date'
import { getNickName } from '@/legacy/util/status'
import { getThisSemester, getThisYear } from '@/legacy/util/time'
import { TimetableNeisForm } from './TimetableNeisForm'

const groups = [
  { id: 1, name: '1' },
  { id: 2, name: '2' },
  { id: 3, name: '3' },
  { id: 4, name: '4' },
  { id: 5, name: '5' },
  { id: 6, name: '6' },
  { id: 7, name: '7' },
  { id: 8, name: '8' },
  { id: 9, name: '9' },
]

enum contentType {
  list = 1,
  seat,
  role,
  neis,
}

interface AbsentUser {
  id: number
  profile: string
  klassname: string
  student_number: string
  name: string
  nick_name?: string
  hope: string
  major: string
  absent: boolean
  content: string
  comment: string
  type1: string
  type2: string
  role: string
  job: string
}

const defaultSelectedUser = {
  id: -1,
  profile: '',
  klassname: '',
  student_number: '',
  name: '',
  hope: '',
  major: '',
  absent: false,
  content: '',
  comment: '',
  type1: '',
  type2: '',
  role: '',
  job: '',
}

interface SeatType2 {
  id: number
  name: string
}

export interface AttendanceContent {
  absent: boolean
  comment: string
  createtime: string
  creator: string
  editor: string
  edittime: string
  period: number
  subject: string
  type1: string
  type2: string
}

interface RoleInfoType {
  id: number
  klassname: string
  student_number: number
  name: string
  role: string
  job: string
  displayOrder: number
}

const getTargetDay = (dayOfWeek: number) => {
  const currentDate = new Date()
  const startOfWeek = moment(currentDate).startOf('week').add(1, 'day')
  const datesOfWeek = []
  let tempDate = startOfWeek
  while (datesOfWeek.length <= 7) {
    datesOfWeek.push(tempDate.format('YYYY-MM-DD'))
    tempDate = moment(tempDate).add(1, 'day')
  }

  return datesOfWeek[dayOfWeek - 1]
}

interface TimetableAttendancePageProps {
  lectureInfo: ResponseTimetableV3Dto
  isKlass: boolean
}

export function TimetableAttendancePage({ lectureInfo, isKlass }: TimetableAttendancePageProps) {
  const year = +getThisYear()
  const semester = +getThisSemester()
  const { t, currentLang } = useLanguage()
  const { pushModal } = useModals()

  const { me } = useUserStore()
  const lastPeriod = me?.school.lastPeriod || 8

  const { allKlassGroups } = GroupContainer.useContext()
  const selectedKlassInfo = allKlassGroups.find((item) => item.name === lectureInfo.groupName)

  const myKlass = selectedKlassInfo?.homeRoomTeacherId === me?.id

  // klassInfo.timeCode = 요일_몇교시 ex: "monday_1", "wednesday_3"
  // const [dayOfWeek, selectedPeriodString] = selectedLectureInfo;
  const targetDay = getTargetDay(lectureInfo.day)
  const selectedPeriod = lectureInfo.time

  const [teacherName, setTeacherName] = useState(selectedKlassInfo?.homeRoomTeacherName)
  const teacherNickName = getNickName(selectedKlassInfo?.homeRoomTeacherNickName)

  useEffect(() => {
    setTeacherName(selectedKlassInfo ? selectedKlassInfo?.homeRoomTeacherName : lectureInfo.teacherName)
  }, [lectureInfo.teacherName, selectedKlassInfo])

  const { seatPositionId, seatPosition, updateSeatPosition } = useTeacherSeatPosition({
    groupId: selectedKlassInfo ? selectedKlassInfo.id : lectureInfo.groupId,
  })

  const { userAttendance, createAttendanceAbsent, updateStudentRole, AttendanceCheckInfo, createAttendanceCheck } =
    useTimeTableAttendancePageV3({
      lectureId: lectureInfo.id,
      groupId: lectureInfo.groupId.toString() || '0',
      year: year.toString(),
      day: targetDay,
    })

  const students: ResponseUserAttendanceDto[] = userAttendance // me 데이터와 유사

  const tempRoleInfo = useMemo(() => {
    return userAttendance
      .filter((student: any) => !student.expired)
      .map((student: any) => ({
        id: student.id,
        klassname: student.klassname as string,
        student_number: student.student_number as number,
        name: student.name,
        role: student.role ? student.role : '',
        job: student.job ? student.job : '',
        displayOrder: student?.display_order ? student.display_order : 0,
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder)
  }, [userAttendance])

  const [roleInfo, setRoleInfo] = useState<RoleInfoType[]>([...tempRoleInfo])

  const [showAbsent, setShowAbsent] = useState<string>('all')

  const [showSeat, setShowSeat] = useState(contentType.list)
  const [selectedUserId, setSelectedUserId] = useState<AbsentUser>(defaultSelectedUser)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  const [showConfirmOpen, setShowConfirmOpen] = useState(false)

  const [seatSizeRows, setSeatSizeRows] = useState<SeatType2>({ id: 0, name: '0' })
  const [seatSizeCols, setSeatSizeCols] = useState<SeatType2>({ id: 6, name: '6' })

  const [seatEditMode, setSeatEditMode] = useState(false)
  const [roleEditMode, setRoleEditMode] = useState(false)

  const [showSubject, setShowSubject] = useState(false)

  const [removeStudents, setRemoveStudents] = useState<Map<number, boolean>>(new Map())
  const [absentOfSelectedPeriod, setAbsentOfSelectedPeriod] = useState<Map<number, boolean>>(new Map())
  const [absentCommentOfSelectedPeriod, setAbsentCommentOfSelectedPeriod] = useState<Map<number, string>>(new Map())
  const [studentsAbsent, setStudentsAbsent] = useState<number[]>([])

  useEffect(() => {
    if (!students) return

    const newRemoveStudents = new Map<number, boolean>()
    const newAbsentOfSelectedPeriod = new Map<number, boolean>()
    const newAbsentCommentOfSelectedPeriod = new Map<number, string>()
    const newStudentsAbsent: number[] = []

    students.forEach((student: ResponseUserAttendanceDto) => {
      // @ts-ignore ! type
      if (student.expired || student.not_attend) {
        newRemoveStudents.set(student.id, true)
        newAbsentCommentOfSelectedPeriod.set(student.id, '')
      } else {
        if (student.content) {
          const contentJson: { attendance: AttendanceContent[] } = JSON.parse(student.content)
          const hasData = contentJson.attendance.length > lectureInfo.time
          const attendanceItem = hasData ? contentJson.attendance[lectureInfo.time] : undefined

          newAbsentOfSelectedPeriod.set(student.id, hasData ? (attendanceItem?.absent ?? false) : false)
          newAbsentCommentOfSelectedPeriod.set(student.id, hasData ? (attendanceItem?.comment ?? '') : '')

          if (hasData && attendanceItem?.absent && student.student_number) {
            // @ts-ignore ! type
            newStudentsAbsent.push(student.student_number)
          }

          if (hasData && attendanceItem?.type1 !== '' && attendanceItem?.type2 !== '') {
            student.type1 = attendanceItem?.type1 || ''
            student.type2 = attendanceItem?.type2 || ''
          }
        } else {
          newAbsentOfSelectedPeriod.set(student.id, false)
          newAbsentCommentOfSelectedPeriod.set(student.id, '')
        }
      }
    })

    setRemoveStudents(newRemoveStudents)
    setAbsentOfSelectedPeriod(newAbsentOfSelectedPeriod)
    setAbsentCommentOfSelectedPeriod(newAbsentCommentOfSelectedPeriod)
    setStudentsAbsent(newStudentsAbsent)
  }, [students])

  const handleModalOpen = (student: any) => {
    setSelectedUserId({
      id: student.id,
      profile: student.profile,
      klassname: student.klassname || '',
      student_number: student.student_number ? student.student_number.toString() : '',
      name: student.name,
      nick_name: student.nick_name,
      hope: student.hopepath,
      major: student.hopemajor,
      absent: absentOfSelectedPeriod.get(student.id) ? true : false,
      content: student.content || '',
      comment: absentCommentOfSelectedPeriod.get(student?.id) || '',
      type1: student.type1 || '',
      type2: student.type2 || '',
      role: student?.role || '',
      job: student?.job || '',
    })
    setIsAttendanceModalOpen(true)
  }

  const getAttendanceArray = () => {
    let contentJson: { attendance: AttendanceContent[] } = { attendance: [] }
    // 기초데이터 생성
    if (selectedUserId.content) {
      contentJson = JSON.parse(selectedUserId.content) as { attendance: AttendanceContent[] }
    } else {
      for (let i = 0; i <= lastPeriod; i++) {
        const t = {
          subject: i === 0 ? '조회' : '',
          period: i,
          creator: me?.name ? me?.name : '',
          createtime: new Date().toLocaleString(),
          editor: '',
          edittime: '',
          comment: '',
          absent: false,
          type1: '',
          type2: '',
        }

        contentJson.attendance.push(t)
      }
    }
    return contentJson
  }

  const confirmAttendanceCheck = () => {
    const result = confirm(
      `${lectureInfo.room} ${dayOfKorWeek(lectureInfo.day)}요일 ${
        lectureInfo.time === 0 ? '조회' : lectureInfo.time + '교시'
      } 의 출석체크를 하셨습니까? `,
    )

    if (result) {
      createAttendanceCheck()
    }
  }

  /// userId : 결석처리할 학색,
  /// absent : true : 미출석, false : 출석
  /// content : 이전시간 출석 기록
  const submitAbsentUser = (submit: boolean) => {
    if (!submit || selectedUserId.id <= 0) {
      setSelectedUserId(defaultSelectedUser)
      setIsAttendanceModalOpen(false)
      return
    }

    const contentJson = getAttendanceArray()

    let type1 = ''
    let type2 = ''

    if (selectedUserId.absent) {
      type1 = !selectedUserId.type1 || selectedUserId.type1 === '' ? '기타' : selectedUserId.type1
      type2 = !selectedUserId.type2 || selectedUserId.type2 === '' ? '기타' : selectedUserId.type2
    }

    contentJson.attendance[selectedPeriod].subject = lectureInfo.subject
    contentJson.attendance[selectedPeriod].comment = selectedUserId.comment || ''
    contentJson.attendance[selectedPeriod].type1 = type1
    contentJson.attendance[selectedPeriod].type2 = type2
    contentJson.attendance[selectedPeriod].editor = me?.name ? me?.name : ''
    contentJson.attendance[selectedPeriod].edittime = new Date().toLocaleString()
    contentJson.attendance[selectedPeriod].absent = selectedUserId.absent

    if (isKlass) {
      // 학급별인 경우, 출석부와 같이 지각은 이전시간, 조퇴는 이후 시간, 결석/출석은 전시간에 반영
      if (type1 !== '결과') {
        // 결과는 다음시간에 영향을 미치지 않음.

        let loopStart = 0
        let loopEnd = -1

        if (type1 === '지각') {
          loopStart = 0
          loopEnd = selectedPeriod
        } else if (type1 === '조퇴') {
          loopStart = selectedPeriod
          loopEnd = lastPeriod
        } else if (type1 === '결석' || selectedUserId.absent === false) {
          loopStart = 0
          loopEnd = lastPeriod
        }

        for (let i = loopStart; i <= loopEnd; i++) {
          contentJson.attendance[i].type1 = type1
          contentJson.attendance[i].type2 = type2
          contentJson.attendance[i].absent = selectedUserId.absent
          contentJson.attendance[i].comment = selectedUserId.comment || ''
        }
      }
    } // 교사별인경우, 출석체크한 시간만 인정

    createAttendanceAbsent({
      attendanceDay: targetDay,
      absent: selectedUserId.absent,
      comment: selectedUserId.comment || '',
      type1: type1,
      type2: type2,
      content: JSON.stringify(contentJson),
      year: year,
      semester: semester,
      userId: selectedUserId.id,
      schoolId: me?.schoolId ? me.schoolId : 0,
      sendNoti: true,
      notiType: 'simple',
      period: lectureInfo.time,
    }).then(() => {
      setShowConfirmOpen(false)
      setSelectedUserId(defaultSelectedUser)
      setIsAttendanceModalOpen(false)
    })
  }

  const getAbsentString = () => {
    let type1 = ''
    let type2 = ''

    if (selectedUserId.absent) {
      type1 = !selectedUserId.type1 || selectedUserId.type1 === '' ? '기타' : selectedUserId.type1
      type2 = !selectedUserId.type2 || selectedUserId.type2 === '' ? '기타' : selectedUserId.type2

      let rangeStr = ''

      if (type1 === '지각') {
        rangeStr = `조회부터 ${selectedPeriod}교시까지 `
      } else if (type1 === '조퇴') {
        rangeStr = `${selectedPeriod}교시부터 종례까지 `
      } else if (type1 === '결석') {
        rangeStr = `전 교시 `
      }

      return `${rangeStr} ${type2}${type1} 처리하시겠습니까?`
    } else {
      return '전 교시 출석으로 처리하시겠습니까?'
    }
  }

  let seatPositionMap: { studentid: number; seat: string }[] = seatPosition

  let maxCol = 6
  let maxRow = 0

  // 설정된 자리 크기를 가져온다. to-do
  if (seatPositionMap.length > 0) {
    let tmpRow = 1
    let tmpCol = 1
    seatPositionMap.map((seatInfo: { studentid: number; seat: string }) => {
      const row = Math.floor(Number(seatInfo?.seat) / 10)
      const col = Number(seatInfo?.seat) % 10

      tmpRow = row > tmpRow ? row : tmpRow
      tmpCol = col > tmpCol ? col : tmpCol
    })

    maxCol = tmpCol + 1
    maxRow = tmpRow
  }

  let newSeatCount = 0
  // 누락된 학생 찾아서 넣기 start
  const getNewSeat = () => {
    const newRow = maxRow + Math.floor(newSeatCount / maxCol)
    const newCol = newSeatCount % maxCol

    newSeatCount++
    return newRow.toString() + newCol.toString()
  }

  students?.map((student: ResponseUserAttendanceDto) => {
    const rst = seatPositionMap?.find(
      (seatinfo: { studentid: number; seat: string }) => seatinfo.studentid === student.id,
    )

    // @ts-ignore ! type
    if (!student.expired && !student.not_attend) {
      if (rst === undefined) {
        seatPositionMap.push({
          studentid: student.id,
          seat: `${getNewSeat()}`,
        })
      }
    } else {
      if (rst) {
        seatPositionMap = seatPositionMap.filter((item) => item.studentid !== student.id)
      }
    }
  })
  maxRow = maxRow + Math.floor(newSeatCount / maxCol)

  // dom 에서 자리의 학생 가져오기
  const seatSudentMap = new Map<string, any>()
  const getStudentSeat = (row: number, col: number): ResponseUserAttendanceDto | undefined => {
    const seat = row.toString() + col.toString()

    let rststudent: ResponseUserAttendanceDto | undefined

    if (!seatSudentMap.has(seat)) {
      const rst = seatPositionMap?.find((seatinfo: any) => seatinfo.seat === seat)
      const studentId = rst?.studentid

      rststudent = students?.find((student: any) => student.id === studentId)

      if (rststudent?.expired) {
        rststudent = undefined
      }

      if (rststudent) {
        seatSudentMap.set(seat, rststudent)
      } else {
        // 자리설정은 되었지만 삭제된 학생
        seatPositionMap = seatPositionMap.filter((obj: any) => {
          return obj !== rst
        })
      }
    } else {
      rststudent = seatSudentMap.get(seat)
    }

    return rststudent
  }

  const [selSeat, setSelSeat] = useState('')

  const swapSeat = (row: number, col: number) => {
    const seat = row.toString() + col.toString()

    if (selSeat === '') {
      setSelSeat(seat)
    } else {
      // selSeat 와 seat 변경
      const selInfo = seatPositionMap?.find((seatinfo: any) => seatinfo.seat === selSeat)
      const nowInfo = seatPositionMap?.find((seatinfo: any) => seatinfo.seat === seat)

      if (selInfo !== undefined) selInfo.seat = seat
      if (nowInfo !== undefined) nowInfo.seat = selSeat

      saveStudentSeat()
      setSelSeat('')
    }
  }

  const swapSeatDrop = (selSeat: string, nowSeat: string) => {
    // selSeat 와 seat 변경
    const selInfo = seatPositionMap?.find((seatinfo: any) => seatinfo.seat === selSeat)
    const nowInfo = seatPositionMap?.find((seatinfo: any) => seatinfo.seat === nowSeat)

    if (selInfo !== undefined) selInfo.seat = nowSeat
    if (nowInfo !== undefined) nowInfo.seat = selSeat

    saveStudentSeat()
  }

  const saveStudentSeat = () => {
    if (seatEditMode) {
      const seatPosition = JSON.stringify(seatPositionMap)
      updateSeatPosition({ id: seatPositionId || 0, seatPosition })
    }
  }

  const checkSeatSize = (isCol: boolean, size: number) => {
    if ((isCol && maxCol > size) || (!isCol && maxRow + 1 > size)) {
      alert('학생이 설정되어 있는 자리는 삭제할 수 없습니다.')
      return false
    } else {
      return true
    }
  }

  const saveRole = () => {
    if (!roleEditMode) {
      return
    }

    const roleInfos: RequestUpsertStudentRoleDto[] = roleInfo.map((student: RoleInfoType, i: number) => {
      return {
        userId: student.id,
        role: student.role,
        job: student.job,
        displayOrder: i,
        year: year,
      }
    })

    updateStudentRole(roleInfos)
  }

  let from = -1

  const disabledSaveButton = false
  // selectedUserId.absent
  //   ? !selectedUserId.type1 || !selectedUserId.type2 //|| !selectedUserId.comment
  //   : false;

  useEffect(() => {
    if (maxRow >= 0) {
      setSeatSizeRows(groups[maxRow])
      setSeatSizeCols(groups[maxCol - 1]) // 인덱스가 0부터 시작하므로,
    }
  }, [maxRow])

  useEffect(() => {
    setRoleEditMode(false)
    setRoleInfo(tempRoleInfo)
  }, [students])

  return (
    <div className="scroll-box h-screen-8 overflow-y-auto md:h-screen">
      <div>
        <div className="flex flex-wrap justify-between">
          <div>{lectureInfo.room}</div>
          <div>{targetDay}</div>
        </div>

        <div className="my-3 flex flex-wrap justify-between font-semibold md:text-xl">
          <p className="flex flex-wrap">
            {currentLang === 'ko' ? <>{dayOfKorWeek(lectureInfo.day)}요일 </> : <>{dayOfEngWeek(lectureInfo.day)} </>}
            {lectureInfo.time === 0 ? (
              '조회'
            ) : (
              <>
                {' '}
                {lectureInfo.time + '교시'} |{' '}
                {lectureInfo.type === LectureType.SELECT ? (
                  <>
                    <div className="ml-2">분반</div>
                    <div
                      className="mx-2 rounded-sm bg-blue-100 px-2.5 text-sm text-blue-600 md:text-base"
                      onClick={() => setShowSubject(!showSubject)}
                    >
                      과목보기
                    </div>
                  </>
                ) : (
                  <>
                    {lectureInfo.subject}{' '}
                    {(lectureInfo.type === LectureType.FIX || lectureInfo.type === LectureType.MOVE) &&
                      !!lectureInfo.teacherName &&
                      '| ' + lectureInfo.teacherName + getNickName(lectureInfo?.teacherNickName)}
                  </>
                )}{' '}
              </>
            )}
          </p>
          <p className="shrink-0">
            {teacherName
              ? `${t('supervisor', '담당')} : ${teacherName}${teacherNickName} ${t('teacher', '선생님')}`
              : ''}
          </p>
        </div>

        {showSubject && lectureInfo.type === LectureType.SELECT && (
          <div className="mb-3 flex items-center justify-between rounded-lg border bg-gray-100 px-5">
            {lectureInfo.info}
          </div>
        )}

        <TabsNew defaultValue="all" value={showAbsent} onValueChange={(value) => setShowAbsent(value)} className="mb-4">
          <TabsList className="h-14 w-full p-2">
            <TabsTrigger value="all" className="h-10">
              {t('total_students', '총원')} : {students?.length - removeStudents.size} {t('count', '명')}
            </TabsTrigger>
            <TabsTrigger value="in" className="h-10">
              {t('attendance', '출석')} : {students?.length - removeStudents.size - studentsAbsent?.length}{' '}
              {t('count', '명')}
            </TabsTrigger>
            <TabsTrigger value="out" className="h-10">
              {t('non-attendance', '미출석')} : {studentsAbsent?.length} {t('count', '명')}
            </TabsTrigger>
            <TabsTrigger value="del" className="h-10">
              {t('expelled', '제적')}
            </TabsTrigger>
          </TabsList>
        </TabsNew>
      </div>

      <Tabs>
        {[
          { name: t('list', '목록'), type: contentType.list },
          { name: t('seats', '자리'), type: contentType.seat },
          { name: t('daily_report', '일일현황'), type: contentType.neis },
          { name: t('one_person_one_seat', '일인일역'), type: contentType.role },
        ].map((tab) => (
          <Tabs.Button
            key={tab.name}
            children={tab.name}
            selected={showSeat === tab.type}
            onClick={() => {
              setSeatEditMode(false)
              setRoleEditMode(false)
              setShowSeat(tab.type)
            }}
            className="md:flex-none md:px-5"
          />
        ))}
      </Tabs>

      <div className="md:scroll-box md:h-screen-13 md:overflow-x-hidden md:overflow-y-auto">
        {/* 출석부 tab */}
        {showSeat === contentType.list && (
          <div className="mb-10">
            {students
              ?.filter((student: ResponseUserAttendanceDto) =>
                showAbsent === 'all'
                  ? !removeStudents.get(student.id)
                  : showAbsent === 'in'
                    ? removeStudents.get(student.id) === false || absentOfSelectedPeriod.get(student.id) === false
                    : showAbsent === 'out'
                      ? absentOfSelectedPeriod.get(student.id)
                      : showAbsent === 'del'
                        ? removeStudents.get(student.id)
                        : true,
              )
              .sort((a, b) => {
                const aData = a?.klassname?.match(`([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반`)
                const bData = b?.klassname?.match(`([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반`)

                if (!aData || !bData) {
                  return 0
                }

                if (aData[1] && bData[1]) {
                  if (aData[1] === bData[1]) {
                    return Number(aData[2]) - Number(bData[2])
                  } else {
                    return Number(aData[1]) - Number(bData[1])
                  }
                } else {
                  return 0
                }
              })
              .map((student: ResponseUserAttendanceDto, i: number) => (
                <TimetableAtdCard
                  key={i}
                  student={student}
                  comment={absentCommentOfSelectedPeriod.get(student.id) || undefined}
                  attendance={!absentOfSelectedPeriod.get(student.id)}
                  setModalOpen={() => handleModalOpen(student)}
                />
              ))}

            <Divider />

            {(lectureInfo.time > 0 ||
              // && selectedLectureInfo.teacherId === me?.id
              (lectureInfo.time === 0 && teacherName === me?.name)) && (
              <div className="mt-4 flex w-full flex-col items-end justify-center">
                <div className="cursor-pointer">
                  {AttendanceCheckInfo ? (
                    <div className="mt-3 text-blue-500">
                      출석체크 완료 : {AttendanceCheckInfo.teacherName} (
                      <Time date={AttendanceCheckInfo.updatedAt} className="text-16 text-inherit" />)
                    </div>
                  ) : (
                    <Button onClick={() => confirmAttendanceCheck()} className="filled-primary">
                      {t('check_attendance', '출석체크 확인')}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {showSeat === contentType.neis && (
          <div className="scroll-box overflow-x-auto">
            <TimetableNeisForm students={userAttendance} lastPeriod={me?.school.lastPeriod || 8} />
          </div>
        )}

        {/* 자리 tab */}
        {showSeat === contentType.seat && (
          <div className="scroll-box overflow-x-auto">
            <table className="mx-auto border-separate py-4 text-center" style={{ borderSpacing: '0.5rem 0.5rem' }}>
              <tbody>
                {Array.from(Array(seatSizeRows.id).keys())
                  .reverse()
                  .map((r: number) => (
                    <tr key={r}>
                      {Array(seatSizeCols.id)
                        .fill(0)
                        .map((_: any, c: number) => (
                          <td
                            key={c}
                            className={`border border-gray-300 ${
                              selSeat === r.toString() + c.toString()
                                ? 'bg-blue-300'
                                : getStudentSeat(r, c)?.absent
                                  ? absentOfSelectedPeriod.get(getStudentSeat(r, c)?.id || 0)
                                    ? 'bg-red-300'
                                    : 'bg-white'
                                  : 'bg-gray-200'
                            } h-24 min-h-24 w-16 cursor-pointer rounded-md ${seatEditMode ? '' : 'not-draggable'}`}
                            draggable
                            onClick={() => {
                              if (seatEditMode) {
                                swapSeat(r, c)
                              } else {
                                const student = getStudentSeat(r, c)
                                student && handleModalOpen(student)
                              }
                            }}
                            onDragStart={(ev) => {
                              if (seatEditMode) {
                                ev.dataTransfer.setData('location', r.toString() + c.toString())
                              }
                            }}
                            onDrop={(ev) => {
                              if (seatEditMode) {
                                ev.preventDefault()
                                swapSeatDrop(ev.dataTransfer.getData('location'), r.toString() + c.toString())
                              }
                            }}
                            onDragOver={(ev) => {
                              if (seatEditMode) {
                                ev.preventDefault()
                              }
                            }}
                          >
                            {getStudentSeat(r, c) && (
                              <>
                                <p
                                  className="z-10 h-16 w-16 rounded-md bg-white bg-cover bg-top bg-no-repeat"
                                  // style={{
                                  //   backgroundImage: `url(${Constants.imageUrl}${getStudentSeat(r, c)?.profile})`,
                                  // }}
                                >
                                  <LazyLoadImage
                                    src={`${Constants.imageUrl}${getStudentSeat(r, c)?.profile}`}
                                    alt=""
                                    loading="lazy"
                                    className="h-full w-full rounded-sm object-cover"
                                    onError={(event: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                      const target = event.currentTarget
                                      target.onerror = null // prevents looping
                                      target.src = SvgUser as unknown as string
                                    }}
                                  />
                                </p>
                                <p>{getStudentSeat(r, c)?.name}</p>
                              </>
                            )}
                            {!getStudentSeat(r, c) && <p className="w-16"></p>}
                          </td>
                        ))}
                    </tr>
                  ))}
              </tbody>
            </table>

            <br />
            <div className="mb-6 flex w-full items-center justify-center space-x-2">
              <div className="rounded-md border border-gray-300 bg-gray-200 px-3 py-2">교탁</div>
            </div>

            {me?.name === teacherName ? (
              <div className="flex w-full flex-col items-center justify-center">
                {seatEditMode && (
                  <div className="flex items-center space-x-2">
                    <div className="flex min-w-max cursor-pointer items-center space-x-2">
                      <SelectMenus
                        allText="열 선택"
                        items={groups}
                        onChange={(e) => checkSeatSize(true, e.id) && setSeatSizeCols(e)}
                        value={seatSizeCols}
                      ></SelectMenus>
                      <div>열</div>
                    </div>

                    <div className="flex min-w-max cursor-pointer items-center space-x-2">
                      <SelectMenus
                        allText="줄 선택"
                        items={groups}
                        onChange={(e) => checkSeatSize(false, e.id) && setSeatSizeRows(e)}
                        value={seatSizeRows}
                      ></SelectMenus>
                      <div>줄</div>
                    </div>
                  </div>
                )}

                {me?.name === teacherName && (
                  <div className="mt-6 cursor-pointer">
                    <Button
                      onClick={() => {
                        setSelSeat('')
                        setSeatEditMode(!seatEditMode)
                      }}
                      className="filled-primary"
                    >
                      {seatEditMode ? '변경완료' : '자리변경'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">* 담임선생님만 수정이 가능합니다.</div>
            )}
            <br />
            <br />
          </div>
        )}

        {/* 일인일역 tab */}
        {showSeat === contentType.role && (
          <>
            <div className="-mx-4 mb-10">
              {roleInfo?.map((student: RoleInfoType, i: number) => (
                <div
                  key={i}
                  data-id={i}
                  draggable={roleEditMode}
                  className="w-full cursor-pointer"
                  onDragStart={(e) => {
                    if (roleEditMode) {
                      const item = e.currentTarget
                      from = Number(item.dataset.id)
                    }
                  }}
                  onDrop={(e) => {
                    if (roleEditMode) {
                      if (from >= 0) {
                        const item = e.currentTarget
                        const to = Number(item.dataset.id)

                        const tempList = roleInfo

                        tempList.splice(to, 0, tempList.splice(from, 1)[0])
                        setRoleInfo(tempList?.map((el) => el))
                      }
                    }
                  }}
                  onDragOver={(ev) => {
                    if (roleEditMode) {
                      ev.preventDefault()
                    }
                  }}
                >
                  <TimetableStudentRole
                    student={student}
                    editmode={roleEditMode}
                    order={i}
                    setOrder={(order: number, isUpDir: boolean) => {
                      const from = order
                      const to = isUpDir ? from - 1 : from + 1

                      if (to >= 0) {
                        const tempList = roleInfo

                        tempList.splice(to, 0, tempList.splice(from, 1)[0])
                        setRoleInfo(tempList?.map((el) => el))
                      }
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex w-full flex-col items-center justify-center">
              {myKlass && (
                <div className="mt-6 cursor-pointer">
                  <Button
                    onClick={() => {
                      if (roleEditMode) saveRole()
                      setRoleEditMode(!roleEditMode)
                    }}
                    className="filled-primary"
                  >
                    {roleEditMode ? '저장하기' : '수정하기'}
                  </Button>
                </div>
              )}
              {!myKlass && '* 담임선생님만 수정이 가능합니다. '}
            </div>
            <br />
            <br />
          </>
        )}
      </div>
      {/* 상태변경 */}

      <SuperModal modalOpen={isAttendanceModalOpen} setModalClose={() => submitAbsentUser(false)} ablePropragation>
        <Section className="space-y-2">
          <div className="text-lg font-semibold">출결관리</div>
          <div className="flex h-40">
            <div className="w-2/5 rounded-md bg-white bg-cover bg-no-repeat">
              <LazyLoadImage
                src={`${Constants.imageUrl}${selectedUserId.profile}`}
                alt=""
                loading="lazy"
                className="h-full w-full rounded-sm object-cover"
                onError={(event: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  const target = event.currentTarget
                  target.onerror = null // prevents looping
                  target.src = SvgUser as unknown as string
                }}
              />
            </div>
            <div className="ml-2 w-3/5">
              <div className="text-lg font-bold">
                {selectedUserId.klassname} {selectedUserId.student_number}번
              </div>
              <div className="truncate text-lg font-bold">
                <button onClick={() => pushModal(<StudentModal id={selectedUserId.id} />)}>
                  {selectedUserId.name}
                  {getNickName(selectedUserId.nick_name)}
                </button>
              </div>
              <div className="text-sm">{selectedUserId.role}</div>
              <div className="text-sm">{selectedUserId.job}</div>
              <div className="text-sm text-gray-700">희망학과 | {selectedUserId.major}</div>
              <div className="text-sm text-gray-700">장래희망 | {selectedUserId.hope}</div>
            </div>
          </div>

          <Divider marginY="0" />

          <TabsNew className="h-12">
            <TabsList className="h-12 w-full">
              <TabsTrigger
                value="attendance"
                className="h-10"
                onClick={() => setSelectedUserId((prev) => ({ ...prev, type1: '', type2: '', absent: false }))}
              >
                출석
              </TabsTrigger>
              <TabsTrigger
                value="absent"
                className="h-10"
                onClick={() => setSelectedUserId((prev) => ({ ...prev, absent: true }))}
              >
                미출석
              </TabsTrigger>
            </TabsList>
          </TabsNew>

          <Label.col>
            <Label.Text children="사유" />
            <TextInput
              placeholder="특기사항을 입력해주세요."
              value={selectedUserId.comment}
              onChange={(e) => setSelectedUserId((prev) => ({ ...prev, comment: e.target.value }))}
            />
          </Label.col>
          <div className="flex space-x-2">
            <Label.col className="flex-1">
              <Label.Text children="신고유형" />
              <Select.lg
                value={selectedUserId.type2}
                disabled={!selectedUserId.absent}
                onChange={(e) => setSelectedUserId({ ...selectedUserId, type2: e.target.value })}
              >
                <option selected hidden>
                  구분
                </option>
                {['인정', '질병', '미인정', '기타'].map((subject: string) => (
                  <option value={subject} key={subject}>
                    {subject}
                  </option>
                ))}
              </Select.lg>
            </Label.col>
            <Label.col className="flex-1">
              <Label.Text children="구분" />
              <Select.lg
                value={selectedUserId.type1}
                disabled={!selectedUserId.absent}
                onChange={(e) => setSelectedUserId({ ...selectedUserId, type1: e.target.value })}
              >
                <option selected hidden>
                  유형
                </option>
                {['결석', '지각', '조퇴', '결과', '기타'].map((subject: string) => (
                  <option value={subject} key={subject}>
                    {subject}
                  </option>
                ))}
              </Select.lg>
            </Label.col>
          </div>
          <div className={'text-sm'}>미출석 시 신고유형 / 구분 필수</div>
          <Button
            children="저장하기"
            onClick={() => {
              if (isKlass) {
                setIsAttendanceModalOpen(false)
                setShowConfirmOpen(true)
              } else {
                submitAbsentUser(true)
              }
            }}
            disabled={disabledSaveButton}
            className="filled-primary"
          />
          {me?.name === teacherName && (
            <div className="text-xs text-red-500">* 저장하면 보호자에게 출결상태 알림이 갑니다.</div>
          )}
        </Section>
      </SuperModal>

      <ConfirmModal
        head="출석상태 변경"
        message={getAbsentString()}
        isOpen={showConfirmOpen}
        onClose={() => setShowConfirmOpen(false)}
        onConfirm={() => submitAbsentUser(true)}
      />
    </div>
  )
}
