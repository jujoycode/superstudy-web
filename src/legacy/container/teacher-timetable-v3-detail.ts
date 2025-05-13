import { useEffect, useState } from 'react'

import { UserContainer } from '@/legacy/container/user'
import {
  useUserGetAllTeachers,
  useTimetablev3GetTimetableByGroupId,
  useTimetablev3GetTimetableByTeacherId,
} from '@/legacy/generated/endpoint'
import type { ResponseTeachersDto } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'

export function useTeacherTimetableDetail(type = '', selDay?: Date) {
  const { me, isMeLoading } = UserContainer.useContext()

  const [groupId, setGroupId] = useState(0)
  const [teacher, setTeacher] = useState<ResponseTeachersDto>()
  const [teacherId, setTeacherId] = useState(0)

  useEffect(() => {
    if (!me) return
    setTeacherId(me.id)
    setGroupId(me.klassGroupId ?? 0)
  }, [me])

  const { data: teachers = [] } = useUserGetAllTeachers<ResponseTeachersDto[]>()

  const {
    data: timetableV3Klass, // 학급별 시간표 V3
    isLoading: isTimetableLoadingV3Klass,
    error: errorTimetableV3Klass,
  } = useTimetablev3GetTimetableByGroupId(
    groupId,
    { date: DateUtil.formatDate(selDay || new Date(), DateFormat['YYYY-MM-DD']) },
    { query: { enabled: !!groupId } },
  )

  const {
    data: timetableV3Teacher, // 교사별 시간표 V3
    isLoading: isTimetableLoadingV3Teacher,
    error: errorTimetableV3Teacher,
  } = useTimetablev3GetTimetableByTeacherId(
    teacherId,
    { type, date: DateUtil.formatDate(selDay || new Date(), DateFormat['YYYY-MM-DD']) },
    { query: { enabled: !!teacherId } },
  )

  function changeTeacher(teacherId: number) {
    setTeacherId(teacherId)
    setTeacher(teachers.find((teacher) => teacher.id === teacherId))
  }

  function changeKlass(klassId: number) {
    setGroupId(klassId)
  }

  return {
    teachers: teachers
      .reduce((acc, current) => {
        if (!acc.find((item) => item.id === current.id)) {
          acc.push(current)
        }
        return acc
      }, [] as ResponseTeachersDto[])
      .sort((a, b) => a.name.localeCompare(b.name)),
    groupId,
    teacher,
    teacherId,
    setTeacherId,
    timetableV3Klass,
    timetableV3Teacher,
    isLoading: isTimetableLoadingV3Teacher || isTimetableLoadingV3Klass || isMeLoading,
    error: errorTimetableV3Teacher || errorTimetableV3Klass,
    changeTeacher,
    changeKlass,
  }
}
