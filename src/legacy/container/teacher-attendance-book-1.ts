import { useEffect, useState } from 'react'
import readXlsxFile, { type Row } from 'read-excel-file'

import {
  useAttendanceAttendanceCheck,
  useAttendanceCreateAttendanceAbsent,
  useAttendanceDownloadAbsents,
  useAttendanceFindAttendanceAbsent,
} from '@/legacy/generated/endpoint'
import type { RequestCreateAttendanceAbsentDto } from '@/legacy/generated/model'

export const DayOfWeekEnum = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
}

export function useTeacherAttendanceBook1({
  groupId,
  year,
  semester,
  startDate,
  endDate,
}: {
  groupId?: number
  year: number
  semester: number
  startDate: string
  endDate: string
}) {
  const [rows, setRows] = useState<Row[]>()

  const { data: attendanceBookData, refetch: refetchAttendanceBookData } = useAttendanceDownloadAbsents(
    {
      groupId: groupId || -1,
      year,
      semester,
      startDate,
      endDate,
    },
    {
      query: {
        queryKey: ['attendanceBookData', groupId, year, semester, startDate, endDate],
        enabled: !!groupId,
      },
    },
  )

  const { data: attendanceAbsentData, refetch: refetchAttendanceAbsentData } = useAttendanceFindAttendanceAbsent(
    {
      groupId: groupId as number,
      year,
      semester,
      startDate,
      endDate,
    },
    {
      query: {
        enabled: !!groupId,
      },
    },
  )

  const { mutate: absentMutate } = useAttendanceCreateAttendanceAbsent({
    mutation: {
      onSuccess: () => {
        refetchAttendanceBookData()
        refetchAttendanceAbsentData()
      },
    },
  })

  const handleAbsent = ({
    attendanceDay,
    absent,
    comment,
    type1,
    type2,
    content,
    year,
    semester,
    userId,
    schoolId,
    sendNoti,
    notiType,
  }: RequestCreateAttendanceAbsentDto) => {
    const absentData = {
      attendanceDay,
      absent,
      comment,
      type1,
      type2,
      content,
      year,
      semester,
      userId,
      schoolId,
      sendNoti,
      notiType,
    }
    // @ts-ignore 기존 소스 오류
    absentMutate({ data: absentData })
  }

  useEffect(() => {
    if (attendanceBookData) {
      new Promise((r) => r(attendanceBookData))
        .then((blob) => readXlsxFile(blob as Blob))
        .then((rows) => setRows(rows))
        .catch((e) => console.log(e))
    }
  }, [attendanceBookData])

  const { mutateAsync: createAttendanceCheckMutateAsync } = useAttendanceAttendanceCheck()

  const createAttendanceCheck = (lectureId: number, checkDay: string) => {
    return createAttendanceCheckMutateAsync({
      data: {
        lectureId,
        checkDay,
      },
    })
  }

  return {
    rows,
    attendanceAbsentData,
    handleAbsent,
    createAttendanceCheck,
  }
}
