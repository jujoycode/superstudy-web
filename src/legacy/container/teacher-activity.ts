import { useEffect, useState } from 'react'
import { ResponseSubjectGroupDto } from '@/legacy/generated/model/responseSubjectGroupDto'
import { nameWithId } from '@/legacy/types'
import { getThisYear } from '@/legacy/util/time'

export function useTeacherActivity() {
  const [errorMessage] = useState('')
  const [subjectData] = useState<ResponseSubjectGroupDto[]>([])
  const [year, setYear] = useState(getThisYear())

  const [subject, setSubject] = useState<string>()
  const [subjectArray] = useState<string[]>([])
  const [selectedGroup, setSelectedGroup] = useState<nameWithId | null>(null)
  const [groupArray, setGroupArray] = useState<nameWithId[]>([])

  useEffect(() => {
    if (subject) {
      const filteredData: nameWithId[] = subjectData
        .filter((item) => item.subject === subject)
        .sort((a: ResponseSubjectGroupDto, b: ResponseSubjectGroupDto) => {
          const aData = a?.group.name?.match(`([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반`)
          const bData = b?.group.name?.match(`([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반`)

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
            return !a.group.name || !b.group.name ? -1 : a?.group?.name < b.group.name ? -1 : 1
          }

          return 0
        })
        .map((item) => ({ id: item.group.id, name: item.group.name }))

      setGroupArray([{ id: 0, name: '전체' }, ...filteredData])
    }
  }, [subject])

  return {
    subject,
    setSubject,
    selectedGroup,
    setSelectedGroup,
    subjectArray,
    groupArray,
    errorMessage,
    setYear,
    year,
  }
}
