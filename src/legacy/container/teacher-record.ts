import { useState } from 'react'
import {
  useLifeRecordDownloadRecordActivity,
  useLifeRecordDownloadRecordSummary,
  useStudentGroupsFindByGroupId,
} from '@/legacy/generated/endpoint'
import { Group } from '@/legacy/generated/model'
import { downloadExcel } from '@/legacy/util/download-excel'
import { GroupContainer } from './group'

export function useTeacherRecord() {
  const { teacherSubjects, errorGroups } = GroupContainer.useContext()
  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(teacherSubjects[0]?.group)

  const uniqueGroups = Array.from(new Set(teacherSubjects.map((item) => JSON.stringify(item.group))))
    .map((groupString) => JSON.parse(groupString))
    .sort((a, b) => {
      const aData = a?.name?.match(`([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반`)
      const bData = b?.name?.match(`([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반`)

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

  const { data: studentGroups } = useStudentGroupsFindByGroupId(selectedGroup?.id ?? 0, {
    query: {
      enabled: !!selectedGroup?.id,
    },
  })

  const { refetch: refetchDownloadRecordSummary } = useLifeRecordDownloadRecordSummary(selectedGroup?.id ?? 0, {
    query: {
      enabled: false,
      onSuccess: (data) => {
        downloadExcel(data, `생활기록부_총정리_${selectedGroup?.name}`)
      },
    },
  })

  const { refetch: refetchDownloadRecordActivity } = useLifeRecordDownloadRecordActivity(selectedGroup?.id ?? 0, {
    query: {
      enabled: false,
      onSuccess: (data) => {
        downloadExcel(data, `생활기록부_활동내역_${selectedGroup?.name}`)
      },
    },
  })

  //     link.download = `생활기록부_활동내역_${selectedGroup?.name}}`;
  const downloadRecordSummary = () => {
    refetchDownloadRecordSummary()
  }

  //     link.download = `생활기록부_총정리_${selectedGroup?.name}`;
  const downloadRecordActivity = () => {
    refetchDownloadRecordActivity()
  }

  return {
    studentGroups,
    selectedGroup,
    setSelectedGroup,
    uniqueGroups,
    errorGroups,
    downloadRecordSummary,
    downloadRecordActivity,
  }
}
