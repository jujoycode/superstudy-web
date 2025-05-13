import { GroupContainer } from '@/legacy/container/group'
import { UserContainer } from '@/legacy/container/user'
import { useTimetablev3GetTimetableByTeacherId } from '@/legacy/generated/endpoint'
import type { ResponseGroupDto, ResponseSubjectGroupDto, ResponseTimetableV3Dto } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { getThisYear } from '@/legacy/util/time'

export interface TeacharAllGroup {
  id: number
  type: string
  name: string
  subject: string | null
  room: string | null
  studentCount: number | null
  origin: 'KLASS' | 'USER' | 'TIMETABLE'
  originKor: string
}

export function useTeacherAllGroup() {
  const { me } = UserContainer.useContext()
  const teacherId = me?.id || 0

  const allGroups: TeacharAllGroup[] = []

  const { teacherKlubGroups, teacherSubjects, teacherKlassGroups } = GroupContainer.useContext()

  const addGroup = (newItem: TeacharAllGroup) => {
    const exist = allGroups.find((item) => item.id === newItem.id)

    if (!exist) {
      allGroups.push(newItem)
    }
  }

  const { data: timetableV3Teacher } = useTimetablev3GetTimetableByTeacherId(
    teacherId,
    {
      type: '',
      date: DateUtil.formatDate(new Date(), DateFormat['YYYY-MM-DD']),
    },
    {
      query: {
        queryKey: [teacherId],
        enabled: !!teacherId,
      },
    },
  )

  timetableV3Teacher?.map((group: ResponseTimetableV3Dto) => {
    addGroup({
      id: group.groupId,
      type: group.type,
      name: group.groupName || '',
      subject: group.subject,
      room: group.room,
      studentCount: null,
      origin: 'TIMETABLE',
      originKor: '강의시간표 그룹',
    })
  })

  teacherKlubGroups
    .filter((group) => group.year === getThisYear())
    .map((group: ResponseGroupDto) => {
      addGroup({
        id: group.id,
        type: group.type,
        name: group.name || '',
        subject: group.teacherGroupSubject,
        room: group.teacherGroupRoom,
        studentCount: group.studentCount,
        origin: 'USER',
        originKor: '사용자정의 그룹',
      })
    })

  teacherKlassGroups
    .filter((group) => group.year === getThisYear())
    .map((group: ResponseGroupDto) => {
      addGroup({
        id: group.id,
        type: group.type,
        name: group.name || '',
        subject: '담임',
        room: group.name,
        studentCount: group.studentCount,
        origin: 'KLASS',
        originKor: '학급소속',
      })
    })

  teacherSubjects
    .filter((item) => item.group.type === 'KLASS' && item.group.year === getThisYear())
    .map((item: ResponseSubjectGroupDto) => {
      addGroup({
        id: item.group.id,
        type: item.group.type,
        name: item.group.name || '',
        subject: item.subject,
        room: item.group.name,
        studentCount: null,
        origin: 'KLASS',
        originKor: '학급소속 그룹',
      })
    })

  allGroups.sort((a, b) => {
    if (a.name < b.name) {
      return -1
    }
    if (a.name > b.name) {
      return 1
    }
    return 0
  })

  return {
    allGroups,
  }
}
